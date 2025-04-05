import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Product } from '../types'
import { useCart } from '../hooks/useCart'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/button'
import { 
  Heart, Share2, Plus, Minus, ArrowLeft, ArrowRight,
  ShoppingCart, ImageIcon
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '../components/ui/card'
import { Separator } from '../components/ui/separator'
import { useWishlist } from '../hooks/useWishlist'
import { Badge } from '../components/ui/badge'
import { formatCurrency } from '../lib/utils'
import SimilarProducts from '../components/SimilarProducts'

export default function ProductDetails() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const { t, language } = useLanguage()
  const { user } = useAuth()
  const { items, addItem, removeItem, updateQuantity } = useCart()
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [shopName, setShopName] = useState('')
  const [loading, setLoading] = useState(true)
  const [images, setImages] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [inWishlist, setInWishlist] = useState(false)
  const [loadingWishlist, setLoadingWishlist] = useState(false)
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const cartItem = items.find(item => item.product.id === productId)
  const isRtl = language === 'ar'

  useEffect(() => {
    fetchProductDetails()
    if (user) {
      checkIfInWishlist()
    }
  }, [productId, user])

  async function fetchProductDetails() {
    try {
      setLoading(true)
      
      const { data: productData, error: productError } = await supabase
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
          ),
          product_images (
            image_url,
            is_primary
          )
        `)
        .eq('id', productId)
        .single()

      if (productError) throw productError

      const { data: shopData, error: shopError } = await supabase
        .from('shops')
        .select('name')
        .eq('id', productData.shop_id)
        .single()

      if (shopError) throw shopError

      let productImages = []
      
      if (productData.image) {
        productImages.push(productData.image)
      }
      
      if (productData.product_images && productData.product_images.length > 0) {
        const additionalImages = productData.product_images
          .filter((img: { image_url: string }) => img.image_url !== productData.image)
          .map((img: { image_url: string }) => img.image_url)
        
        productImages = [...productImages, ...additionalImages]
      }
      
      setImages(productImages)
      setShopName(shopData.name)
      setCategoryId(productData.category_id)
      
      const formattedProduct: Product = {
        id: productData.id,
        shopId: productData.shop_id,
        name: productData.name,
        description: productData.description || '',
        price: productData.price,
        image: productData.image || '', // Ensure empty string if no image
        category: productData.categories?.name || 'Uncategorized',
        compatibility: productData.product_car_models?.map((pcm: any) => {
          const car = pcm.car_models
          return `${car.make} ${car.model} (${car.year_start}${car.year_end ? `-${car.year_end}` : '+'})`
        }) || [],
        stock: productData.stock,
        status: productData.status,
        productNumber: productData.product_number
      }

      setProduct(formattedProduct)
    } catch (error) {
      console.error('Error fetching product details:', error)
      toast.error(t('errorFetchingProduct'))
    } finally {
      setLoading(false)
    }
  }

  async function checkIfInWishlist() {
    if (!user) return
    
    try {
      const isInList = await isInWishlist(productId || '')
      setInWishlist(isInList)
    } catch (error) {
      console.error('Error checking wishlist:', error)
    }
  }

  async function toggleWishlist() {
    if (!user) {
      toast.error(t('pleaseLoginToAddToWishlist'))
      navigate('/login')
      return
    }
    
    setLoadingWishlist(true)
    
    try {
      if (inWishlist) {
        await removeFromWishlist(productId || '')
        setInWishlist(false)
        toast.success(t('removedFromWishlist'))
      } else {
        await addToWishlist(productId || '')
        setInWishlist(true)
        toast.success(t('addedToWishlist'))
      }
    } catch (error) {
      console.error('Error updating wishlist:', error)
      toast.error(t('errorUpdatingWishlist'))
    } finally {
      setLoadingWishlist(false)
    }
  }

  function shareProduct() {
    if (navigator.share) {
      navigator.share({
        title: product?.name || 'Product',
        text: product?.description || 'Check out this product',
        url: window.location.href
      })
      .catch(error => console.error('Error sharing:', error))
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => toast.success(t('linkCopiedToClipboard')))
        .catch(error => {
          console.error('Error copying to clipboard:', error)
          toast.error(t('errorCopyingToClipboard'))
        })
    }
  }

  function nextImage() {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  function prevImage() {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  function handleCarModelClick(carModel: string) {
    const regex = /(\w+)\s+(\w+)\s+\((\d+)(?:-(\d+))?\)/
    const match = carModel.match(regex)
    
    if (match) {
      const [_, make, model] = match
      navigate(`/products?make=${make}&model=${model}`)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-lg mb-8"></div>
          <div className="h-10 bg-gray-200 rounded-lg w-3/4 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded-lg w-1/2 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded-lg w-1/4 mb-8"></div>
          <div className="h-32 bg-gray-200 rounded-lg mb-8"></div>
          <div className="h-12 bg-gray-200 rounded-lg w-full"></div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">{t('productNotFound')}</h2>
          <p className="mt-2 text-gray-600">{t('productDoesNotExist')}</p>
          <Button 
            className="mt-6" 
            onClick={() => navigate('/products')}
          >
            {t('backToProducts')}
          </Button>
        </div>
      </div>
    )
  }

  const isInactive = product?.status === 'inactive';

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${isRtl ? 'rtl' : 'ltr'}`}>
      <Button
        variant="ghost"
        className="mb-6 flex items-center gap-2 hover:bg-gray-100"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" />
        {t('back')}
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <Card className="overflow-hidden border-0 shadow-lg h-[500px]">
          <div className="aspect-square bg-white rounded-lg overflow-hidden relative h-full">
            {images.length > 0 ? (
              <img 
                src={images[currentImageIndex]} 
                alt={product?.name} 
                className="w-full h-full object-contain p-4"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 p-4">
                <ImageIcon className="h-32 w-32 text-gray-400" />
              </div>
            )}
            
            {images.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-md hover:bg-white transition-colors"
                  aria-label="Previous image"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-700" />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-md hover:bg-white transition-colors"
                  aria-label="Next image"
                >
                  <ArrowRight className="h-5 w-5 text-gray-700" />
                </button>
              </>
            )}
          </div>
          
          {images.length > 1 && (
            <div className="flex mt-4 p-4 space-x-2 overflow-x-auto pb-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-16 h-16 rounded-md overflow-hidden flex-shrink-0 transition-all duration-200 ${
                    currentImageIndex === index 
                      ? 'border-2 border-indigo-600 shadow-md' 
                      : 'border border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <img 
                    src={img} 
                    alt={`${product?.name} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </Card>
        
        <div className="flex flex-col h-full">
          <div>
            <div className="flex justify-between items-start mb-2">
              <div>
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 mb-2">
                  {product?.category}
                </Badge>
                <h1 className="text-3xl font-bold text-gray-900 break-words">{product?.name}</h1>
                {product?.productNumber && (
                  <span className="text-sm text-gray-500 mt-1 block">#{product.productNumber}</span>
                )}
                <div className="flex items-center mt-2 mb-4">
                  <Link 
                    to={`/shops/${product?.shopId}`}
                    className="text-indigo-600 hover:text-indigo-800 transition-colors text-sm font-medium"
                  >
                    {shopName}
                  </Link>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={toggleWishlist}
                  disabled={loadingWishlist}
                  className={`p-2 rounded-full transition-colors ${
                    inWishlist 
                      ? 'bg-pink-100 text-pink-600 hover:bg-pink-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  aria-label={inWishlist ? t('removeFromWishlist') : t('addToWishlist')}
                >
                  <Heart className={`h-6 w-6 ${inWishlist ? 'fill-current' : ''}`} />
                </button>
                
                <button
                  onClick={shareProduct}
                  className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  aria-label={t('shareProduct')}
                >
                  <Share2 className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-indigo-600">
                  {formatCurrency(product?.price || 0)}
                </span>
              </div>
              
              <div className="mt-1">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  !isInactive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {!isInactive 
                    ? t('inStock') 
                    : t('outOfStock')}
                </span>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">{t('description')}</h3>
              <p className="text-gray-600 whitespace-pre-line break-words overflow-hidden">
                {product?.description}
              </p>
            </div>
            
            {product?.compatibility && product.compatibility.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">{t('compatibleWith')}</h3>
                <div className="flex flex-wrap gap-2">
                  {product.compatibility.map((car, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-gray-100 text-gray-800 py-1.5 cursor-pointer hover:bg-indigo-50"
                      onClick={() => handleCarModelClick(car)}
                    >
                      {car}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-auto">
            {!isInactive ? (
              cartItem ? (
                <div className="flex items-center gap-4 h-12">
                  <div className="flex items-center border rounded-lg overflow-hidden bg-white shadow-sm">
                    <button
                      onClick={() => updateQuantity(product?.id || '', Math.max(0, cartItem.quantity - 1))}
                      className="flex items-center justify-center w-12 h-12 hover:bg-gray-100 transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 h-12 flex items-center justify-center text-lg font-medium">
                      {cartItem.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(product?.id || '', cartItem.quantity + 1)}
                      className="flex items-center justify-center w-12 h-12 hover:bg-gray-100 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => removeItem(product?.id || '')}
                    className="flex-1 h-12 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                  >
                    {t('removeFromCart')}
                  </Button>
                  
                  <Button
                    onClick={() => navigate('/cart')}
                    className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {t('goToCart')}
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    addItem(product);
                    toast.success(t('addedToCart'));
                  }}
                  className="w-full h-12 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {t('addToCart')}
                </Button>
              )
            ) : (
              <Button
                disabled
                variant="outline"
                className="w-full h-12 bg-gray-100 text-gray-400 cursor-not-allowed"
              >
                {t('outOfStock')}
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {product && productId && (
        <SimilarProducts 
          productId={productId} 
          categoryId={categoryId} 
          shopId={product.shopId} 
        />
      )}
    </div>
  )
}
