import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { apiGet } from '../api.js'
import { useApp } from '../store.jsx'
import { useI18n, cuisineLabel, ingName } from '../i18n.js'
import Reveal from '../components/Reveal.jsx'
import DiaryModal from '../components/DiaryModal.jsx'
import { CUISINE_EMOJI } from '../components/RecipeCard.jsx'
import {
  IconArrowLeft, IconClock, IconFlame, IconServings, IconCheck,
  IconCopy, IconCamera, IconHeart,
} from '../components/icons.jsx'
import { readFavorites, writeFavorites } from '../components/RecipeCard.jsx'

const DAILY = { kcal: 2000, protein: 60, fat: 70, carbs: 290 }

function MacroBar({ label, value, unit, daily, tone }) {
  const pct = Math.min(100, Math.round((value / daily) * 100))
  return (
    <div className="macro-row">
      <span className="macro-label">{label}</span>
      <div className="macro-track">
        <div className={`macro-fill ${tone}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="macro-value">{value}{unit}</span>
    </div>
  )
}

export default function Recipe() {
  const { id } = useParams()
  const { pantry, toast, lang, user, userReady } = useApp()
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const [recipe, setRecipe] = useState(null)
  const [error, setError] = useState(null)
  const [diaryOpen, setDiaryOpen] = useState(false)
  const [favs, setFavs] = useState(readFavorites)

  const isAuthed = userReady && user && !user.isGuest

  // Resume the action the user was attempting before being sent to sign in.
  useEffect(() => {
    const s = location.state
    if (s?.resumeIntent && isAuthed) {
      if (s.resumeIntent === 'diary') setDiaryOpen(true)
      if (s.resumeIntent === 'fav') {
        setFavs((prev) => {
          const next = new Set(prev)
          next.add(recipe?.id ?? Number(s.resumeRecipeId))
          writeFavorites(next)
          return next
        })
      }
      navigate(location.pathname, { replace: true, state: null })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed, location.state])

  useEffect(() => {
    setRecipe(null)
    setError(null)
    const params = new URLSearchParams()
    if (pantry.size) params.set('ingredients', [...pantry].join(','))
    params.set('lang', lang)
    apiGet(`/api/recipes/${id}?${params}`)
      .then(setRecipe)
      .catch((e) => setError(e.status === 404 ? t('notExist') : e.message))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, pantry, lang])

  useEffect(() => { window.scrollTo(0, 0) }, [id])

  if (error) {
    return (
      <main className="container">
        <div className="empty-hero">
          <span className="empty-emoji">🥄</span>
          <h3>{error}</h3>
          <Link to="/recipes" className="btn btn-primary">{t('backRecipes')}</Link>
        </div>
      </main>
    )
  }

  if (!recipe) {
    return (
      <main className="container">
        <p className="results-loading">{t('plating')}</p>
      </main>
    )
  }

  const missing = recipe.ingredients.filter((i) => !i.have && !i.optional && !i.staple)
  const isFav = favs.has(recipe.id)

  // Gated actions: guests are sent to sign in first, then the action resumes.
  const requireAuth = (intent) => {
    toast(t(intent === 'fav' ? 'signInToSave' : 'signInToDiary'), 'err')
    navigate('/login', { state: { from: `/recipes/${id}`, intent, recipeId: id } })
  }
  const openDiary = () => {
    if (!isAuthed) return requireAuth('diary')
    setDiaryOpen(true)
  }
  const toggleFav = () => {
    if (!isAuthed) return requireAuth('fav')
    const next = new Set(favs)
    if (next.has(recipe.id)) next.delete(recipe.id)
    else next.add(recipe.id)
    setFavs(next)
    writeFavorites(next)
  }

  const copyMissing = async () => {
    const text = `${recipe.title} — ${t('shoppingFor')}:\n` + missing.map((m) => `• ${m.name}`).join('\n')
    try {
      await navigator.clipboard.writeText(text)
      toast(t('copyOk'))
    } catch {
      toast(t('copyErr'), 'err')
    }
  }

  const qty = (item) => {
    const q = t.phrase(item.quantity)
    const u = item.unit ? ` ${t.unit(item.unit.replace(' (for frying)', '').trim())}` : ''
    const frying = item.unit?.includes('for frying') && lang !== 'en' ? '' : ''
    return `${q}${u}${frying}`
  }

  return (
    <main className="container recipe-page">
      <Link to="/recipes" className="back-link"><IconArrowLeft size={15} /> {t('back')}</Link>

      {/* ----- hero ----- */}
      <Reveal className="recipe-hero grain">
        {recipe.image ? (
          <img src={recipe.image} alt={recipe.title} />
        ) : (
          <div className="hero-fallback" data-emoji={CUISINE_EMOJI[recipe.cuisine] || '🍽️'} />
        )}
        <div className="recipe-hero-overlay">
          <span className="glass-pill">{cuisineLabel(lang, recipe.cuisine)}</span>
          <h1 className="h1">{recipe.title}</h1>
          <div className="hero-meta">
            <span className="glass-pill"><IconClock size={13} /> {recipe.time_min} {t('min')}</span>
            <span className="glass-pill"><IconServings size={13} /> {recipe.servings} {t('servingsWord')}</span>
            <span className="glass-pill"><IconFlame size={13} /> {recipe.kcal} {t('kcal')}</span>
          </div>
        </div>
      </Reveal>

      <div className="recipe-grid">
        {/* ----- ingredients ----- */}
        <aside className="ing-card">
          <h2 className="h3">{t('ingredients')}</h2>
          {missing.length > 0 && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={copyMissing}>
              <IconCopy size={13} /> {t('copyMissing', { n: missing.length })}
            </button>
          )}
          <ul className="ing-list">
            {recipe.ingredients.filter((i) => !i.staple).map((item) => (
              <li key={item.id} className={item.have ? 'have' : 'not-have'}>
                <span className="ing-emoji">{item.emoji}</span>
                <span className="ing-name">
                  {ingName(lang, item)}
                  {item.optional && <em className="ing-opt">{t('optional')}</em>}
                </span>
                <span className="ing-qty">{qty(item)}</span>
                <span className={`ing-state ${item.have ? 'ok' : 'miss'}`}>
                  {item.have ? <IconCheck size={11} /> : '+'}
                </span>
              </li>
            ))}
          </ul>
          {recipe.ingredients.some((i) => i.staple) && (
            <>
              <p className="ing-staples-title">{t('alwaysHave')}</p>
              <ul className="ing-list ing-staples">
                {recipe.ingredients.filter((i) => i.staple).map((item) => (
                  <li key={item.id} className="have staple">
                    <span className="ing-emoji">{item.emoji}</span>
                    <span className="ing-name">{ingName(lang, item)}</span>
                    <span className="ing-qty">{qty(item)}</span>
                    <span className="ing-state ok"><IconCheck size={11} /></span>
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="macros">
            <h3 className="h4">{t('perServing')}</h3>
            <MacroBar label={t('calories')} value={recipe.kcal} unit={` ${t('kcal')}`} daily={DAILY.kcal} tone="t-green" />
            <MacroBar label={t('protein')} value={recipe.protein} unit=" g" daily={DAILY.protein} tone="t-lime" />
            <MacroBar label={t('fat')} value={recipe.fat} unit=" g" daily={DAILY.fat} tone="t-amber" />
            <MacroBar label={t('carbs')} value={recipe.carbs} unit=" g" daily={DAILY.carbs} tone="t-tomato" />
          </div>
        </aside>

        {/* ----- steps + cta ----- */}
        <section className="steps-col">
          <h2 className="h3">{t('howMake')}</h2>
          <ol className="steps-list">
            {recipe.steps.map((s) => (
              <li key={s.n} className="step">
                <span className="step-n">{String(s.n).padStart(2, '0')}</span>
                <p>{s.description}</p>
              </li>
            ))}
          </ol>

          <Reveal className="cook-cta grain">
            <div>
              <h3>{t('cookedT')}</h3>
              <p>{t('cookedD')}</p>
            </div>
            <div className="cook-cta-actions">
              <button type="button" className="btn btn-lime" onClick={openDiary}>
                <IconCamera size={15} /> {t('addToDiary')}
              </button>
              <button type="button" className={`btn btn-glass ${isFav ? 'on' : ''}`} onClick={toggleFav}>
                <IconHeart size={15} filled={isFav} /> {isFav ? t('saved') : t('save')}
              </button>
            </div>
          </Reveal>

          {recipe.similar?.length > 0 && (
            <div className="similar">
              <h3 className="h4">{t('similarIn', { x: cuisineLabel(lang, recipe.cuisine) })}</h3>
              <div className="similar-row">
                {recipe.similar.map((s) => (
                  <Link to={`/recipes/${s.id}`} key={s.id} className="similar-card">
                    {s.image ? (
                      <img src={s.image} alt="" loading="lazy" />
                    ) : (
                      <span className="similar-fb" data-emoji={CUISINE_EMOJI[s.cuisine] || '🍽️'} />
                    )}
                    <span className="similar-name">{s.title}</span>
                    <span className="similar-time">{s.time_min} {t('min')}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {diaryOpen && (
        <DiaryModal presetRecipeId={String(recipe.id)} onClose={() => setDiaryOpen(false)} />
      )}
    </main>
  )
}
