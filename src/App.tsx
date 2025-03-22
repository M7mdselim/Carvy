import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Index from './pages/Index'
import Categories from './pages/Categories'
import CategoryShops from './pages/CategoryShops'
import Shops from './pages/Shops'
import ShopDetails from './pages/ShopDetails'
import Cart from './pages/Cart'
import Login from './pages/Login'
import Register from './pages/Register'
import SearchResults from './pages/SearchResults'
import Contact from './pages/Contact'
import Profile from './pages/Profile'
import Orders from './pages/Orders'
import Products from './pages/Products'
import ProductDetails from './pages/ProductDetails'
import ModelProducts from './pages/ModelProducts'
import Wishlist from './pages/Wishlist'
import { useAuth } from './hooks/useAuth'
import Checkout from './pages/Checkout'
import { LanguageProvider } from './contexts/LanguageContext'
import NotFound from './pages/NotFound'

// ScrollToTop component to handle scrolling to top on route changes
function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

function App() {
  const { initialize } = useAuth()

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <LanguageProvider>
      <Router basename="/Carvy/">
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Home />} />
            
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:categoryId" element={<CategoryShops />} />
            <Route path="/shops" element={<Shops />} />
            <Route path="/shops/:shopId" element={<ShopDetails />} />
            {/* Products */}
            <Route path="/products" element={<Products />} />
            <Route path="/products/:productId" element={<ProductDetails />} />
            <Route path="/models/:modelId" element={<ModelProducts />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </LanguageProvider>
  )
}

export default App
