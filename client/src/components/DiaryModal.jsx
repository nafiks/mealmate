import { useEffect, useRef, useState } from 'react'
import { apiGet, apiPost, fileToDataUrl } from '../api.js'
import { useApp } from '../store.jsx'
import { useI18n } from '../i18n.js'
import { IconCamera, IconX } from './icons.jsx'

// Photo upload modal — downsizes the image in-browser, then posts a data URL.
export default function DiaryModal({ presetRecipeId = '', onClose, onSaved }) {
  const { toast, lang } = useApp()
  const { t } = useI18n()
  const [recipes, setRecipes] = useState([])
  const [recipeId, setRecipeId] = useState(presetRecipeId)
  const [photo, setPhoto] = useState(null)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    apiGet(`/api/recipes?lang=${lang}`)
      .then((d) => setRecipes(d.all || []))
      .catch(() => {})
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose, lang])

  const pickFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setPhoto(await fileToDataUrl(file))
    } catch (err) {
      toast(err.message, 'err')
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!photo) return toast(t('photoFirst'), 'err')
    setBusy(true)
    try {
      const res = await apiPost('/api/diary', {
        photo,
        note,
        recipe_id: recipeId ? Number(recipeId) : null,
      })
      toast(t('diaSaved'))
      onSaved?.(res.entry)
      onClose()
    } catch (err) {
      toast(err.message, 'err')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" onSubmit={submit}>
        <div className="modal-head">
          <h3>{t('modalT')}</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <IconX size={16} />
          </button>
        </div>

        <label className={`drop ${photo ? 'has-photo' : ''}`}>
          <input ref={fileRef} type="file" accept="image/*" onChange={pickFile} hidden />
          {photo ? (
            <img src={photo} alt="Your dish preview" />
          ) : (
            <span className="drop-hint">
              <IconCamera size={22} />
              <strong>{t('clickPhoto')}</strong>
              <small>{t('photoHint')}</small>
            </span>
          )}
        </label>

        <label className="field">
          <span>{t('recipeOpt')}</span>
          <select value={recipeId} onChange={(e) => setRecipeId(e.target.value)}>
            <option value="">{t('justMeal')}</option>
            {recipes.map((r) => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>{t('noteLabel')}</span>
          <textarea
            rows={2}
            maxLength={500}
            placeholder={t('notePh')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>

        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy ? t('saving') : t('saveDiary')}
        </button>
      </form>
    </div>
  )
}
