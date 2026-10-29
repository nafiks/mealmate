import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiGet } from '../api.js'
import { useApp } from '../store.jsx'
import { useI18n } from '../i18n.js'
import Reveal from '../components/Reveal.jsx'
import { IconArrowRight } from '../components/icons.jsx'

function formatDate(sqliteUtc, lang) {
  const d = new Date(String(sqliteUtc).replace(' ', 'T') + 'Z')
  return d.toLocaleDateString(lang === 'en' ? 'en-GB' : 'ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Community feed: photos from all cooks on MealMate.
export default function Community() {
  const { toast, lang } = useApp()
  const { t } = useI18n()
  const [entries, setEntries] = useState(null)

  useEffect(() => {
    apiGet(`/api/diary/feed?lang=${lang}`)
      .then((d) => setEntries(d.entries || []))
      .catch(() => toast(t('diaFail'), 'err'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  return (
    <main className="container diary-page">
      <Reveal>
        <p className="kicker">{t('comKicker')}</p>
        <h1 className="h1">{t('comTitleA')} <em>{t('comTitleB')}</em></h1>
        <p className="page-sub">{t('comSub')}</p>
      </Reveal>

      {entries === null && <p className="results-loading">{t('openingAlbum')}</p>}

      {entries !== null && (
        entries.length > 0 ? (
          <div className="diary-grid">
            {entries.map((e, i) => (
              <Reveal key={e.id} delay={Math.min(i, 6) * 50} className="dcard">
                <div className="dcard-photo">
                  <img src={e.photo} alt={e.note || 'Cooked dish'} loading="lazy" />
                  {e.recipe_id && (
                    <Link to={`/recipes/${e.recipe_id}`} className="dcard-recipe">
                      {e.recipe_title || 'recipe'} <IconArrowRight size={11} />
                    </Link>
                  )}
                </div>
                <div className="dcard-body">
                  {e.note
                    ? <p className="dcard-note">“{e.note}”</p>
                    : <p className="dcard-note dcard-note-empty">—</p>}
                  <div className="dcard-meta">
                    <span>{e.author} · {formatDate(e.date, lang)}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="empty-hero">
            <span className="empty-emoji">🧑‍🍳</span>
            <h3>{t('comEmpty')}</h3>
            <Link to="/recipes" className="btn btn-primary">{t('allRecipes')}</Link>
          </div>
        )
      )}
    </main>
  )
}
