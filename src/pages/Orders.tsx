
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders, Order, OrderItem } from '../hooks/useOrders';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import { ShoppingBagIcon, TruckIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';
import { useCart } from '../hooks/useCart';
import { toast } from 'sonner';
import { Product } from '../types';

export default function Orders() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { orders, loading, error } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { addItem, clearCart } = useCart();
  const [reordering, setReordering] = useState(false);

  if (!user) {
    navigate('/login?redirect=orders');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">{error}</h3>
          <button
            onClick={() => navigate('/')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {t('returnHome')}
          </button>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'processing':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'shipped':
        return <TruckIcon className="h-5 w-5 text-indigo-500" />;
      case 'delivered':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleReorder = async (order: Order) => {
    try {
      setReordering(true);
      // Clear the current cart first
      clearCart();
      
      // Need to fetch product details for each item in the order
      const productPromises = order.items?.map(async (item) => {
        const { data: productData } = await supabase
          .from('products')
          .select(`
            *,
            categories (name),
            product_car_models (
              car_models (
                make,
                model,
                year_start,
                year_end
              )
            )
          `)
          .eq('id', item.product_id)
          .eq('status', 'active') // Only add active products
          .gt('stock', 0) // Only add products in stock
          .single();
        
        return { productData, quantity: item.quantity };
      }) || [];
      
      const productResults = await Promise.all(productPromises);
      
      // Add available products to cart
      let availableProductsCount = 0;
      for (const result of productResults) {
        if (result.productData) {
          // Transform the Supabase product data to match our Product type
          const formattedProduct: Product = {
            id: result.productData.id,
            shopId: result.productData.shop_id,
            name: result.productData.name,
            description: result.productData.description || '',
            price: result.productData.price,
            image: result.productData.image || 'https://via.placeholder.com/500',
            category: result.productData.categories?.name || 'Uncategorized',
            compatibility: result.productData.product_car_models?.map((pcm: any) => {
              const car = pcm.car_models;
              return car ? `${car.make} ${car.model} (${car.year_start}${car.year_end ? `-${car.year_end}` : '+'})` : '';
            }) || [],
            stock: result.productData.stock
          };
          
          // Add the product to cart
          addItem(formattedProduct);
          
          // Apply the correct quantity after adding the item
          if (result.quantity > 1) {
            for (let i = 1; i < result.quantity; i++) {
              addItem(formattedProduct);
            }
          }
          
          availableProductsCount++;
        }
      }
      
      // Navigate to checkout or show a message
      if (availableProductsCount > 0) {
        toast.success(availableProductsCount === productResults.length
          ? t('reorderSuccess')
          : t('reorderPartial'));
        navigate('/checkout');
      } else {
        toast.error(t('reorderNoProducts'));
      }
    } catch (error) {
      console.error('Error reordering:', error);
      toast.error(t('reorderError'));
    } finally {
      setReordering(false);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-8 text-center">
          <ShoppingBagIcon className="mx-auto h-16 w-16 text-gray-400" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">{t('noOrders')}</h2>
          <p className="mt-2 text-gray-500">{t('startShopping')}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {t('continueShopping')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('myOrders')}</h1>
        
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Orders List */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <li
                    key={order.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition ${selectedOrder?.id === order.id ? 'bg-indigo-50' : ''}`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{t('orderNumber')}{order.id.substring(0, 8)}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {getStatusIcon(order.status)}
                        <span className="ml-2 text-sm font-medium">
                          {t(order.status)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between text-sm">
                      <span className="text-gray-500">
                        {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                      </span>
                      <span className="font-medium">
                        {order.total_amount.toFixed(2)} EGP
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Order Details */}
          <div className="lg:col-span-2">
            {selectedOrder ? (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">
                      {t('orderNumber')}{selectedOrder.id.substring(0, 8)}
                    </h2>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(selectedOrder.status)}
                      <span className="font-medium">{t(selectedOrder.status)}</span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">
                    {new Date(selectedOrder.created_at).toLocaleString()}
                  </p>
                </div>
                
                <div className="p-6">
                  <h3 className="font-medium mb-4">{t('orderItems')}</h3>
                  <ul className="divide-y divide-gray-200">
                    {selectedOrder.items?.map((item) => (
                      <li key={item.id} className="py-3 flex justify-between">
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity} × {item.price.toFixed(2)} EGP
                          </p>
                        </div>
                        <p className="font-medium">
                          {(item.quantity * item.price).toFixed(2)} EGP
                        </p>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-6 border-t border-gray-200 pt-6">
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <p>{t('subtotal')}</p>
                      <p>{selectedOrder.total_amount.toFixed(2)} EGP</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button
                      onClick={() => handleReorder(selectedOrder)}
                      disabled={reordering}
                      className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                    >
                      {reordering ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {t('processing')}...
                        </span>
                      ) : (
                        t('reorder')
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg p-8 text-center">
                <div className="text-gray-500">
                  {t('selectOrderToViewDetails')}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
