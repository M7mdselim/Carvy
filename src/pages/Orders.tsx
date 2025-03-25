
import { useState, useEffect } from 'react'
import { useOrders, Order } from '../hooks/useOrders'
import { useLanguage } from '../contexts/LanguageContext'
import { Button } from '../components/ui/button'
import { Clock, CheckCircle, TruckIcon, PackageCheck, XCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import { format, formatDistanceToNow, isBefore, addMinutes, isAfter, addDays } from 'date-fns'
import { Badge } from '../components/ui/badge'
import { toast } from 'sonner'
import { supabase } from '../lib/supabase'
import { RefundRequestDialog } from '../components/RefundRequestDialog'
import { useRefundRequests } from '../hooks/useRefundRequests'

export default function Orders() {
  const { orders, loading, error, refetch } = useOrders()
  const { t, language } = useLanguage()
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null)
  const isRtl = language === 'ar'
  const { refundRequests, fetchRefundRequests } = useRefundRequests()
  const [refundRequestedOrders, setRefundRequestedOrders] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchRefundRequests();
  }, [fetchRefundRequests]);

  useEffect(() => {
    if (refundRequests.length > 0) {
      const orderIds = new Set(refundRequests.map(request => request.order_id));
      setRefundRequestedOrders(orderIds);
    }
  }, [refundRequests]);

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-orange-500" />
      case 'processing':
        return <TruckIcon className="h-5 w-5 text-blue-500" />
      case 'shipped':
        return <TruckIcon className="h-5 w-5 text-purple-500" />
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const canCancelOrder = (order: Order) => {
    if (order.status !== 'pending' && order.status !== 'processing') {
      return false
    }
    
    const orderDate = new Date(order.created_at)
    const cancelWindow = addMinutes(orderDate, 30)
    const now = new Date()
    
    return isBefore(now, cancelWindow)
  }

  const getTimeLeftForCancellation = (order: Order) => {
    const orderDate = new Date(order.created_at)
    const cancelWindow = addMinutes(orderDate, 30)
    const now = new Date()
    
    if (isBefore(now, cancelWindow)) {
      return formatDistanceToNow(cancelWindow, { addSuffix: true })
    }
    
    return null
  }

  const handleCancelOrder = async (orderId: string) => {
    try {
      setCancellingOrderId(orderId)
      
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId)
      
      if (error) throw error
      
      toast.success(t('orderCancelled'))
      refetch()
    } catch (error) {
      console.error('Error cancelling order:', error)
      toast.error(t('errorCancellingOrder'))
    } finally {
      setCancellingOrderId(null)
    }
  }

  const canRequestRefund = (order: Order) => {
    // Allow refund requests for all statuses except pending and cancelled
    if (order.status === 'pending' || order.status === 'cancelled') return false;
    
    const orderDate = new Date(order.created_at);
    const refundWindow = addDays(orderDate, 14);
    const now = new Date();
    
    // Don't allow if already requested
    if (refundRequestedOrders.has(order.id)) return false;
    
    // Can request refund if within 14 days of order creation
    return isBefore(now, refundWindow);
  }

  const handleRefundSuccess = () => {
    fetchRefundRequests();
    toast.success(t('refundRequestSubmitted'));
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="mt-2 text-gray-500">{t('loadingOrders')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center text-red-500">
          <p>{t('errorLoadingOrders')}</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${isRtl ? 'rtl' : 'ltr'}`}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('myOrders')}</h1>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          {t('refresh')}
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <PackageCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-1">{t('noOrdersYet')}</h2>
          <p className="text-gray-500">{t('startShoppingToSeeOrders')}</p>
          <Button className="mt-4" onClick={() => window.location.href = '/products'}>
            {t('browseProducts')}
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{t('orderId')}:</span>
                    <span className="font-medium">{order.id.substring(0, 8)}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(order.created_at), 'PPP p')}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={`flex items-center gap-1 px-3 py-1 ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {t(order.status)}
                  </Badge>
                  
                  <div className="flex flex-col gap-1">
                    {canCancelOrder(order) && order.status !== 'cancelled' && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancellingOrderId === order.id}
                      >
                        {cancellingOrderId === order.id ? t('cancelling') : t('cancelOrder')}
                      </Button>
                    )}
                    
                    {canRequestRefund(order) && (
                      <RefundRequestDialog 
                        orderId={order.id} 
                        onSuccess={handleRefundSuccess}
                        disabled={refundRequestedOrders.has(order.id)}
                      />
                    )}
                    
                    {refundRequestedOrders.has(order.id) && (
                      <span className="text-xs text-amber-600 font-medium">
                        {t('refundRequested')}
                      </span>
                    )}
                    
                    {canCancelOrder(order) && order.status !== 'cancelled' && (
                      <span className="text-xs text-gray-500">
                        {t('cancelAvailable')} {getTimeLeftForCancellation(order)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">{t('shippingDetails')}</h3>
                  <p className="text-gray-700">{order.first_name} {order.last_name}</p>
                  <p className="text-gray-700">{order.address}</p>
                  <p className="text-gray-700">{order.city}, {order.postal_code}</p>
                  <p className="text-gray-700">{order.email}</p>
                  <p className="text-gray-700">{order.phone}</p>
                </div>
                
                <h3 className="text-lg font-medium mb-2">{t('orderedItems')}</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('product')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('quantity')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('price')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {order.items?.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.product_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            {item.price.toFixed(2)} EGP
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                          {t('total')}:
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                          {order.total_amount.toFixed(2)} EGP
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
