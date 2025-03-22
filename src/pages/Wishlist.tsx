
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../hooks/useWishlist';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { ShoppingCart, Trash2, ArrowLeft, Heart } from 'lucide-react';
import { Separator } from '../components/ui/separator';
import { Card, CardContent } from '../components/ui/card';
import { toast } from 'sonner';
import { useCart } from '../hooks/useCart';

export default function Wishlist() {
  const { wishlistItems, loading, error, removeFromWishlist, refreshWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { addItem } = useCart();
  const isRtl = language === 'ar';
  const [retryCount, setRetryCount] = useState(0);

  // Try to refresh wishlist when user is logged in
  useEffect(() => {
    if (user) {
      console.log("User is logged in, refreshing wishlist");
      refreshWishlist();
    } else {
      navigate('/login');
      toast.error(t('pleaseLoginToViewWishlist'));
    }
  }, [user, refreshWishlist, navigate, t]);

  // Retry mechanism if loading takes too long
  useEffect(() => {
    let timeoutId: number;
    
    if (loading && retryCount < 3) {
      timeoutId = window.setTimeout(() => {
        console.log(`Retry attempt ${retryCount + 1} for wishlist`);
        refreshWishlist();
        setRetryCount(prev => prev + 1);
      }, 3000);
    }
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [loading, retryCount, refreshWishlist]);

  if (loading && retryCount < 3) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="mt-2 text-gray-500">{t('loadingWishlist')}</p>
        </div>
      </div>
    );
  }

  // If still loading after retries, show items anyway (may be empty)
  if (error) {
    console.error("Wishlist error:", error);
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center text-red-500">
          <p>{t('errorLoadingWishlist')}</p>
          <p className="text-sm">{error.message}</p>
          <Button 
            className="mt-4"
            onClick={() => {
              setRetryCount(0);
              refreshWishlist();
            }}
          >
            {t('tryAgain')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${isRtl ? 'rtl' : 'ltr'}`}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <Button
            variant="outline"
            className="mb-4 flex items-center gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            {t('back')}
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="h-6 w-6 text-pink-500" />
            {t('myWishlist')}
          </h1>
          <p className="mt-2 text-gray-600">
          {wishlistItems.length === 0
  ? t('emptyWishlist')
  : (t as any)('wishlistItemsCount', { count: wishlistItems.length })}

          </p>
        </div>
      </div>

      <Separator className="mb-8" />

      {wishlistItems.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <Heart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">{t('noItemsInWishlist')}</h3>
          <p className="text-gray-500 mb-6">{t('startAddingToWishlist')}</p>
          <Button onClick={() => navigate('/products')}>
            {t('browseProducts')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="aspect-square overflow-hidden relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onClick={() => navigate(`/products/${product.id}`)}
                />
              </div>
              <CardContent className="p-4">
                <h3 
                  className="text-lg font-semibold mb-2 cursor-pointer hover:text-indigo-600 transition-colors"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  {product.name}
                </h3>
                <p className="text-gray-500 mb-2 line-clamp-2 text-sm">
                  {product.description}
                </p>
                <div className="mt-2 flex justify-between items-center">
                  <p className="text-xl font-bold text-indigo-600">{product.price.toFixed(2)} EGP</p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      onClick={() => removeFromWishlist(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        addItem(product);
                        toast.success(t('addedToCart'));
                      }}
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      {t('addToCart')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
