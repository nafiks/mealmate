import { useEffect, useMemo, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { apiGet } from '../api.js'
import { useApp } from '../store.jsx'
import { useI18n, cuisineLabel, tagLabel } from '../i18n.js'
import RecipeCard, { readFavorites, writeFavorites } from '../components/RecipeCard.jsx'
import Reveal from '../components/Reveal.jsx'
import { IconSearch } from '../components/icons.jsx'

export default function Catalog() {
  const { meta, toast, lang } = useApp()
  const { t } = useI18n()
  const [params, setParams] = useSearchParams()
  const [recipes, setRecipes] = useState(null)
  const [q, setQ] = useState(params.get('q') || '')
  const [favs, setFavs] = useState(readFavorites)

  const cuisine = params.get('cuisine') || ''
  const tag = params.get('tag') || ''
  const savedOnly = params.get('saved') === '1'

  const setParam = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      const p = new URLSearchParams()
      if (q.trim()) p.set('q', q.trim())
      if (cuisine) p.set('cuisine', cuisine)
      if (tag) p.set('tag', tag)
      p.set('lang', lang)
      apiGet(`/api/recipes?${p}`)
        .then((d) => setRecipes(d.all || []))
        .catch(() => toast(t('matchFail'), 'err'))
    }, 200)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, cuisine, tag, lang])

  useEffect(() => {
    const onStorage = () => setFavs(readFavorites())
    window.addEventListener('focus', onStorage)
    return () => window.removeEventListener('focus', onStorage)
  }, [])

  // resume the heart the user tapped before being sent to sign in
  const location = useLocation()
  useEffect(() => {
    const s = location.state
    if (s?.resumeIntent === 'fav' && s.resumeRecipeId) {
      setFavs((prev) => {
        const next = new Set(prev)
        next.add(Number(s.resumeRecipeId))
        writeFavorites(next)
        return next
      })
      window.history.replaceState({}, '')
    }
  }, [location.state])

  const shown = useMemo(() => {
    if (!recipes) return []
    return savedOnly ? recipes.filter((x) => favs.has(x.id)) : recipes
  }, [recipes, savedOnly, favs])

  return (
    <main className="container catalog-page">
      <Reveal>
        <p className="kicker">{t('catKicker')}</p>
        <h1 className="h1">{t.pluralRecipes(shown.length || 0)}<em>.</em></h1>
        <p className="page-sub">{t('catSub')}</p>
      </Reveal>

      <div className="catalog-toolbar">
        <div className="picker-search grow">
          <IconSearch size={16} />
          <input
            type="search"
            placeholder={t('catSearch')}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label={t('catSearch')}
          />
        </div>
        <div className="filter-group">
          <button type="button" className={`f-pill ${!cuisine ? 'on' : ''}`} onClick={() => setParam('cuisine', '')}>
            {t('allCuisines')}
          </button>
          {(meta?.cuisines || []).map((c) => (
            <button
              key={c.name}
              type="button"
              className={`f-pill ${cuisine === c.name ? 'on' : ''}`}
              onClick={() => setParam('cuisine', cuisine === c.name ? '' : c.name)}
            >
              {cuisineLabel(lang, c.name)}
            </button>
          ))}
        </div>
        <div className="filter-group">
          <button
            type="button"
            className={`f-pill ${savedOnly ? 'on' : ''}`}
            onClick={() => setParam('saved', savedOnly ? '' : '1')}
          >
            ♥ {t('savedOnly')} ({favs.size})
          </button>
          {(meta?.tags || []).slice(0, 5).map((tagItem) => (
            <button
              key={tagItem.name}
              type="button"
              className={`f-pill ${tag === tagItem.name ? 'on' : ''}`}
              onClick={() => setParam('tag', tag === tagItem.name ? '' : tagItem.name)}
            >
              {tagLabel(lang, tagItem.name)}
            </button>
          ))}
        </div>
      </div>

      {recipes === null && <p className="results-loading">{t('loadingRecipes')}</p>}

      {recipes !== null && (
        shown.length > 0 ? (
          <div className="grid-3 catalog-grid">
            {shown.map((recipe, i) => <RecipeCard key={recipe.id} recipe={recipe} delay={(i % 3) * 60} />)}
          </div>
        ) : (
          <div className="empty-hero">
            <span className="empty-emoji">🔍</span>
            <h3>{t('catNothing')}</h3>
            <p>{t('catNothingD')}</p>
          </div>
        )
      )}
    </main>
  )
}
