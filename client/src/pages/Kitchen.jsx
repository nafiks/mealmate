import { useEffect, useMemo, useRef, useState } from 'react'
import { apiGet } from '../api.js'
import { useApp } from '../store.jsx'
import { useI18n, categoryLabel, quickSetLabel } from '../i18n.js'
import RecipeCard from '../components/RecipeCard.jsx'
import Reveal from '../components/Reveal.jsx'
import { IconSearch, IconCheck, IconX } from '../components/icons.jsx'

const TIME_FILTERS = [
  { v: null, labelKey: 'timeAny' },
  { v: 15, labelKey: 'max15' },
  { v: 30, labelKey: 'max30' },
  { v: 45, labelKey: 'max45' },
]

export default function Kitchen() {
  const { pantry, toggleIngredient, addPantry, replacePantry, meta, toast, lang } = useApp()
  const { t } = useI18n()
  const [data, setData] = useState(null)
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')

  const [maxTime, setMaxTime] = useState(null)
  const [cuisine, setCuisine] = useState('')
  const [tag, setTag] = useState('')

  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const resultsRef = useRef(null)
  const firstLoad = useRef(true)

  useEffect(() => {
    apiGet('/api/ingredients').then(setData).catch(() => toast(t('ingFail'), 'err'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pantryKey = useMemo(() => [...pantry].sort((a, b) => a - b).join(','), [pantry])

  // Live matching — debounced so fast tapping does not spam the API.
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true)
      const params = new URLSearchParams()
      if (pantryKey) params.set('ingredients', pantryKey)
      if (maxTime) params.set('maxTime', maxTime)
      if (cuisine) params.set('cuisine', cuisine)
      if (tag) params.set('tag', tag)
      params.set('lang', lang)
      apiGet(`/api/recipes?${params}`)
        .then((d) => setResults({ cookNow: d.cookNow, almost: d.almost }))
        .catch(() => toast(t('matchFail'), 'err'))
        .finally(() => setLoading(false))
    }, firstLoad.current ? 0 : 220)
    firstLoad.current = false
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pantryKey, maxTime, cuisine, tag, lang])

  const categories = useMemo(() => {
    if (!data) return ['All']
    return ['All', ...Object.keys(data.grouped)]
  }, [data])

  const visibleChips = useMemo(() => {
    if (!data) return []
    const q = query.trim().toLowerCase()
    let list = data.ingredients.filter((i) => !i.staple)
    // with an active search, look through ALL categories — the tabs are for browsing
    if (q) {
      return list.filter((i) =>
        [i.name, i.name_ru, i.name_kk].some((n) => n && n.toLowerCase().includes(q))
      )
    }
    if (category !== 'All') list = list.filter((i) => i.category === category)
    return list
  }, [data, category, query])

  // quick sets store ingredient KEYS ('eggs'); resolve them to numeric ids
  const keyToId = useMemo(() => {
    const map = {}
    for (const i of data?.ingredients || []) if (i.key) map[i.key] = i.id
    return map
  }, [data])

  const applyQuickSet = (set) => {
    const ids = set.items.map((k) => keyToId[k]).filter(Boolean)
    if (!ids.length) return
    const added = ids.filter((id) => !pantry.has(id)).length
    addPantry(ids)
    toast(t('quickAdded', { x: quickSetLabel(lang, set).title, n: added }))
  }

  const cookNow = results?.cookNow || []
  const almost = results?.almost || []
  const total = cookNow.length + almost.length
  const selected = pantry.size
  const hasFilters = maxTime || cuisine || tag

  const emptyText = selected === 0
    ? t('emptyTick')
    : total === 0
      ? t('emptyLoosen')
      : t('emptyClose')

  return (
    <main className="kitchen-page container">
      <Reveal>
        <p className="kicker">{t('kitKicker')}</p>
        <h1 className="h1">{t('kitTitleA')} <em>{t('kitTitleB')}</em></h1>
        <p className="page-sub">{t('kitSub')}</p>
      </Reveal>

      <div className="kitchen-grid">
        {/* ----- picker ----- */}
        <aside className="picker" aria-label="Ingredient picker">
          <div className="picker-search">
            <IconSearch size={16} />
            <input
              type="search"
              placeholder={t('searchIng')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={t('searchIng')}
            />
          </div>

          <div className="cat-row" role="tablist" aria-label="Categories">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={category === c}
                className={`cat-pill ${category === c ? 'on' : ''}`}
                onClick={() => setCategory(c)}
              >
                {categoryLabel(lang, c)}
              </button>
            ))}
          </div>

          {data?.quickSets && (
            <div className="quick-sets">
              <span className="quick-label">{t('quickAdd')}</span>
              {data.quickSets.map((s) => {
                const labeled = quickSetLabel(lang, s)
                return (
                  <button
                    key={s.id}
                    type="button"
                    className="quick-pill"
                    title={t('quickSetHint')}
                    onClick={() => applyQuickSet(s)}
                  >
                    + {s.emoji} {labeled.title}
                  </button>
                )
              })}
            </div>
          )}

          <div className="picker-status">
            <strong>{selected} {t('selected')}</strong>
            {selected > 0 && (
              <button type="button" className="link-clear" onClick={() => replacePantry([])}>
                <IconX size={12} /> {t('clearAll')}
              </button>
            )}
          </div>

          <div className="chip-grid">
            {visibleChips.map((i) => (
              <button
                key={i.id}
                type="button"
                className={`chip ${pantry.has(i.id) ? 'on' : ''}`}
                onClick={() => toggleIngredient(i.id)}
                aria-pressed={pantry.has(i.id)}
              >
                <span className="chip-dot" aria-hidden="true"><IconCheck size={10} /></span>
                <span className="emoji">{i.emoji}</span>
                <span className="name">{nameFor(i)}</span>
              </button>
            ))}
            {visibleChips.length === 0 && <p className="picker-empty">{t('nothingFound')}</p>}
          </div>
        </aside>

        {/* ----- results ----- */}
        <section className="results" ref={resultsRef} aria-live="polite">
          <div className="filters">
            <div className="filter-group" role="group" aria-label="Cooking time">
              {TIME_FILTERS.map((f) => (
                <button
                  key={f.labelKey}
                  type="button"
                  className={`f-pill ${maxTime === f.v ? 'on' : ''}`}
                  onClick={() => setMaxTime(f.v)}
                >
                  {t(f.labelKey)}
                </button>
              ))}
            </div>
            {meta?.tags?.length > 0 && (
              <div className="filter-group" role="group" aria-label="Tags">
                <button type="button" className={`f-pill ${tag === '' ? 'on' : ''}`} onClick={() => setTag('')}>
                  {t('allTags')}
                </button>
                {meta.tags.slice(0, 6).map((tagItem) => (
                  <button
                    key={tagItem.name}
                    type="button"
                    className={`f-pill ${tag === tagItem.name ? 'on' : ''}`}
                    onClick={() => setTag(tag === tagItem.name ? '' : tagItem.name)}
                  >
                    {tagItem.name === 'Fast' ? fastLabel() : tagLabelFor(tagItem.name)}
                  </button>
                ))}
              </div>
            )}
            {meta?.cuisines?.length > 0 && (
              <label className="filter-select">
                <select value={cuisine} onChange={(e) => setCuisine(e.target.value)} aria-label={t('allCuisines')}>
                  <option value="">{t('allCuisines')}</option>
                  {meta.cuisines.map((c) => (
                    <option key={c.name} value={c.name}>{cuisineName(c.name)} ({c.count})</option>
                  ))}
                </select>
              </label>
            )}
          </div>

          {loading && !results && <p className="results-loading">{t('lookingFridge')}</p>}

          {results && (
            <>
              <div className="result-block">
                <div className="result-head">
                  <span className="dot dot-green" />
                  <h2>{t('cookNow')}</h2>
                  <span className="count-badge">{cookNow.length}</span>
                  {hasFilters && (
                    <button type="button" className="link-clear" onClick={() => { setMaxTime(null); setCuisine(''); setTag('') }}>
                      {t('resetFilters')}
                    </button>
                  )}
                </div>
                {cookNow.length > 0 ? (
                  <div className="grid-2">
                    {cookNow.map((recipe, i) => <RecipeCard key={recipe.id} recipe={recipe} delay={Math.min(i, 5) * 60} />)}
                  </div>
                ) : (
                  <p className="result-empty">{emptyText}</p>
                )}
              </div>

              {almost.length > 0 && (
                <div className="result-block">
                  <div className="result-head">
                    <span className="dot dot-tomato" />
                    <h2>{t('almost')}</h2>
                    <span className="count-badge">{almost.length}</span>
                    <span className="result-hint">{t('almostHint')}</span>
                  </div>
                  <div className="grid-2">
                    {almost.map((recipe, i) => <RecipeCard key={recipe.id} recipe={recipe} delay={Math.min(i, 5) * 60} />)}
                  </div>
                </div>
              )}

              {total === 0 && selected > 0 && !loading && (
                <div className="empty-hero">
                  <span className="empty-emoji">🧑‍🍳</span>
                  <h3>{t('noMatchesT')}</h3>
                  <p>{t('noMatchesD')}</p>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* mobile sticky action bar — the explicit "next step" testers asked for */}
      <div className={`kbar ${selected > 0 ? 'show' : ''}`}>
        <span className="kbar-count"><strong>{selected}</strong> {t('selected')} · {t.countMatches(total)}</span>
        <button type="button" className="btn btn-lime" onClick={() =>
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }>
          {t('showMatches')} ↓
        </button>
      </div>
    </main>
  )

  function nameFor(i) {
    if (lang === 'ru') return i.name_ru || i.name
    if (lang === 'kk') return i.name_kk || i.name
    return i.name
  }
  function fastLabel() { return tagLabelFor('Fast') }
  function tagLabelFor(name) {
    const map = { Breakfast: ['Завтрак', 'Таңғы ас'], Soup: ['Суп', 'Сорпа'], Side: ['Гарнир', 'Гарнир'], Salad: ['Салат', 'Салат'], Dessert: ['Десерт', 'Десерт'], Fast: ['Быстро', 'Жылдам'] }
    const e = map[name]
    return e ? (lang === 'ru' ? e[0] : lang === 'kk' ? e[1] : name) : name
  }
  function cuisineName(name) {
    const map = { Kazakh: ['Казахская', 'Қазақ'], Russian: ['Русская', 'Орыс'], European: ['Европейская', 'Еуропа'], Asian: ['Азиатская', 'Азиа'], Mexican: ['Мексиканская', 'Мексика'] }
    const e = map[name]
    return e ? (lang === 'ru' ? e[0] : lang === 'kk' ? e[1] : name) : name
  }
  function countText(n) { return t.countMatches(n) } // eslint-disable-line
}
