
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext
} from './ui/carousel';
import { Card, CardContent } from './ui/card';
import { ImageIcon } from 'lucide-react';

interface SimilarProductsProps {
  productId: string;
  categoryId?: string | null;
  shopId: string;
}

export default function SimilarProducts({ productId, categoryId, shopId }: SimilarProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      try {
        setLoading(true);
        
        // First, try to get products frequently bought together
        let { data: orderItemsData, error: orderItemsError } = await supabase
          .from('order_items')
          .select('order_id, product_id')
          .eq('product_id', productId);
        
        let frequentlyBoughtProductIds: string[] = [];
        
        if (!orderItemsError && orderItemsData && orderItemsData.length > 0) {
          // Get all order IDs where this product was purchased
          const orderIds = orderItemsData.map(item => item.order_id);
          
          // Get other products purchased in the same orders
          const { data: relatedItems, error: relatedError } = await supabase
            .from('order_items')
            .select('product_id')
            .in('order_id', orderIds)
            .neq('product_id', productId);
          
          if (!relatedError && relatedItems && relatedItems.length > 0) {
            // Count frequency of each product
            const productFrequency = relatedItems.reduce((acc, item) => {
              acc[item.product_id] = (acc[item.product_id] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);
            
            // Sort by frequency and take top 8
            frequentlyBoughtProductIds = Object.entries(productFrequency)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 8)
              .map(([id]) => id);
          }
        }
        
        let query = supabase
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
          .eq('status', 'active')
          .neq('id', productId)
          .limit(8);
        
        // If we have frequently bought products, prioritize them
        if (frequentlyBoughtProductIds.length > 0) {
          query = query.in('id', frequentlyBoughtProductIds);
        }
        // If we have a category, prefer products from the same category
        else if (categoryId) {
          query = query.eq('category_id', categoryId);
        } else {
          // Otherwise, get products from the same shop
          query = query.eq('shop_id', shopId);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const formattedProducts: Product[] = data.map((product) => ({
            id: product.id,
            shopId: product.shop_id,
            name: product.name,
            description: product.description || '',
            price: product.price,
            image: product.image || '',
            category: product.categories?.name || 'Uncategorized',
            compatibility: product.product_car_models?.map((pcm: any) => {
              const car = pcm.car_models;
              return `${car.make} ${car.model} (${car.year_start}${car.year_end ? `-${car.year_end}` : '+'})`
            }) || [],
            stock: product.stock,
          }));
          
          setProducts(formattedProducts);
        }
      } catch (error) {
        console.error('Error fetching similar products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (productId && shopId) {
      fetchSimilarProducts();
    }
  }, [productId, categoryId, shopId]);

  // Determine if we should show navigation arrows based on product count and screen size
  useEffect(() => {
    const handleResize = () => {
      // Calculate breakpoints to determine when scrolling is needed
      const viewportWidth = window.innerWidth;
      const itemsPerView = 
        viewportWidth < 640 ? 2 :  // xs breakpoint
        viewportWidth < 768 ? 3 :  // sm breakpoint
        viewportWidth < 1024 ? 4 : // md breakpoint
        viewportWidth < 1280 ? 5 : // lg breakpoint
        6;                         // xl breakpoint
      
      setCanScroll(products.length > itemsPerView);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [products.length]);

  if (loading) {
    return <div className="text-center py-4">{t('loading')}</div>;
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('youMayAlsoLike')}</h2>
      <div className="relative">
        <Carousel className="w-full">
          <CarouselContent className="-ml-2 md:-ml-4">
            {products.map((product) => (
              <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-1/2 xs:basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6">
                <div className="h-full">
                  <MiniProductCard product={product} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {canScroll && (
            <>
              <CarouselPrevious className="absolute left-0 -translate-x-1/2 z-10 bg-white/90 border border-gray-200 hover:bg-white" />
              <CarouselNext className="absolute right-0 translate-x-1/2 z-10 bg-white/90 border border-gray-200 hover:bg-white" />
            </>
          )}
        </Carousel>
      </div>
    </div>
  );
}

// Mini product card specifically for the similar products section
function MiniProductCard({ product }: { product: Product }) {
  const navigate = (path: string) => {
    window.location.href = path;
  };
  const { t } = useLanguage();

  return (
    <Card 
      className="h-full overflow-hidden hover:shadow-md transition-shadow cursor-pointer bg-white"
      onClick={() => navigate(`/products/${product.id}`)}
    >
      <div className="aspect-square w-full bg-gray-100 overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-gray-400" />
          </div>
        )}
      </div>
      <CardContent className="p-2 md:p-3">
        <h3 className="text-xs md:text-sm font-medium line-clamp-2 mb-1">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-xs md:text-sm font-semibold text-indigo-600">
            {product.price.toFixed(2)} EGP
          </span>
          {product.stock <= 0 && (
            <span className="text-xs text-red-500">{t('outOfStock')}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
