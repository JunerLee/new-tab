import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import zh from './zh.json'

const resources = {
  en: { translation: en },
  zh: { translation: zh }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'zh', // 默认使用中文
    fallbackLng: 'zh', // 备用语言也是中文
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  })

export default i18n