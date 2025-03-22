
import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Navbar from './components/navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
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
import Checkout from './pages/Checkout'
import { LanguageProvider } from './contexts/LanguageContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth as useZustandAuth } from './hooks/useAuth'

// ScrollToTop component to handle scrolling to top on route changes
function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

// RedirectAfterLogin component to handle redirecting users after login
function RedirectAfterLogin() {
  const { user } = useAuth();
  const redirectPath = sessionStorage.getItem("redirectAfterLogin");
  
  useEffect(() => {
    if (user && redirectPath) {
      sessionStorage.removeItem("redirectAfterLogin");
      window.location.href = redirectPath;
    }
  }, [user, redirectPath]);
  
  return null;
}

// Initialize auth at the app level
function AuthInitializer() {
  const { initialize, cleanup } = useZustandAuth();
  
  useEffect(() => {
    initialize();
    return () => {
      if (cleanup) cleanup();
    };
  }, [initialize, cleanup]);
  
  return null;
}

function App() {
  return (
    <LanguageProvider>
      <Router basename="/Carvy/">
        <AuthProvider>
          <AuthInitializer />
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <ScrollToTop />
            <RedirectAfterLogin />
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
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/orders" element={<Orders />} />
              </Route>
              
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
          </div>
        </AuthProvider>
      </Router>
    </LanguageProvider>
  )
}

export default App
