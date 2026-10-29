import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { apiGet, apiPost, apiPut } from './api.js'
import { useI18n } from './i18n.js'
import { makeT } from '../../server/data/i18n.js'

const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

const PANTRY_CACHE = 'mm.pantry.v1'

export function AppProvider({ children }) {
  const { lang } = useI18n() // AppProvider sits inside LangProvider
  const [user, setUser] = useState(null) // null = guest/loading resolved later
  const [userReady, setUserReady] = useState(false)
  const [pantry, setPantry] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(PANTRY_CACHE) || '[]'))
    } catch {
      return new Set()
    }
  })
  const [meta, setMeta] = useState(null)
  const [toasts, setToasts] = useState([])
  const toastId = useRef(0)
  // once the user starts ticking, the boot-time pantry sync must not wipe it
  const pantryDirtyRef = useRef(false)

  const toast = useCallback((message, tone = 'ok') => {
    const id = ++toastId.current
    setToasts((list) => [...list, { id, message, tone }])
    setTimeout(() => setToasts((list) => list.filter((x) => x.id !== id)), 2800)
  }, [])

  useEffect(() => {
    let alive = true
    Promise.allSettled([apiGet('/api/auth/me'), apiGet('/api/pantry'), apiGet('/api/recipes/meta/all')])
      .then(([me, pantryRes, metaRes]) => {
        if (!alive) return
        if (me.status === 'fulfilled') {
          setUser(me.value.user)
          setUserReady(true)
        }
        if (pantryRes.status === 'fulfilled' && !pantryDirtyRef.current) {
          const ids = pantryRes.value.ingredient_ids || []
          setPantry(new Set(ids))
          localStorage.setItem(PANTRY_CACHE, JSON.stringify(ids))
        }
        if (metaRes.status === 'fulfilled') setMeta(metaRes.value)
      })
    return () => {
      alive = false
    }
  }, [])

  const persistPantry = useCallback(
    async (ids) => {
      try {
        const res = await apiPut('/api/pantry', { ingredient_ids: ids })
        const serverIds = res.ingredient_ids || ids
        setPantry(new Set(serverIds))
        localStorage.setItem(PANTRY_CACHE, JSON.stringify(serverIds))
      } catch (e) {
        toast(e.message, 'err')
      }
    },
    [toast]
  )

  const toggleIngredient = useCallback(
    (id) => {
      pantryDirtyRef.current = true
      setPantry((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        const arr = [...next]
        localStorage.setItem(PANTRY_CACHE, JSON.stringify(arr))
        persistPantry(arr)
        return next
      })
    },
    [persistPantry]
  )

  // ADD to the selection instead of replacing it (quick-add keeps your picks)
  const addPantry = useCallback(
    (ids) => {
      pantryDirtyRef.current = true
      setPantry((prev) => {
        const next = new Set(prev)
        for (const id of ids) next.add(id)
        const arr = [...next]
        localStorage.setItem(PANTRY_CACHE, JSON.stringify(arr))
        persistPantry(arr)
        return next
      })
    },
    [persistPantry]
  )

  const replacePantry = useCallback(
    (ids) => {
      pantryDirtyRef.current = true
      setPantry(new Set(ids))
      localStorage.setItem(PANTRY_CACHE, JSON.stringify(ids))
      persistPantry(ids)
    },
    [persistPantry]
  )

  const clearPantry = useCallback(() => replacePantry([]), [replacePantry])

  // Guest pantry carries over when registering (server upgrades the guest row).
  const login = useCallback(
    async (path, payload) => {
      const res = await apiPost(path, payload)
      setUser(res.user)
      const p = await apiGet('/api/pantry').catch(() => null)
      if (p) {
        setPantry(new Set(p.ingredient_ids || []))
        localStorage.setItem(PANTRY_CACHE, JSON.stringify(p.ingredient_ids || []))
      }
      return res.user
    },
    []
  )

  const logout = useCallback(async () => {
    await apiPost('/api/auth/logout').catch(() => {})
    setUser(null)
    toast(makeT(lang)('signedOut'))
  }, [toast, lang])

  const value = useMemo(
    () => ({
      user,
      userReady,
      setUser,
      lang,
      pantry,
      pantryCount: pantry.size,
      toggleIngredient,
      addPantry,
      replacePantry,
      clearPantry,
      meta,
      toast,
      login,
      logout,
    }),
    [user, userReady, lang, pantry, toggleIngredient, addPantry, replacePantry, clearPantry, meta, toast, login, logout]
  )

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.tone === 'err' ? 'toast-err' : ''}`}>
            {t.tone === 'err' ? '⚠️' : '✓'} <span>{t.message}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}
