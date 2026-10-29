import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { apiPost } from '../api.js'
import { useApp } from '../store.jsx'
import { useI18n } from '../i18n.js'

// Step 2 of password recovery: consume the one-time token, set a new password.
export default function Reset() {
  const { t } = useI18n()
  const { toast } = useApp()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (password !== password2) return setError(t('errPass'))
    setBusy(true)
    setError(null)
    try {
      await apiPost('/api/auth/reset', { token, password })
      toast(t('resetDone'))
      navigate('/login', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-wrap container">
      <form className="auth-card" onSubmit={submit}>
        <p className="kicker">{t('resetTitle')}</p>
        <h1 className="h2">{t('resetTitle')}.</h1>
        <p className="page-sub">{t('resetSub')}</p>

        {!token ? (
          <>
            <p className="auth-error">{t('resetInvalid')}</p>
            <Link to="/forgot" className="btn btn-primary btn-block">{t('forgotQ')}</Link>
          </>
        ) : (
          <>
            <label className="field">
              <span>{t('newPassLabel')}</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('passPh')} required minLength={6} />
            </label>
            <label className="field">
              <span>{t('newPassLabel')} ×2</span>
              <input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} placeholder={t('passPh')} required minLength={6} />
            </label>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={busy}>
              {busy ? t('oneSec') : t('resetBtn')}
            </button>
          </>
        )}
      </form>
    </main>
  )
}
