
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';

import { CreditCard, Shield, Truck, CreditCard as CreditCardIcon, AlertTriangle, Info ,ImageIcon } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';
import { CouponInput } from '../components/CouponInput';
import { AddressForm } from '../components/checkout/AddressForm';
import { Address } from '../types';
import { formatCurrency } from '../lib/utils';
import { Alert } from '../components/ui/alert';

export default function Checkout() {
  const { t, language } = useLanguage();
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const { user, getUserProfile } = useAuth();
  const userProfile = getUserProfile();

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: ''
  });

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [discount, setDiscount] = useState<{
    percentage?: number;
    amount?: number;
    couponId?: string;
    couponCode?: string;
    ownerId?: string;
    ownerBenefitValue?: number;
    ownerBenefitType?: string;
  }>({});
  const [shippingCost, setShippingCost] = useState<number>(70.00);

  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=checkout');
      return;
    }

    if (user && userProfile && !profileLoaded) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        phone: userProfile.phoneNumber || '',
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
      }));
      setProfileLoaded(true);
    }
  }, [user, userProfile, navigate, profileLoaded]);

  useEffect(() => {
    if (selectedAddress && !formData.phone) {
      setFormData(prev => ({
        ...prev,
        phone: selectedAddress.phone
      }));
    }
  }, [selectedAddress, formData.phone]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCardDetailsChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentMethodChange = (value) => {
    setPaymentMethod(value);
  };

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
  };

  const handleApplyCoupon = (discountData: { 
    percentage?: number, 
    amount?: number, 
    couponId?: string, 
    couponCode?: string,
    ownerId?: string,
    ownerBenefitValue?: number,
    ownerBenefitType?: string
  }) => {
    setDiscount(discountData);
  };

  const calculateDiscountAmount = () => {
    if (discount.amount) {
      return discount.amount;
    } else if (discount.percentage) {
      return (total * discount.percentage) / 100;
    }
    return 0;
  };

  const calculateFinalTotal = () => {
    const discountAmount = calculateDiscountAmount();
    return total + shippingCost - discountAmount;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error(t('cartEmpty'));
      return;
    }

    if (!user) {
      toast.error(t('loginRequired'));
      navigate('/login?redirect=checkout');
      return;
    }

    if (!selectedAddress) {
      toast.error(t('pleaseSelectAddress'));
      return;
    }

    const stockCheckPromises = items.map(async (item) => {
      const { data, error } = await supabase
        .from('products')
        .select('stock')
        .eq('id', item.product.id)
        .single();
      
      if (error) throw error;
      
      if (!data || data.stock < item.quantity) {
        return {
          product: item.product.name,
          available: data ? data.stock : 0,
          requested: item.quantity,
          hasEnough: false
        };
      }
      
      return { hasEnough: true };
    });
    
    try {
      const stockResults = await Promise.all(stockCheckPromises);
      const insufficientStock = stockResults.filter(result => !result.hasEnough);
      
      if (insufficientStock.length > 0) {
        const firstItem = insufficientStock[0];
        toast.error(`Not enough stock for "${firstItem.product}". Available: ${firstItem.available}, Requested: ${firstItem.requested}`);
        return;
      }

      setIsSubmitting(true);

      const discountAmount = calculateDiscountAmount();
      const finalTotal = calculateFinalTotal();
      
      const phoneToUse = formData.phone || selectedAddress.phone;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: phoneToUse,
          address: `${selectedAddress.building || ''} ${selectedAddress.street}, ${selectedAddress.district || ''}, ${selectedAddress.city}`,
          city: selectedAddress.city,
          postal_code: selectedAddress.postal_code || '',
          total_amount: finalTotal,
          discount_amount: discountAmount,
          shipping_cost: shippingCost,
          status: 'pending',
          payment_method: paymentMethod,
          coupon_id: discount.couponId || null,
          coupon_code: discount.couponCode || null
        })
        .select()
        .single();

      if (orderError) {
        console.error("Order creation error:", orderError);
        throw new Error(orderError.message || "Failed to create order");
      }

      if (!order || !order.id) {
        throw new Error("Order created but no ID returned");
      }

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        price: item.product.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error("Order items error:", itemsError);
        throw new Error(itemsError.message || "Failed to add order items");
      }

      const stockUpdatePromises = items.map(item => 
        supabase
          .rpc('decrement_stock', {
            row_id: item.product.id,
            amount: item.quantity
          })
      );
      
      await Promise.all(stockUpdatePromises);

      if (discount.couponId && discount.ownerId && discount.ownerBenefitValue && discount.ownerBenefitValue > 0) {
        console.log(`Processing coupon ${discount.couponId} for order ${order.id} with benefit ${discount.ownerBenefitValue}`);
        
        try {
          const { error: usageError } = await supabase
            .from('coupon_usage')
            .insert({
              coupon_id: discount.couponId,
              user_id: user.id,
              order_id: order.id
            });
            
          if (usageError) {
            console.error("Error recording coupon usage:", usageError);
          }
          
          const { data: balanceData, error: balanceError } = await supabase
            .rpc('increment_balance', {
              row_id: discount.ownerId,
              amount: discount.ownerBenefitValue
            });
            
          if (balanceError) {
            console.error("Error incrementing owner balance:", balanceError);
            toast.error("Error applying coupon benefit");
          } else {
            console.log("Successfully processed coupon owner benefit:", balanceData);
            toast.success("Coupon benefit applied successfully");
            
            const { error: couponUpdateError } = await supabase
              .from('coupons')
              .update({ times_used: discount.couponCode ? discount.couponCode.length : 0 + 1 })
              .eq('id', discount.couponId);
              
            if (couponUpdateError) {
              console.error("Error updating coupon usage counter:", couponUpdateError);
            }
          }
        } catch (couponError) {
          console.error("Error processing coupon benefit:", couponError);
          toast.error("Failed to process coupon benefit");
        }
      }

      clearCart();
      toast.success(t('orderSuccess'));
      navigate('/orders');
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error(t('orderError') + (error instanceof Error ? `: ${error.message}` : ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-5">

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-lg shadow sticky top-8">
              <h2 className="text-2xl font-semibold mb-6">{t('orderItems')}</h2>
              <div className="flow-root">
                <ul className="-my-4 divide-y divide-gray-200">
                  {items.map(({ product, quantity }) => (
                    <li key={product.id} className="flex py-4">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover object-center"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gray-100">
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <h3>{product.name}</h3>
                            <p className="ml-4">{formatCurrency(product.price * quantity)}</p>
                          </div>
                        </div>
                        <div className="flex flex-1 items-end justify-between text-sm">
                          <p className="text-gray-500">Qty {quantity}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 space-y-4">
                <div className="border-t border-gray-200 pt-4">
                  <CouponInput onApply={handleApplyCoupon} />
                </div>
                
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <div className="text-base font-medium text-gray-900">{t('subtotal')}</div>
                  <div className="text-base font-medium text-gray-900">{formatCurrency(total)}</div>
                </div>
                
                {(discount.percentage || discount.amount) && (
                  <div className="flex items-center justify-between text-green-600">
                    <div className="text-base font-medium">
                      {t('discount')} {discount.percentage ? `(${discount.percentage}%)` : ''}
                    </div>
                    <div className="text-base font-medium">-{formatCurrency(calculateDiscountAmount())}</div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="text-base font-medium text-gray-900">{t('shipping')}</div>
                  <div className="text-base font-medium text-gray-900">{formatCurrency(shippingCost)}</div>
                </div>
                
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <div className="text-lg font-semibold text-gray-900">{t('total')}</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(calculateFinalTotal())}
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Shield className="h-5 w-5 text-gray-400" />
                  <span>Secure checkout with SSL encryption</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <span>All major credit cards accepted</span>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-white p-8 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-6 border-b pb-2">{t('contactInformation')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <Label htmlFor="firstName" className="text-gray-700 font-medium block mb-1.5">{t('firstName')}</Label>
                    <Input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-gray-700 font-medium block mb-1.5">{t('lastName')}</Label>
                    <Input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-gray-700 font-medium block mb-1.5">{t('emailAddress')}</Label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-gray-700 font-medium block mb-1.5">{t('phoneNumber')}</Label>
                    <Input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="0100000000"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Shipping Information - using AddressForm component */}
              <div className="bg-white p-8 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-6 border-b pb-2">{t('shippingInformation')}</h2>
                <AddressForm 
                  onAddressSelect={handleAddressSelect}
                  selectedAddress={selectedAddress}
                  hidePhoneField={true}
                  onShippingCostChange={setShippingCost}
                />
              </div>

              {/* Payment Method Selection */}
              <div className="bg-white p-8 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-6 border-b pb-2">{t('paymentMethod')}</h2>
                <div className="space-y-4 mt-4">
                  <div 
                    className={`relative flex items-center space-x-3 border p-4 rounded-md hover:bg-gray-50 cursor-pointer ${paymentMethod === 'credit_card' ? 'border-indigo-500 bg-indigo-50' : 'opacity-60'}`}
                    onClick={() => toast.info(t('creditCardComingSoon'))}
                  >
                    <input
                      type="radio"
                      id="credit_card"
                      name="paymentMethod"
                      value="credit_card"
                      checked={paymentMethod === 'credit_card'}
                      onChange={() => {}}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      disabled
                    />
                    <Label htmlFor="credit_card" className="flex items-center gap-3 cursor-pointer">
                      <CreditCardIcon className="h-5 w-5 text-indigo-600" />
                      <span className="font-medium">{t('creditCard')}</span>
                    </Label>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded">
                      {t('creditCardComingSoon')}
                    </div>
                  </div>
                  
                  <div 
                    className={`flex items-center space-x-3 border p-4 rounded-md hover:bg-gray-50 cursor-pointer ${paymentMethod === 'cash_on_delivery' ? 'border-indigo-500 bg-indigo-50' : ''}`}
                    onClick={() => setPaymentMethod('cash_on_delivery')}
                  >
                    <input
                      type="radio"
                      id="cash_on_delivery"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={paymentMethod === 'cash_on_delivery'}
                      onChange={() => setPaymentMethod('cash_on_delivery')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <Label htmlFor="cash_on_delivery" className="flex items-center gap-3 cursor-pointer">
                      <Truck className="h-5 w-5 text-indigo-600" />
                      <span className="font-medium">{t('cashOnDelivery')}</span>
                    </Label>
                  </div>
                </div>
              </div>

              {/* Conditional Payment Information Section */}
              {paymentMethod === 'credit_card' && (
                <div className="bg-white p-8 rounded-lg shadow">
                  <h2 className="text-2xl font-semibold mb-6 border-b pb-2">{t('paymentInformation')}</h2>
                  <div className="space-y-6 mt-4">
                    <div>
                      <Label htmlFor="cardNumber" className="text-gray-700 font-medium block mb-1.5">{t('cardNumber')}</Label>
                      <Input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        value={cardDetails.cardNumber}
                        onChange={handleCardDetailsChange}
                        className="w-full"
                        required={paymentMethod === 'credit_card'}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate" className="text-gray-700 font-medium block mb-1.5">{t('expiryDate')}</Label>
                        <Input
                          type="text"
                          id="expiryDate"
                          name="expiryDate"
                          placeholder="MM/YY"
                          value={cardDetails.expiryDate}
                          onChange={handleCardDetailsChange}
                          className="w-full"
                          required={paymentMethod === 'credit_card'}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv" className="text-gray-700 font-medium block mb-1.5">CVV</Label>
                        <Input
                          type="text"
                          id="cvv"
                          name="cvv"
                          value={cardDetails.cvv}
                          onChange={handleCardDetailsChange}
                          className="w-full"
                          required={paymentMethod === 'credit_card'}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!selectedAddress && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-800 text-sm">
                    {t('saveAddressFirst')}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting || !selectedAddress}
                className="w-full py-6 rounded-lg mt-6 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 shadow-lg hover:shadow-xl"
                size="lg"
              >
                {isSubmitting ? t('processing') : t('completeOrder')}
              </Button>
              
             
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
