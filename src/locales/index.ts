
import en from './en';
import ar from './ar';

export const translations = {
  en,
  ar
};

// Using type inference from the English translations to ensure consistency
// but also allowing for any string values to support dynamic translation keys
export type TranslationKey = keyof typeof en | string;
