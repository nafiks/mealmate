// Client-side i18n: language context + re-export of shared label dictionaries.
// UI strings & label maps live in server/data/i18n.js (single source of truth,
// used by the API for content columns and by the client for chrome).
import { createContext, useContext, createElement, useEffect, useMemo, useState } from 'react'
import { LANGS, makeT, CUISINE_I18N, TAG_I18N, CATEGORY_I18N, QUICK_SET_I18N, INGREDIENT_I18N } from '../../server/data/i18n.js'

export { LANGS, CUISINE_I18N, TAG_I18N, CATEGORY_I18N, QUICK_SET_I18N, INGREDIENT_I18N }

const LangCtx = createContext(null)
export const useI18n = () => useContext(LangCtx)

const LANG_KEY = 'mm.lang'

function detectLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY)
    if (saved && ['en', 'ru', 'kk'].includes(saved)) return saved
  } catch { /* ignore */ }
  const nav = (navigator.language || 'en').toLowerCase()
  if (nav.startsWith('ru')) return 'ru'
  if (nav.startsWith('kk') || nav.startsWith('kz')) return 'kk'
  return 'ru' // the audience is CIS students; Russian is the safe default
}

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(detectLang)

  useEffect(() => {
    document.documentElement.lang = lang === 'kk' ? 'kk' : lang
  }, [lang])

  const value = useMemo(() => {
    const setLang = (code) => {
      setLangState(code)
      try {
        localStorage.setItem(LANG_KEY, code)
      } catch { /* ignore */ }
    }
    return { lang, setLang, t: makeT(lang), langs: LANGS }
  }, [lang])

  return createElement(LangCtx.Provider, { value }, children)
}

// label helpers -------------------------------------------------------------
export const cuisineLabel = (lang, name) => {
  const entry = CUISINE_I18N[name]
  if (!entry) return name
  return lang === 'ru' ? entry[0] : lang === 'kk' ? entry[1] : name
}
export const tagLabel = (lang, name) => {
  const entry = TAG_I18N[name]
  if (!entry) return name
  return lang === 'ru' ? entry[0] : lang === 'kk' ? entry[1] : name
}
export const categoryLabel = (lang, name) => {
  if (name === 'All') return makeT(lang)('catAll')
  const entry = CATEGORY_I18N[name]
  if (!entry) return name.replace(' & ', ' · ')
  return lang === 'ru' ? entry[0] : lang === 'kk' ? entry[1] : name.replace(' & ', ' · ')
}
export const quickSetLabel = (lang, set) => {
  const entry = QUICK_SET_I18N[set.id]
  const title = entry ? (lang === 'ru' ? entry[0] : lang === 'kk' ? entry[1] : set.title) : set.title
  return { ...set, title }
}
export const ingName = (lang, item) => {
  if (lang === 'ru' && item.name_ru) return item.name_ru
  if (lang === 'kk' && item.name_kk) return item.name_kk
  return item.name
}
