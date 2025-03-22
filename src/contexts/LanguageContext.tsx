import React, { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextProps {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');

  useEffect(() => {
    localStorage.setItem('language', language);
    document.body.classList.toggle('rtl', language === 'ar');
    return () => {
      document.body.classList.remove('rtl');
    };
  }, [language]);

  const translations = {
    en: {
      brandName: 'Carvy',
      home: 'Home',
      shops: 'Shops',
      cart: 'Cart',
      login: 'Login',
      register: 'Register',
      profile: 'Profile',
      orders: 'Orders',
      logout: 'Logout',
      categories: 'Categories',
      contact: 'Contact',
      models: 'Models',
      contactUs: 'Contact Us',
      searchPlaceholder: 'Search for parts or shops...',
      searching: 'Searching...',
      viewAllResults: 'View All Results',
      noResults: 'No results found for',
      browseModels: 'Browse Models',
      featuredShops: 'Featured Shops',
      featuredProducts: 'Featured Products',
      allShops: 'All Shops',
      filterByModels: 'Filter by Models',
      allModels: 'All Models',
      loadingShops: 'Loading shops...',
      noShopsFound: 'No shops found',
      emptyCart: 'Your cart is empty',
      startShopping: 'Start shopping now!',
      continueShopping: 'Continue Shopping',
      shoppingCart: 'Shopping Cart',
      subtotal: 'Subtotal',
      each: 'each',
      shippingTaxes: 'Shipping & taxes calculated at checkout',
      checkout: 'Checkout',
      or: 'Or',
      myOrders: 'My Orders',
      orderNumber: 'Order #',
      pending: 'Pending',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      returnHome: 'Return to Home',
      noOrders: 'No orders yet',
      selectOrderToViewDetails: 'Select an order to view details',
      orderItems: 'Order Items',
      reorder: 'Reorder',
      findPerfectParts: 'Find the Perfect Parts for Your Car',
      browseThousands: 'Browse thousands of auto parts from trusted shops.',
      searchShops: 'Search shops',
      searchProducts: 'Search products',
      viewAll: 'View all',
      loadingProducts: 'Loading products...',
      noProductsFound: 'No products found',
      reorderSuccess: 'All items from your previous order have been added to cart',
      reorderPartial: 'Some items from your order were added to cart. Others are out of stock.',
      reorderNoProducts: 'Sorry, none of the items from your order are currently available',
      reorderError: 'There was an error reordering. Please try again.',
      loadMore: 'Load More',
      personalInformation: 'Personal Information',
      firstName: 'First Name',
      lastName: 'Last Name',
      emailAddress: 'Email Address',
      phoneNumber: 'Phone Number',
      notProvided: 'Not provided',
      quickActions: 'Quick Actions',
      myCart: 'My Cart',
      editProfile: 'Edit Profile',
      saveChanges: 'Save Changes',
      updatePhoneNumber: 'Update Phone Number',
      phoneUpdated: 'Phone number updated successfully',
      phoneUpdateError: 'Failed to update phone number',
      enterCouponCode: 'Enter coupon code',
      apply: 'Apply',
      applying: 'Applying...',
      discount: 'Discount',
      errorApplyingCoupon: 'Error applying coupon',
      cartEmpty: 'Your cart is empty',
      loginRequired: 'You must be logged in to checkout',
      orderError: 'Failed to place order. Please try again.',
      completeOrder: 'Complete Order',
      shipping: 'Shipping',
      total: 'Total',
      contactInformation: 'Contact Information',
      shippingInformation: 'Shipping Information',
      paymentInformation: 'Payment Information',
      address: 'Address',
      city: 'City',
      postalCode: 'Postal Code',
      cardNumber: 'Card Number',
      expiryDate: 'Expiry Date',
      save: 'Save',
      edit: 'Edit',
      
      // Professional text strings
      welcomeBack: 'Welcome Back',
      signIn: 'Sign In',
      authenticating: 'Authenticating...',
      noAccount: "Don't have an account?",
      createAccountNow: 'Create an account now',
      joinOurCommunity: 'Join Our Community',
      createAccount: 'Create Account',
      creatingYourAccount: 'Creating your account...',
      alreadyHaveAccount: 'Already have an account?',
      signInToYourAccount: 'Sign in to your account',
      confirmPassword: 'Confirm Password',
      
      // Added for products page
      products: 'Products',
      allCategories: 'All Categories',
      inStock: 'in stock',
      outOfStock: 'Out of stock',
      addToCart: 'Add to Cart',
      remove: 'Remove',
      for: 'for',
      
      // Added for contact page
      getInTouch: 'Get in touch with our team',
      sendMessage: 'Send Message',
      yourName: 'Your Name',
      yourEmail: 'Your Email',
      subject: 'Subject',
      message: 'Message',
      sending: 'Sending...',
      messageSent: 'Your message has been sent! We will get back to you soon.',
      email: 'Email',
      phone: 'Phone',
      followUs: 'Follow Us',
      
      // Added for footer
      carDescription: 'Your one-stop shop for quality auto parts and accessories in Egypt.',
      quickLinks: 'Quick Links',
      customerService: 'Customer Service',
      connectWithUs: 'Connect With Us',
      allRightsReserved: 'All Rights Reserved',
      faq: 'FAQ',
      
      // Added for payment method
      paymentMethod: 'Payment Method',
      creditCard: 'Credit Card',
      cashOnDelivery: 'Cash on Delivery',
      selectCity: 'Select City',
      cairo: 'Cairo',
      giza: 'Giza',
      orderSuccess: 'Order placed successfully!',
    },
    ar: {
      brandName: 'كارڤي',
      home: 'الرئيسية',
      shops: 'المتاجر',
      cart: 'السلة',
      login: 'تسجيل الدخول',
      register: 'تسجيل',
      profile: 'الملف الشخصي',
      orders: 'الطلبات',
      logout: 'تسجيل الخروج',
      categories: 'الأقسام',
      contact: 'اتصل بنا',
      models: 'الموديلات',
      contactUs: 'اتصل بنا',
      searchPlaceholder: 'ابحث عن قطع الغيار أو المتاجر...',
      searching: 'جاري البحث...',
      viewAllResults: 'عرض جميع النتائج',
      noResults: 'لم يتم العثور على نتائج لـ',
      browseModels: 'تصفح الموديلات',
      featuredShops: 'المتاجر المميزة',
      featuredProducts: 'المنتجات المميزة',
      allShops: 'جميع المتاجر',
      filterByModels: 'فلتر حسب الموديل',
      allModels: 'جميع الموديلات',
      loadingShops: 'جاري تحميل المتاجر...',
      noShopsFound: 'لم يتم العثور على متاجر',
      emptyCart: 'سلتك فارغة',
      startShopping: 'ابدأ التسوق الآن!',
      continueShopping: 'متابعة التسوق',
      shoppingCart: 'سلة التسوق',
      subtotal: 'المجموع الجزئي',
      each: 'للحبة',
      shippingTaxes: 'سيتم حساب الشحن والضرائب عند الدفع',
      checkout: 'الدفع',
      or: 'أو',
      myOrders: 'طلباتي',
      orderNumber: 'طلب #',
      pending: 'قيد الانتظار',
      processing: 'جاري المعالجة',
      shipped: 'تم الشحن',
      delivered: 'تم التوصيل',
      cancelled: 'تم الإلغاء',
      returnHome: 'العودة إلى الرئيسية',
      noOrders: 'لا يوجد طلبات حتى الآن',
      selectOrderToViewDetails: 'حدد طلبًا لعرض التفاصيل',
      orderItems: 'عناصر الطلب',
      reorder: 'إعادة الطلب',
      findPerfectParts: 'اعثر على القطع المثالية لسيارتك',
      browseThousands: 'تصفح آلاف قطع غيار السيارات من متاجر موثوقة.',
      searchShops: 'البحث عن متاجر',
      searchProducts: 'البحث عن منتجات',
      viewAll: 'عرض الكل',
      loadingProducts: 'جاري تحميل المنتجات...',
      noProductsFound: 'لم يتم العثور على منتجات',
      reorderSuccess: 'تمت إضافة جميع العناصر من طلبك السابق إلى سلة التسوق',
      reorderPartial: 'تمت إضافة بعض العناصر من طلبك إلى سلة التسوق. البعض الآخر غير متوفر حاليًا.',
      reorderNoProducts: 'عذرًا، لا تتوفر أي من العناصر من طلبك حاليًا',
      reorderError: 'حدث خطأ في إعادة الطلب. يرجى المحاولة مرة أخرى.',
      loadMore: 'تحميل المزيد',
      personalInformation: 'المعلومات الشخصية',
      firstName: 'الاسم الأول',
      lastName: 'اسم العائلة',
      emailAddress: 'البريد الإلكتروني',
      phoneNumber: 'رقم الهاتف',
      notProvided: 'غير متوفر',
      quickActions: 'إجراءات سريعة',
      myCart: 'سلة التسوق',
      editProfile: 'تعديل الملف الشخصي',
      saveChanges: 'حفظ التغييرات',
      updatePhoneNumber: 'تحديث رقم الهاتف',
      phoneUpdated: 'تم تحديث رقم الهاتف بنجاح',
      phoneUpdateError: 'فشل تحديث رقم الهاتف',
      enterCouponCode: 'أدخل رمز الكوبون',
      apply: 'تطبيق',
      applying: 'جاري التطبيق...',
      discount: 'خصم',
      errorApplyingCoupon: 'خطأ في تطبيق الكوبون',
      cartEmpty: 'سلة التسوق فارغة',
      loginRequired: 'يجب تسجيل الدخول لإتمام الطلب',
      orderError: 'فشل في تقديم الطلب. يرجى المحاولة مرة أخرى.',
      completeOrder: 'إتمام الطلب',
      shipping: 'الشحن',
      total: 'المجموع',
      contactInformation: 'معلومات الاتصال',
      shippingInformation: 'معلومات الشحن',
      paymentInformation: 'معلومات الدفع',
      address: 'العنوان',
      city: 'المدينة',
      postalCode: 'الرمز البريدي',
      cardNumber: 'رقم البطاقة',
      expiryDate: 'تاريخ الانتهاء',
      save: 'حفظ',
      edit: 'تعديل',
      
      // Professional text strings in Arabic
      welcomeBack: 'مرحباً بعودتك',
      signIn: 'تسجيل الدخول',
      authenticating: 'جاري التحقق...',
      noAccount: "ليس لديك حساب؟",
      createAccountNow: 'أنشئ حساب الآن',
      joinOurCommunity: 'انضم إلى مجتمعنا',
      createAccount: 'إنشاء حساب',
      creatingYourAccount: 'جاري إنشاء حسابك...',
      alreadyHaveAccount: 'لديك حساب بالفعل؟',
      signInToYourAccount: 'سجل دخول إلى حسابك',
      confirmPassword: 'تأكيد كلمة المرور',
      
      // Added for products page in Arabic
      products: 'المنتجات',
      allCategories: 'جميع الفئات',
      inStock: 'متوفر',
      outOfStock: 'غير متوفر',
      addToCart: 'أضف إلى السلة',
      remove: 'إزالة',
      for: 'لـ',
      
      // Added for contact page in Arabic
      getInTouch: 'تواصل مع فريقنا',
      sendMessage: 'إرسال رسالة',
      yourName: 'اسمك',
      yourEmail: 'بريدك الإلكتروني',
      subject: 'الموضوع',
      message: 'الرسالة',
      sending: 'جاري الإرسال...',
      messageSent: 'تم إرسال رسالتك! سنعود إليك قريبًا.',
      email: 'البريد الإلكتروني',
      phone: 'الهاتف',
      followUs: 'تابعنا',
      
      // Added for footer
      carDescription: 'متجرك الشامل لقطع غيار السيارات وملحقاتها في مصر.',
      quickLinks: 'روابط سريعة',
      customerService: 'خدمة العملاء',
      connectWithUs: 'تواصل معنا',
      allRightsReserved: 'جميع الحقوق محفوظة',
      faq: 'الأسئلة الشائعة',
      
      // Added for payment method in Arabic
      paymentMethod: 'طريقة الدفع',
      creditCard: 'بطاقة ائتمان',
      cashOnDelivery: 'الدفع عند الاستلام',
      selectCity: 'اختر المدينة',
      cairo: 'القاهرة',
      giza: 'الجيزة',
      orderSuccess: 'تم تقديم الطلب بنجاح!',
    }
  };

  const t = (key: string) => {
    return translations[language as keyof typeof translations]?.[key as keyof typeof translations[keyof typeof translations]] || key;
  };

  const value: LanguageContextProps = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
