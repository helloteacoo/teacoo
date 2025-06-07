import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import zh from "./locales/zh.json";
import en from "./locales/en.json";

i18n
  .use(LanguageDetector) // 偵測語系
  .use(initReactI18next) // 套用到 React
  .init({
    resources: {
      zh: { translation: zh },
      en: { translation: en },
    },
    fallbackLng: "en", // 偵測不到時預設語言
    interpolation: {
      escapeValue: false, // react 自帶 XSS 處理
    },
  });

export default i18n;
