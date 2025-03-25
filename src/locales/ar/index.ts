
import common from './common';
import auth from './auth';
import products from './products';
import orders from './orders';
import checkout from './checkout';
import profile from './profile';
import ui from './ui';
import navigation from './navigation';
import faq from './faq';

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
  ...faq
};
