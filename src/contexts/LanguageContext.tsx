"use client"

import type React from "react"
import { createContext, useState, useContext, type ReactNode, useEffect } from "react"
import { translations, type TranslationKey } from "../locales"

export type Language = "en" | "ar"

interface LanguageContextType {
  language: Language
  t: (key: TranslationKey | string) => string
  changeLanguage: (language: Language) => void
  isRtl: boolean
}

const defaultValue: LanguageContextType = {
  language: "ar",
  t: (key: TranslationKey | string) => key.toString(),
  changeLanguage: () => {},
  isRtl: true,
}

const LanguageContext = createContext<LanguageContextType>(defaultValue)

// Hook to use language context
export const useLanguage = () => useContext(LanguageContext)

interface LanguageProviderProps {
  children: ReactNode
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Try to get stored language preference or default to Arabic
  const getInitialLanguage = (): Language => {
    const savedLanguage = localStorage.getItem("language")
    return (savedLanguage as Language) || "ar"
  }

  const [language, setLanguage] = useState<Language>(getInitialLanguage)
  const isRtl = language === "ar"

  // Apply RTL direction when language is Arabic, but keep navbar in LTR
  useEffect(() => {
    // Set the language attribute for accessibility
    document.documentElement.lang = language
    localStorage.setItem("language", language)

    // Apply RTL to content areas only, not the navbar
    const contentElements = document.querySelectorAll(".content-area")
    contentElements.forEach((element) => {
      element.setAttribute("dir", isRtl ? "rtl" : "ltr")
    })

    // Keep navbar LTR regardless of language
    const navbarElements = document.querySelectorAll(".navbar-container")
    navbarElements.forEach((element) => {
      element.setAttribute("dir", "ltr")
    })

    // Apply RTL-specific CSS to body for global styles
    if (isRtl) {
      document.body.classList.add("rtl")
    } else {
      document.body.classList.remove("rtl")
    }

    // Set the default direction for the document
    // This affects elements that don't have a specific dir attribute
    document.documentElement.dir = isRtl ? "rtl" : "ltr"
  }, [language, isRtl])

  // Translation function
  const t = (key: TranslationKey | string): string => {
    // First try to find the key in the translations
    if (typeof key === "string") {
      // For product details page, add some custom translations if they don't exist
      if (key === "estimatedDelivery" && !translations[language]["estimatedDelivery"]) {
        return language === "en" ? "Est. delivery" : "التسليم المقدر"
      }
      if (key === "acceptedWithin" && !translations[language]["acceptedWithin"]) {
        return language === "en" ? "Accepted within" : "مقبول خلال"
      }
      if (key === "days" && !translations[language]["days"]) {
        return language === "en" ? "days" : "أيام"
      }
      if (key === "buyerPaysReturnShipping" && !translations[language]["buyerPaysReturnShipping"]) {
        return language === "en" ? "Buyer pays return shipping." : "المشتري يدفع شحن الإرجاع."
      }
      if (key === "condition" && !translations[language]["condition"]) {
        return language === "en" ? "Condition" : "الحالة"
      }
      if (key === "new" && !translations[language]["new"]) {
        return language === "en" ? "New" : "جديد"
      }
      if (key === "buyItNow" && !translations[language]["buyItNow"]) {
        return language === "en" ? "Buy It Now" : "اشتر الآن"
      }
      if (key === "seeAllDetails" && !translations[language]["seeAllDetails"]) {
        return language === "en" ? "See all details" : "مشاهدة كافة التفاصيل"
      }
      if (key === "aboutThisProduct" && !translations[language]["aboutThisProduct"]) {
        return language === "en" ? "About this product" : "حول هذا المنتج"
      }
      if (key === "brand" && !translations[language]["brand"]) {
        return language === "en" ? "Brand" : "العلامة التجارية"
      }
      if (key === "shipping" && !translations[language]["shipping"]) {
        return language === "en" ? "shipping" : "الشحن"
      }
      if (key === "returns" && !translations[language]["returns"]) {
        return language === "en" ? "Returns" : "المرتجعات"
      }
      if (key === "positive feedback" && !translations[language]["positive feedback"]) {
        return language === "en" ? "positive feedback" : "تقييم إيجابي"
      }
      if (key === "thankYouForRating" && !translations[language]["thankYouForRating"]) {
        return language === "en" ? "Thank you for your rating!" : "شكراً على تقييمك!"
      }
      if (key === "ratings" && !translations[language]["ratings"]) {
        return language === "en" ? "ratings" : "تقييمات"
      }
      if (key === "specifications" && !translations[language]["specifications"]) {
        return language === "en" ? "Specifications" : "المواصفات"
      }
      if (key === "shareProduct" && !translations[language]["shareProduct"]) {
        return language === "en" ? "Share Product" : "مشاركة المنتج"
      }
      if (key === "soldBy" && !translations[language]["soldBy"]) {
        return language === "en" ? "Sold by" : "يباع بواسطة"
      }
      if (key === "unavailable" && !translations[language]["unavailable"]) {
        return language === "en" ? "Unavailable" : "غير متوفر"
      }
      if (key === "orderSummary" && !translations[language]["orderSummary"]) {
        return language === "en" ? "Order Summary" : "ملخص الطلب"
      }
      if (key === "tax" && !translations[language]["tax"]) {
        return language === "en" ? "Tax" : "الضريبة"
      }

      // Handle string keys - attempt to use as translation key or return as-is
      return translations[language][key as keyof (typeof translations)[typeof language]] || key
    }
    // Handle keys from the TranslationKey type
    return translations[language][key] || String(key)
  }

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage)
  }

  return <LanguageContext.Provider value={{ language, t, changeLanguage, isRtl }}>{children}</LanguageContext.Provider>
}

// Export for convenience
export default LanguageContext
