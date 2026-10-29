import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { apiGet, apiDelete } from '../api.js'
import { useApp } from '../store.jsx'
import { useI18n } from '../i18n.js'
import Reveal from '../components/Reveal.jsx'
import DiaryModal from '../components/DiaryModal.jsx'
import { IconCamera, IconTrash, IconArrowRight } from '../components/icons.jsx'

function formatDate(sqliteUtc, lang) {
  const d = new Date(String(sqliteUtc).replace(' ', 'T') + 'Z')
  const locale = lang === 'ru' ? 'ru-RU' : lang === 'kk' ? 'ru-RU' : 'en-GB'
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function Diary() {
  const { toast, lang, user, userReady } = useApp()
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const [entries, setEntries] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const isAuthed = userReady && user && !user.isGuest

  const openAdd = () => {
    if (!isAuthed) {
      toast(t('signInToDiary'), 'err')
      navigate('/login', { state: { from: '/diary', intent: 'diary' } })
      return
    }
    setModalOpen(true)
  }

  const load = () => {
    apiGet(`/api/diary?lang=${lang}`)
      .then((d) => setEntries(d.entries || []))
      .catch(() => toast(t('diaFail'), 'err'))
  }

  useEffect(load, [lang])

  // after signing in from the gated "add" tile, resume straight into the modal
  useEffect(() => {
    const s = location.state
    if (s?.resumeIntent === 'diary' && isAuthed) {
      setModalOpen(true)
      window.history.replaceState({}, '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed])

  const remove = async (id) => {
    if (!window.confirm(t('deleteQ'))) return
    try {
      await apiDelete(`/api/diary/${id}`)
      setEntries((list) => list.filter((x) => x.id !== id))
      toast(t('entryDeleted'))
    } catch (e) {
      toast(e.message, 'err')
    }
  }

  return (
    <main className="container diary-page">
      <Reveal>
        <p className="kicker">{t('diaKicker')}</p>
        <h1 className="h1">{t('diaTitleA')} <em>{t('diaTitleB')}</em>.</h1>
        <p className="page-sub">{t('diaSub')}</p>
      </Reveal>

      {entries === null && <p className="results-loading">{t('openingAlbum')}</p>}

      {entries !== null && (
        <div className="diary-grid">
          <button type="button" className="diary-add" onClick={openAdd}>
            <span className="diary-add-icon"><IconCamera size={22} /></span>
            <strong>{t('addDish')}</strong>
            <small>{t('addHint')}</small>
          </button>

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
                {e.note ? <p className="dcard-note">“{e.note}”</p> : <p className="dcard-note dcard-note-empty">—</p>}
                <div className="dcard-meta">
                  <span>{formatDate(e.date, lang)}</span>
                  <button type="button" className="icon-btn danger" onClick={() => remove(e.id)} aria-label="Delete entry">
                    <IconTrash size={14} />
                  </button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}

      {entries !== null && entries.length === 0 && (
        <div className="empty-hero">
          <span className="empty-emoji">📸</span>
          <h3>{t('albumEmptyT')}</h3>
          <p>{t('albumEmptyD')}</p>
        </div>
      )}

      {modalOpen && (
        <DiaryModal onClose={() => setModalOpen(false)} onSaved={() => load()} />
      )}
    </main>
  )
}
