
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'
import { CreditCard, Shield } from 'lucide-react'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'

export default function Checkout() {
  const { items, total, clearCart } = useCart()
  const navigate = useNavigate()
  const { user, getUserProfile } = useAuth()
  const userProfile = getUserProfile()
  
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
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate('/login?redirect=checkout')
      return
    }
    
    // Pre-fill form with user data if available
    if (user && userProfile) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        phone: userProfile.phoneNumber || '',
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
      }))
    }
  }, [user, userProfile, navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (items.length === 0) {
      toast.error("Your cart is empty")
      return
    }
    
    if (!user) {
      toast.error("You must be logged in to checkout")
      navigate('/login?redirect=checkout')
      return
    }
    
    try {
      setIsSubmitting(true)
      
      // Calculate shipping cost and total
      const shippingCost = 70.00
      const totalWithShipping = total + shippingCost
      
      // Create the order
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
          total_amount: totalWithShipping
        })
        .select()
        .single()
      
      if (orderError) throw orderError
      
      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        price: item.product.price
      }))
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)
      
      if (itemsError) throw itemsError
      
      // Clear cart and redirect
      clearCart()
      toast.success("Order placed successfully!")
      navigate('/')
    } catch (error) {
      console.error("Error placing order:", error)
      toast.error("Failed to place order. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    navigate('/')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-5">

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-lg shadow sticky top-8">
              <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>
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
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <div className="text-base font-medium text-gray-900">Subtotal</div>
                  <div className="text-base font-medium text-gray-900">{total.toFixed(2)}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-base font-medium text-gray-900">Shipping</div>
                  <div className="text-base font-medium text-gray-900">70.00</div>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <div className="text-lg font-semibold text-gray-900">Total</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {(total + 70.00).toFixed(2)}  EGP
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
                <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email address</Label>
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
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="0100000000"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="mt-1"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-6">Shipping Information</h2>
                <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="firstName">First name</Label>
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
                    <Label htmlFor="lastName">Last name</Label>
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
                    <Label htmlFor="address">Address</Label>
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
                    <Label htmlFor="city">City</Label>
                    <Input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal code</Label>
                    <Input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="mt-1"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-6">Payment Information</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Card number</Label>
                    <Input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate">Expiry date</Label>
                      <Input
                        type="text"
                        id="expiryDate"
                        name="expiryDate"
                        placeholder="MM/YY"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        className="mt-1"
                        required
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
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : 'Complete Order'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
