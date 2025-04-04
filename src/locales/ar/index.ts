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
  ...chatbot
};