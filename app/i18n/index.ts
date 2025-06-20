import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en.json';
import zhTWTranslations from './locales/zh-TW.json';

const resources = {
  en: {
    translation: enTranslations
  },
  'zh-TW': {
    translation: zhTWTranslations
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'zh-TW',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 