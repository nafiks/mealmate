import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../store.jsx'
import { useI18n } from '../i18n.js'

// Shared login / registration form. Registering as a guest upgrades the guest
// row server-side, so the pantry and diary you built carry over.
export default function Auth({ mode }) {
  const isJoin = mode === 'join'
  const { login, toast, user } = useApp()
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  // Translate known server error messages; pass anything else through.
  const localizeError = (msg) => {
    const map = {
      'That email does not look right.': t('errEmail'),
      'Password needs at least 6 characters.': t('errPass'),
      'Please tell us your name.': t('errName'),
      'Wrong email or password.': t('errCreds'),
      'This email is already registered.': t('errTaken'),
    }
    return map[msg] || msg
  }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const path = isJoin ? '/api/auth/register' : '/api/auth/login'
      const payload = isJoin ? { name, email, password } : { email, password }
      const u = await login(path, payload)
      const first = u.name.split(' ')[0]
      toast(isJoin ? t('welcome', { x: first }) : t('welcomeBack', { x: first }))
      const s = location.state
      if (s?.intent) {
        // coming from a gated action — go back and resume it
        navigate(s.from || '/kitchen', { state: { resumeIntent: s.intent, resumeRecipeId: s.recipeId }, replace: true })
      } else {
        navigate(s?.from || '/kitchen', { replace: true })
      }
    } catch (err) {
      setError(localizeError(err.message))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-wrap container">
      <form className="auth-card" onSubmit={submit}>
        <p className="kicker">{isJoin ? t('joinKicker') : t('loginKicker')}</p>
        <h1 className="h2">
          {isJoin
            ? <>{t('joinTitleA')} <em>{t('joinTitleB')}</em>.</>
            : <>{t('loginTitleA')} <em>{t('loginTitleB')}</em>.</>}
        </h1>
        <p className="page-sub">{isJoin ? t('joinSub') : t('loginSub')}</p>

        {isJoin && (
          <label className="field">
            <span>{t('nameLabel')}</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('namePh')} required maxLength={60} />
          </label>
        )}
        <label className="field">
          <span>{t('emailLabel')}</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('emailPh')} required />
        </label>
        <label className="field">
          <span>{t('passLabel')}</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('passPh')} required minLength={6} />
        </label>

        {error && <p className="auth-error" role="alert">{error}</p>}

        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={busy}>
          {busy ? t('oneSec') : isJoin ? t('createBtn') : t('signInBtn')}
        </button>

        {!isJoin && <p className="auth-switch"><Link to="/forgot">{t('forgotQ')}</Link></p>}

        <p className="auth-switch">
          {isJoin
            ? <>{t('haveAccount')} <Link to="/login" state={location.state}>{t('signInBtn')}</Link></>
            : <>{t('noAccount')} <Link to="/join" state={location.state}>{t('createBtn')}</Link></>}
        </p>

        {user?.isGuest && isJoin && <p className="auth-note">{t('guestNote')}</p>}
      </form>
    </main>
  )
}
