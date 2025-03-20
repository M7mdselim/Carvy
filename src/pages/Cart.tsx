
import { Link } from 'react-router-dom'
import { TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline'
import { useCart } from '../hooks/useCart'
import { useIsMobile } from '../hooks/use-mobile'

export default function Cart() {
  const { items, removeItem, updateQuantity, total } = useCart()
  const isMobile = useIsMobile()

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Your cart is empty</h2>
          <p className="mt-2 text-sm md:text-base text-gray-600">
            Start shopping to add items to your cart
          </p>
          <Link
            to="/"
            className="mt-4 md:mt-6 inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-8">Shopping Cart</h1>
      <div className="bg-white rounded-lg shadow">
        <ul className="divide-y divide-gray-200">
          {items.map(({ product, quantity }) => (
            <li key={product.id} className="flex flex-col sm:flex-row py-4 px-3 sm:py-6 sm:px-6">
              <div className="flex-shrink-0 w-full sm:w-24 h-32 sm:h-24 mb-3 sm:mb-0 mx-auto sm:mx-0 border border-gray-200 rounded-md overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-center object-cover"
                />
              </div>
              <div className="sm:ml-4 flex-1 flex flex-col">
                <div>
                  <div className="flex flex-col sm:flex-row sm:justify-between text-base font-medium text-gray-900">
                    <h3 className="text-center sm:text-left">{product.name}</h3>
                    <p className="text-center sm:text-right sm:ml-4 mt-1 sm:mt-0">{(product.price * quantity).toFixed(2)}</p>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 text-center sm:text-left">{product.category}</p>
                </div>
                <div className="flex-1 flex flex-col sm:flex-row items-center sm:items-end justify-between text-sm mt-3 sm:mt-0">
                  <div className="flex items-center space-x-2 sm:space-x-4 mb-3 sm:mb-0">
                    <div className="flex items-center border rounded-md">
                      <button
                        onClick={() => updateQuantity(product.id, Math.max(0, quantity - 1))}
                        className="p-1.5 sm:p-2 hover:bg-gray-100"
                        aria-label="Decrease quantity"
                      >
                        <MinusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                      <span className="px-2 sm:px-4 py-1 sm:py-2 text-gray-900">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="p-1.5 sm:p-2 hover:bg-gray-100"
                        aria-label="Increase quantity"
                      >
                        <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(product.id)}
                      className="text-red-600 hover:text-red-500"
                      aria-label="Remove item"
                    >
                      <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                  <div className="text-gray-500 text-sm">
                    {product.price.toFixed(2)} each
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="border-t border-gray-200 px-4 py-4 sm:py-6 sm:px-6">
          <div className="flex justify-between text-base font-medium text-gray-900">
            <p>Subtotal</p>
            <p>{total.toFixed(2)} EGP </p>
          </div>
          <p className="mt-0.5 text-xs sm:text-sm text-gray-500">
            Shipping and taxes calculated at checkout.
          </p>
          <Link
            to="/checkout"
            className="mt-4 w-full flex justify-center items-center px-4 py-2 sm:py-3 border border-transparent rounded-md shadow-sm text-sm sm:text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Checkout
          </Link>
          <div className="mt-4 sm:mt-6 flex justify-center text-xs sm:text-sm text-center text-gray-500">
            <p>
              or{' '}
              <Link
                to="/"
                className="text-indigo-600 font-medium hover:text-indigo-500"
              >
                Continue Shopping<span aria-hidden="true"> &rarr;</span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
