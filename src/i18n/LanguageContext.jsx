import { createContext, useContext, useEffect, useState } from 'react'
import { LANGS, ui } from './translations.js'

const STORAGE_KEY = 'irnova-lang'
const LanguageContext = createContext(null)

function getInitialLang() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && ui[stored]) return stored
  } catch {
    /* ignore unavailable storage */
  }
  return 'fa'
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(getInitialLang)
  const dir = lang === 'fa' ? 'rtl' : 'ltr'

  // Keep the document, storage, and <html> attributes in sync with the choice.
  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = dir
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      /* ignore unavailable storage */
    }
  }, [lang, dir])

  const value = { lang, setLang, dir, langs: LANGS, t: ui[lang] }
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used within a LanguageProvider')
  return ctx
}
