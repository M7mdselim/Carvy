import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { CreditCard, Shield, Edit2, Save, Truck, CreditCard as CreditCardIcon } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';
import { CouponInput } from '../components/CouponInput';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/ui/select';

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
    lastName: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [discount, setDiscount] = useState<{
    percentage?: number;
    amount?: number;
  }>({});

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=checkout');
      return;
    }

    if (user && userProfile && !profileLoaded && !isEditingPhone) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        phone: userProfile.phoneNumber || '',
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
      }));
      setProfileLoaded(true);
    }
  }, [user, userProfile, navigate, profileLoaded, isEditingPhone]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentMethodChange = (value) => {
    setPaymentMethod(value);
  };

  const handleCityChange = (value: string) => {
    setFormData(prev => ({ ...prev, city: value }));
  };

  const handleUpdatePhone = async () => {
    if (!user) return;

    try {
      const { error } = await supabase.auth.updateUser({
        data: { phone_number: formData.phone }
      });

      if (error) throw error;

      toast.success(t('phoneUpdated'));
      setIsEditingPhone(false);
    } catch (error) {
      console.error("Error updating phone number:", error);
      toast.error(t('phoneUpdateError'));
    }
  };

  const handleApplyCoupon = (discountData: { percentage?: number, amount?: number }) => {
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
    const shippingCost = 70.00;
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

    try {
      setIsSubmitting(true);

      const discountAmount = calculateDiscountAmount();
      const totalWithShipping = calculateFinalTotal();

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postal_code: formData.postalCode,
          total_amount: totalWithShipping,
          discount_amount: discountAmount,
          status: 'pending',
          payment_method: paymentMethod
        })
        .select()
        .single();

      if (orderError) throw orderError;

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

      if (itemsError) throw itemsError;

      clearCart();
      toast.success(t('orderSuccess'));
      navigate('/');
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error(t('orderError'));
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
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <h3>{product.name}</h3>
                            <p className="ml-4">{(product.price * quantity).toFixed(2)}</p>
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
                  <div className="text-base font-medium text-gray-900">{total.toFixed(2)}</div>
                </div>
                
                {(discount.percentage || discount.amount) && (
                  <div className="flex items-center justify-between text-green-600">
                    <div className="text-base font-medium">
                      {t('discount')} {discount.percentage ? `(${discount.percentage}%)` : ''}
                    </div>
                    <div className="text-base font-medium">-{calculateDiscountAmount().toFixed(2)}</div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="text-base font-medium text-gray-900">{t('shipping')}</div>
                  <div className="text-base font-medium text-gray-900">70.00</div>
                </div>
                
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <div className="text-lg font-semibold text-gray-900">{t('total')}</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {calculateFinalTotal().toFixed(2)} EGP
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
                <h2 className="text-2xl font-semibold mb-6">{t('contactInformation')}</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">{t('emailAddress')}</Label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">{t('phoneNumber')}</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="tel"
                        id="phone"
                        name="phone"
                        placeholder="0100000000"
                        value={formData.phone}
                        onChange={(e) => {
                          if (!isEditingPhone) {
                            setIsEditingPhone(true);
                          }
                          handleInputChange(e);
                        }}
                        className={isEditingPhone ? "border-indigo-300 ring-1 ring-indigo-500" : ""}
                        required
                      />
                      {isEditingPhone ? (
                        <Button 
                          type="button"
                          onClick={handleUpdatePhone}
                          variant="outline"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {t('save')}
                        </Button>
                      ) : (
                        <Button 
                          type="button"
                          onClick={() => setIsEditingPhone(true)}
                          variant="outline"
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          {t('edit')}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-6">{t('shippingInformation')}</h2>
                <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="firstName">{t('firstName')}</Label>
                    <Input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">{t('lastName')}</Label>
                    <Input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="address">{t('address')}</Label>
                    <Input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">{t('city')}</Label>
                    <Select 
                      value={formData.city} 
                      onValueChange={handleCityChange}
                    >
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder={t('selectCity')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cairo">{t('cairo')}</SelectItem>
                        <SelectItem value="giza">{t('giza')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="postalCode">{t('postalCode')} <span className="text-gray-400 text-xs">{t('optional')}</span></Label>
                    <Input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="bg-white p-8 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-6">{t('paymentMethod')}</h2>
                <div className="space-y-4">
                  <div 
                    className={`flex items-center space-x-3 border p-4 rounded-md hover:bg-gray-50 cursor-pointer ${paymentMethod === 'credit_card' ? 'border-indigo-500 bg-indigo-50' : ''}`}
                    onClick={() => setPaymentMethod('credit_card')}
                  >
                    <input
                      type="radio"
                      id="credit_card"
                      name="paymentMethod"
                      value="credit_card"
                      checked={paymentMethod === 'credit_card'}
                      onChange={() => setPaymentMethod('credit_card')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <Label htmlFor="credit_card" className="flex items-center gap-3 cursor-pointer">
                      <CreditCardIcon className="h-5 w-5 text-indigo-600" />
                      <span className="font-medium">{t('creditCard')}</span>
                    </Label>
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
                  <h2 className="text-2xl font-semibold mb-6">{t('paymentInformation')}</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">{t('cardNumber')}</Label>
                      <Input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        className="mt-1"
                        required={paymentMethod === 'credit_card'}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate">{t('expiryDate')}</Label>
                        <Input
                          type="text"
                          id="expiryDate"
                          name="expiryDate"
                          placeholder="MM/YY"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          className="mt-1"
                          required={paymentMethod === 'credit_card'}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          type="text"
                          id="cvv"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          className="mt-1"
                          required={paymentMethod === 'credit_card'}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
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
