import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import MatchRing from './MatchRing.jsx'
import { useInView } from './Reveal.jsx'
import { useI18n, cuisineLabel } from '../i18n.js'
import { useApp } from '../store.jsx'
import { IconClock, IconFlame, IconArrowRight, IconHeart } from './icons.jsx'

export const CUISINE_EMOJI = {
  Kazakh: '🍲', Russian: '🥟', European: '🍝', Asian: '🍜', Mexican: '🌮',
}

const FAV_KEY = 'mm.favorites.v1'

export function readFavorites() {
  try {
    return new Set(JSON.parse(localStorage.getItem(FAV_KEY) || '[]'))
  } catch {
    return new Set()
  }
}

export function writeFavorites(set) {
  localStorage.setItem(FAV_KEY, JSON.stringify([...set]))
}

export default function RecipeCard({ recipe, delay = 0 }) {
  const [imgOk, setImgOk] = useState(true)
  const [favs, setFavs] = useState(readFavorites)
  const [ref, seen] = useInView()
  const { lang, t } = useI18n()
  const { user, userReady, toast } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const isFav = favs.has(recipe.id)
  const hasMatch = typeof recipe.missing_count === 'number' && recipe.total > 0

  const toggleFav = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const authed = userReady && user && !user.isGuest
    if (!authed) {
      toast(t('signInToSave'), 'err')
      navigate('/login', { state: { from: location.pathname, intent: 'fav', recipeId: recipe.id } })
      return
    }
    const next = new Set(favs)
    if (next.has(recipe.id)) next.delete(recipe.id)
    else next.add(recipe.id)
    setFavs(next)
    writeFavorites(next)
  }

  return (
    <Link
      ref={ref}
      to={`/recipes/${recipe.id}`}
      className={`rcard reveal ${seen ? 'in' : ''}`}
      style={delay ? { '--rd': `${delay}ms` } : undefined}
    >
      <div className="rcard-media">
        <div className="img-fallback" data-emoji={CUISINE_EMOJI[recipe.cuisine] || '🍽️'} />
        {imgOk && recipe.image && (
          <img src={recipe.image} alt={recipe.title} loading="lazy" onError={() => setImgOk(false)} />
        )}
        <span className="rcard-cuisine">{cuisineLabel(lang, recipe.cuisine)}</span>
        {hasMatch && <MatchRing have={recipe.total - recipe.missing_count} total={recipe.total} />}
        <button
          type="button"
          className={`rcard-fav ${isFav ? 'on' : ''}`}
          onClick={toggleFav}
          aria-label={isFav ? 'Remove from saved' : 'Save recipe'}
          title={isFav ? 'Remove from saved' : 'Save recipe'}
        >
          <IconHeart size={15} filled={isFav} />
        </button>
      </div>

      <div className="rcard-body">
        <h3 className="rcard-title">{recipe.title}</h3>
        <p className="rcard-desc">{recipe.description}</p>
        <div className="rcard-meta">
          <span><IconClock size={14} /> {recipe.time_min} min</span>
          <span><IconFlame size={14} /> {recipe.kcal} kcal</span>
        </div>
        {recipe.missing?.length > 0 && (
          <div className="rcard-miss">
            {recipe.missing.slice(0, 3).map((m) => (
              <span key={m.id} className="miss-pill">+ {m.name}</span>
            ))}
            {recipe.missing.length > 3 && <span className="miss-pill miss-more">+{recipe.missing.length - 3}</span>}
          </div>
        )}
        <span className="rcard-open">{t('openRecipe')} <IconArrowRight size={14} /></span>
      </div>
    </Link>
  )
}
