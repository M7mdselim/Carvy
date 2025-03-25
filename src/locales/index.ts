import {en} from './en';
import {ar} from './ar';

export const translations = {
  en,
  ar
};

// Using type inference from the English translations to ensure consistency
export type TranslationKey = keyof typeof en;
