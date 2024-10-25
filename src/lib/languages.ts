import { z } from 'zod';

// make a list of languages and their code
export const languageList = ["en", "id", "hi", "es"] as const
export const languageListSchema = z.enum(languageList)
export type LanguageCode = z.infer<typeof languageListSchema>

export const languageNameMap: Record<LanguageCode, Record<LanguageCode, string>> = {
    en: {
        en: "English",
        id: "Indonesian",
        hi: "Hindi",
        es: "Spanish",
    },
    id: {
        en: "Bahasa Inggris",
        id: "Bahasa Indonesia",
        hi: "Bahasa Hindi",
        es: "Bahasa Spanyol",
    },
    hi: {
        en: "अंग्रेज़ी",
        id: "इंडोनेशियाई",
        hi: "हिन्दी",
        es: "Español",
    },
    es: {
        en: "English",
        id: "Indonesian",
        hi: "Hindi",
        es: "Español",
    }
}

export function getListWithoutLanguage(language: LanguageCode) {
  return languageList.filter(lang => lang !== language)
}
