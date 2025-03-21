
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the available languages
export type Language = 'en' | 'ar';

// Define the structure of our translations
type Translations = {
  [key: string]: {
    [key in Language]: string;
  };
};

// Our actual translations
const translations: Translations = {
  // Navbar
  'home': { en: 'Home', ar: 'الرئيسية' },
  'models': { en: 'Models', ar: 'الموديلات' },
  'shops': { en: 'Shops', ar: 'المتاجر' },
  'contactUs': { en: 'Contact Us', ar: 'اتصل بنا' },
  'profile': { en: 'Profile', ar: 'الملف الشخصي' },
  'logout': { en: 'Logout', ar: 'تسجيل الخروج' },
  'login': { en: 'Login', ar: 'تسجيل الدخول' },
  'register': { en: 'Register', ar: 'إنشاء حساب' },
  
  // Footer
  'quickLinks': { en: 'Quick Links', ar: 'روابط سريعة' },
  'customerService': { en: 'Customer Service', ar: 'خدمة العملاء' },
  'connectWithUs': { en: 'Connect With Us', ar: 'تواصل معنا' },
  'shippingInformation': { en: 'Shipping Information', ar: 'معلومات الشحن' },
  'faq': { en: 'FAQ', ar: 'الأسئلة الشائعة' },
  'allRightsReserved': { en: 'All rights reserved', ar: 'جميع الحقوق محفوظة' },
  
  // Home page
  'findPerfectParts': { en: 'Find the Perfect Parts for Your Car in Egypt', ar: 'اعثر على قطع الغيار المثالية لسيارتك في مصر' },
  'browseThousands': { en: 'Browse thousands of auto parts from trusted sellers worldwide', ar: 'تصفح آلاف قطع غيار السيارات من البائعين الموثوقين في جميع أنحاء العالم' },
  'browseModels': { en: 'Browse Models', ar: 'تصفح الموديلات' },
  'featuredShops': { en: 'Featured Shops', ar: 'المتاجر المميزة' },
  'featuredProducts': { en: 'Featured Products', ar: 'المنتجات المميزة' },
  'searchPlaceholder': { en: 'Search for parts, shops, brands, or car models...', ar: 'ابحث عن قطع غيار، متاجر، علامات تجارية، أو موديلات سيارات...' },
  
  // Cart
  'cart': { en: 'Cart', ar: 'عربة التسوق' },
  'shoppingCart': { en: 'Shopping Cart', ar: 'عربة التسوق' },
  'emptyCart': { en: 'Your cart is empty', ar: 'عربة التسوق فارغة' },
  'startShopping': { en: 'Start shopping to add items to your cart', ar: 'ابدأ التسوق لإضافة منتجات إلى عربة التسوق' },
  'continueShopping': { en: 'Continue Shopping', ar: 'مواصلة التسوق' },
  'subtotal': { en: 'Subtotal', ar: 'المجموع الفرعي' },
  'shippingTaxes': { en: 'Shipping and taxes calculated at checkout', ar: 'يتم احتساب الشحن والضرائب عند الدفع' },
  'checkout': { en: 'Checkout', ar: 'إتمام الشراء' },
  'each': { en: 'each', ar: 'لكل' },
  
  // Categories
  'allCategories': { en: 'All Categories', ar: 'جميع الفئات' },
  
  // Shops
  'findBestShops': { en: 'Find the best shops for', ar: 'ابحث عن أفضل المتاجر لـ' },
  'noShopsFound': { en: 'No shops found for this category', ar: 'لا توجد متاجر لهذه الفئة' },
  
  // Contact
  'getInTouch': { en: 'Get In Touch', ar: 'تواصل معنا' },
  'email': { en: 'Email', ar: 'البريد الإلكتروني' },
  'phone': { en: 'Phone', ar: 'الهاتف' },
  'address': { en: 'Address', ar: 'العنوان' },
  'followUs': { en: 'Follow Us', ar: 'تابعنا' },
  'sendMessage': { en: 'Send us a Message', ar: 'أرسل لنا رسالة' },
  'yourName': { en: 'Your Name', ar: 'اسمك' },
  'yourEmail': { en: 'Your Email', ar: 'بريدك الإلكتروني' },
  'subject': { en: 'Subject', ar: 'الموضوع' },
  'message': { en: 'Message', ar: 'الرسالة' },
  'sending': { en: 'Sending...', ar: 'جاري الإرسال...' },
};

// Define the structure of our context
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: () => 'ltr' | 'rtl';
}

// Create the context with a default value
const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: () => '',
  dir: () => 'ltr',
});

// Create a provider component
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Try to get the language from localStorage
    const savedLanguage = localStorage.getItem('language');
    return (savedLanguage === 'ar' ? 'ar' : 'en') as Language;
  });

  // Function to translate text
  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation '${key}' not found.`);
      return key;
    }
    return translations[key][language] || key;
  };

  // Function to return the correct text direction
  const dir = (): 'ltr' | 'rtl' => {
    return language === 'ar' ? 'rtl' : 'ltr';
  };

  // Save language to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('language', language);
    // Set the dir attribute on the html element
    document.documentElement.dir = dir();
    // Set a css class on the body for additional styling
    if (language === 'ar') {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Create a hook to use the language context
export const useLanguage = () => useContext(LanguageContext);
