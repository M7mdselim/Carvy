
import enTranslations from './en';
import arTranslations from './ar';

export const translations = {
  en: enTranslations,
  ar: arTranslations
};

export type TranslationKey = keyof typeof enTranslations;
