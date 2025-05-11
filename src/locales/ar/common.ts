
import common from './common';
import auth from './auth';
import products from './products';
import orders from './orders';
import checkout from './checkout';
import profile from './profile';
import ui from './ui';
import navigation from './navigation';
import faq from './faq';

// Add new translations
const chatbot = {
  multipleQuestionsDetected: "لقد وجدت عدة أسئلة في رسالتك. إليك الإجابات:",
  moreHelp: "هل تحتاج مساعدة أخرى؟",
  thankYou: "شكراً لك"
};

// Product request translations
const productRequest = {
  requestProduct: 'طلب منتج',
  requestProductTitle: 'طلب منتج',
  requestProductDescription: 'لم تجد ما تبحث عنه؟ أخبرنا وسنحاول توفيره لك.',
  carMake: 'نوع السيارة',
  carModel: 'موديل السيارة',
  selectCarMake: 'اختر نوع السيارة',
  selectCarModel: 'اختر موديل السيارة',
  productName: 'اسم المنتج',
  enterProductName: 'أدخل اسم المنتج',
  phoneNumber: 'رقم الهاتف',
  enterPhoneNumber: 'أدخل رقم هاتفك',
  submitting: 'جاري الإرسال...',
  submitRequest: 'إرسال الطلب',
  productRequestSuccess: 'تم تقديم طلب المنتج بنجاح!',
  productRequestError: 'حدث خطأ أثناء تقديم طلبك. يرجى المحاولة مرة أخرى.',
  productNameRequired: 'اسم المنتج مطلوب',
  phoneNumberRequired: 'رقم الهاتف مطلوب',
  invalidPhoneNumber: 'تنسيق رقم الهاتف غير صالح',
  notReturnable: 'غير قابل للإرجاع'
};

// Export all translation objects to maintain the flat structure for lookups
export default {
  ...common,
  ...auth,
  ...products,
  ...orders,
  ...checkout,
  ...profile,
  ...ui,
  ...navigation,
  ...faq,
  ...chatbot,
  ...productRequest
};
