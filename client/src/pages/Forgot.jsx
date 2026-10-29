import { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiPost } from '../api.js'
import { useI18n } from '../i18n.js'

// Step 1 of password recovery. Without a mail service the "emailed" link is
// shown right here (demo mode) — the token flow itself is production-shaped.
export default function Forgot() {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [token, setToken] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await apiPost('/api/auth/forgot', { email })
      setToken(res.demo_token)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-wrap container">
      <form className="auth-card" onSubmit={submit}>
        <p className="kicker">{t('forgotQ')}</p>
        <h1 className="h2">{t('forgotTitle')}.</h1>
        <p className="page-sub">{t('forgotSub')}</p>

        {!token ? (
          <>
            <label className="field">
              <span>{t('emailLabel')}</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('emailPh')} required />
            </label>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={busy}>
              {busy ? t('oneSec') : t('forgotBtn')}
            </button>
          </>
        ) : (
          <>
            <p className="auth-note">{t('demoNote')}</p>
            <Link to={`/reset?token=${encodeURIComponent(token)}`} className="btn btn-lime btn-block btn-lg">
              {t('openReset')}
            </Link>
          </>
        )}

        <p className="auth-switch"><Link to="/login">{t('signInBtn')}</Link></p>
      </form>
    </main>
  )
}
