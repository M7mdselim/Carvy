
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
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import SearchResults from './pages/SearchResults'
import Contact from './pages/Contact'
import Profile from './pages/Profile'
import Orders from './pages/Orders'
import Products from './pages/Products'
import ProductDetails from './pages/ProductDetails'
import ModelProducts from './pages/ModelProducts'
import Wishlist from './pages/Wishlist'
import Checkout from './pages/Checkout'
import SavedAddresses from './pages/SavedAddresses'
import FAQ from './pages/FAQ'
import TermsAndConditions from './pages/TermsAndConditions'
import { LanguageProvider } from './contexts/LanguageContext'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './hooks/useAuth'
import { Toaster } from 'sonner'
import { Chatbot } from "./components/Chatbot"
import ProductRequestForm from './components/ProductRequestForm'

function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

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

function App() {
  return (
    <LanguageProvider>
      <Router basename="/Zabtt/">
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
            
            <Route path="/products" element={<Products />} />
            <Route path="/products/:productId" element={<ProductDetails />} />
            <Route path="/models/:modelId" element={<ModelProducts />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/saved-addresses" element={<SavedAddresses />} />
            </Route>
            
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
          <Chatbot />
          <ProductRequestForm />
          <Toaster position="top-right" richColors />
        </div>
      </Router>
    </LanguageProvider>
  )
}

export default App
