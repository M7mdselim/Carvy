import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Product } from '../types'
import { useCart } from '../hooks/useCart'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../hooks/useAuth'
import { useProductRatings } from '../hooks/useRatings'
import { Button } from '../components/ui/button'
import { 
  Heart, Share2, Plus, Minus, ArrowLeft, 
  ShoppingCart, ImageIcon, Star, Trash2,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import { Separator } from '../components/ui/separator'
import { useWishlist } from '../hooks/useWishlist'
import { Badge } from '../components/ui/badge'
import { formatCurrency } from '../lib/utils'
import SimilarProducts from '../components/SimilarProducts'
import { AspectRatio } from '../components/ui/aspect-ratio'

export default function ProductDetails() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const { t, language } = useLanguage()
  const { user } = useAuth()
  const { items, addItem, removeItem, updateQuantity } = useCart()
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const { userRating, fetchUserRating, rateProduct } = useProductRatings()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [shopName, setShopName] = useState('')
  const [loading, setLoading] = useState(true)
  const [images, setImages] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [inWishlist, setInWishlist] = useState(false)
  const [loadingWishlist, setLoadingWishlist] = useState(false)
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [shopRating, setShopRating] = useState<number | null>(null)
  const [shopId, setShopId] = useState<string | null>(null)
  const [shopFeedback, setShopFeedback] = useState<number | null>(null)
  const [ratingHover, setRatingHover] = useState<number | null>(null)
  const [isReturnable, setIsReturnable] = useState<boolean>(false)
  const cartItem = items.find(item => item.product.id === productId)
  const isRtl = language === 'ar'

  useEffect(() => {
    fetchProductDetails()
    if (user) {
      checkIfInWishlist()
    }
  }, [productId, user])

  useEffect(() => {
    if (user && productId) {
      fetchUserRating(productId);
    }
  }, [user, productId]);

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
        .select('id, name, rating, review_count')
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
      setShopId(shopData.id)
      setShopRating(shopData.rating || 0)
      
      setIsReturnable(productData.returnable || false)
      
      if (shopData.review_count && shopData.review_count > 0) {
        setShopFeedback(Math.round((shopData.review_count / (shopData.review_count + 5)) * 100))
      } else {
        setShopFeedback(null)
      }
      
      setCategoryId(productData.category_id)
      
      const formattedProduct: Product = {
        id: productData.id,
        shopId: productData.shop_id,
        name: productData.name,
        description: productData.description || '',
        price: productData.price,
        image: productData.image || '', 
        category: productData.categories?.name || 'Type',
        compatibility: productData.product_car_models?.map((pcm: any) => {
          const car = pcm.car_models
          return `${car.make} ${car.model} (${car.year_start}${car.year_end ? `-${car.year_end}` : '+'})`
        }) || [],
        stock: productData.stock,
        status: productData.status,
        productNumber: productData.product_number,
        rating: productData.rating || 0,
        reviewCount: productData.review_count || 0,
        type: productData.type || 'Other',
        specifications: {},
        compare_at_price: null,
        returnable: productData.returnable || false
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

  function handleCarModelClick(carModel: string) {
    const regex = /(\w+)\s+(\w+)\s+\((\d+)(?:-(\d+))?\)/
    const match = carModel.match(regex)
    
    if (match) {
      const [_, make, model] = match
      navigate(`/products?make=${make}&model=${model}`)
    }
  }

  const handleRatingClick = async (rating: number) => {
    if (await rateProduct(productId || '', rating)) {
      fetchProductDetails();
    }
  };

  const handleBuyNow = () => {
    if (product && product.status === 'active') {
      if (!cartItem) {
        addItem(product);
      }
      navigate('/checkout');
    } else {
      toast.error(t('outOfStock'));
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
    <div className={`max-w-6xl mx-auto px-4 pb-16 ${isRtl ? 'rtl' : 'ltr'}`}>
      <Button
        variant="ghost"
        className="mb-4 flex items-center gap-2 hover:bg-gray-100"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" />
        {t('back')}
      </Button>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:sticky lg:top-24">
          <div className="relative overflow-hidden rounded-lg mb-4 border border-gray-200 bg-white shadow-md">
            <AspectRatio ratio={1/1} className="bg-white">
              {images.length > 0 ? (
                <img 
                  src={images[currentImageIndex]} 
                  alt={product?.name} 
                  className="w-full h-full object-contain p-4"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <ImageIcon className="h-32 w-32 text-gray-400" />
                </div>
              )}
              
              <button
                onClick={toggleWishlist}
                disabled={loadingWishlist}
                className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
                  inWishlist 
                    ? 'bg-pink-100 text-pink-600 hover:bg-pink-200' 
                    : 'bg-white/90 shadow-sm text-gray-700 hover:bg-gray-100'
                }`}
                aria-label={inWishlist ? t('removeFromWishlist') : t('addToWishlist')}
              >
                <Heart className={`h-6 w-6 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </AspectRatio>
          </div>
          
          {images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-w-[500px] mx-auto">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative rounded-md overflow-hidden transition-all duration-200 ${
                    currentImageIndex === index 
                      ? 'border-2 border-indigo-600 shadow-md' 
                      : 'border border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <AspectRatio ratio={1/1}>
                    <img 
                      src={img} 
                      alt={`${product?.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </AspectRatio>
                </button>
              ))}
            </div>
          )}
          
          <Button
            variant="outline"
            className="w-full hidden sm:flex justify-center items-center gap-2 max-w-[500px] mx-auto"
            onClick={shareProduct}
          >
            <Share2 className="h-4 w-4" />
            {t('shareProduct')}
          </Button>
        </div>
        
        <div className="flex flex-col space-y-4 sm:space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">{product?.name}</h1>
            
            <div className="flex items-center mt-3">
              <div className="flex items-center product-rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star}
                    onClick={() => handleRatingClick(star)}
                    onMouseEnter={() => setRatingHover(star)}
                    onMouseLeave={() => setRatingHover(null)}
                    className="focus:outline-none"
                    aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                  >
                    <Star 
                      className={`h-5 w-5 sm:h-6 sm:w-6 ${
                        (ratingHover ? star <= ratingHover : userRating ? star <= userRating : star <= Math.round(product.rating || 0)) 
                          ? 'text-yellow-400 fill-yellow-400' 
                          : 'text-gray-300'
                      } transition-colors`} 
                    />
                  </button>
                ))}
                <span className="ml-2 text-gray-700 font-medium">{product.rating?.toFixed(1) || '0.0'}</span>
                <span className="ml-2 text-gray-500">
                  ({product.reviewCount || 0}) {t('ratings')}
                </span>
              </div>
            </div>
            
            <div className="flex items-center mt-4">
              <span className="text-gray-600">{t('soldBy')}:</span>
              <Link 
                to={`/shops/${product?.shopId}`}
                className="ml-2 flex items-center text-indigo-600 hover:text-indigo-700 transition-colors font-medium"
              >
                {shopName}
              </Link>
            </div>
            <div className="flex items-center mt-1">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`h-3 w-3 sm:h-4 sm:w-4 ${star <= Math.round(shopRating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                  />
                ))}
                {shopFeedback !== null && (
                  <span className="ml-2 text-xs sm:text-sm text-gray-600">{shopFeedback}% {t('positive feedback')}</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 product-price">
                {formatCurrency(product?.price || 0)}
              </div>
              <div className="text-sm px-3 py-1 rounded-full bg-gray-200 text-gray-700">
                {isInactive ? t('outOfStock') : t('inStock')}
              </div>
            </div>
            
            <div className="mt-3 flex items-center">
              <span className="text-gray-600 text-sm">{t('condition')}:</span>
              <span className="ml-2 text-gray-800 font-medium">{isInactive ? t('unavailable') : t('new')}</span>
            </div>

            {isReturnable ? (
              <div className="mt-2 flex items-center text-sm text-green-600">
                <RefreshCw className="h-4 w-4 mr-1" />
                {t('acceptedWithin')} 7 {t('days')}
              </div>
            ) : (
              <div className="mt-2 flex items-center text-sm text-red-600">
                <RefreshCw className="h-4 w-4 mr-1" />
                {t('notReturnable')}
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            {!isInactive ? (
              <>
                <Button
                  onClick={handleBuyNow}
                  className="w-full h-10 sm:h-12 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white"
                >
                  {t('buyItNow')}
                </Button>
                
                {cartItem ? (
                  <div className="flex items-center justify-between border rounded-lg bg-gray-50 p-2">
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateQuantity(product.id, Math.max(0, cartItem.quantity - 1))}
                        className="h-9 w-9 sm:h-10 sm:w-10 rounded-full"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="mx-3 sm:mx-4 font-medium text-base sm:text-lg">{cartItem.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                        className="h-9 w-9 sm:h-10 sm:w-10 rounded-full"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(product?.id || '')}
                      className="h-9 w-9 sm:h-10 sm:w-10 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      addItem(product);
                      toast.success(t('addedToCart'));
                    }}
                    className="w-full h-10 sm:h-12 border-gray-300 hover:bg-gray-50 rounded-lg"
                  >
                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    {t('addToCart')}
                  </Button>
                )}
              </>
            ) : (
              <Button
                disabled
                variant="outline"
                className="w-full h-10 sm:h-12 bg-gray-100 text-gray-400 cursor-not-allowed rounded-lg"
              >
                {t('outOfStock')}
              </Button>
            )}

            <Button
              variant="outline"
              className="w-full sm:hidden flex justify-center items-center gap-2"
              onClick={shareProduct}
            >
              <Share2 className="h-4 w-4" />
              {t('shareProduct')}
            </Button>
          </div>
          
          <div className="p-4 sm:p-5 border border-gray-200 rounded-lg bg-white shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">{t('description')}</h3>
            <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line break-words">
              {product?.description}
            </p>
          </div>

          {product?.compatibility && product.compatibility.length > 0 && (
            <div className="p-4 sm:p-5 border border-gray-200 rounded-lg bg-white shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">{t('compatibleWith')}</h3>
              <div className="flex flex-wrap gap-2">
                {product.compatibility.map((car, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-gray-100 text-gray-800 py-1 text-xs sm:text-sm cursor-pointer hover:bg-indigo-50"
                    onClick={() => handleCarModelClick(car)}
                  >
                    {car}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="p-4 sm:p-5 border border-gray-200 rounded-lg bg-white shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">{t('specifications')}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm sm:text-base">
              <div className="text-gray-600">{t('brand')}</div>
              <div className="col-span-1 sm:col-span-2 font-medium">{product.name.split(' ')[0]}</div>
              
              {product.productNumber && (
                <>
                  <div className="text-gray-600">MPN</div>
                  <div className="col-span-1 sm:col-span-2 font-medium">{product.productNumber}</div>
                </>
              )}
              
              <div className="text-gray-600">{t('productType')}</div>
              <div className="col-span-1 sm:col-span-2 font-medium">
                <Link
                  to={`/products?type=${encodeURIComponent(product.type || '')}`}
                  className="text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  {product.type || t('other')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {product && productId && (
        <div className="mt-10 sm:mt-16">
          <SimilarProducts 
            productId={productId} 
            categoryId={categoryId || ''}
            shopId={shopId || ''}
          />
        </div>
      )}
    </div>
  )
}
