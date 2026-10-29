import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useApp } from '../store.jsx'
import { useI18n } from '../i18n.js'
import { IconUser, IconLogout, IconX } from './icons.jsx'

export function Logo({ light = false }) {
  return (
    <Link to="/" className={`logo ${light ? 'logo-light' : ''}`} aria-label="MealMate — home">
      <span className="logo-mark">🍳</span>
      <span className="logo-word">Meal<em>Mate</em><i>.</i></span>
    </Link>
  )
}

function LangSwitch() {
  const { lang, setLang, langs } = useI18n()
  return (
    <div className="lang-switch" role="group" aria-label="Language">
      {langs.map((l) => (
        <button
          key={l.code}
          type="button"
          className={`lang-pill ${lang === l.code ? 'on' : ''}`}
          onClick={() => setLang(l.code)}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}

export default function Header() {
  const { user, userReady, logout } = useApp()
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => setOpen(false), [location.pathname])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { to: '/', label: t('navHome') },
    { to: '/kitchen', label: t('navKitchen') },
    { to: '/recipes', label: t('navRecipes') },
    { to: '/community', label: t('navCommunity') },
    { to: '/diary', label: t('navDiary') },
  ]
  const initial = user?.name?.trim()?.[0]?.toUpperCase() || '?'

  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container header-row">
        <Logo />
        <nav className="header-nav" aria-label="Main">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="header-actions">
          <LangSwitch />
          {userReady && user && !user.isGuest && (
            <div className="user-chip" title={user.email}>
              <span className="user-avatar">{initial}</span>
              <span className="user-name">{user.name.split(' ')[0]}</span>
              <button type="button" className="icon-btn" onClick={logout} aria-label={t('signOut')} title={t('signOut')}>
                <IconLogout size={15} />
              </button>
            </div>
          )}
          {userReady && (!user || user.isGuest) && (
            <Link to="/login" className="btn btn-ghost btn-sm">
              <IconUser size={14} /> {t('signIn')}
            </Link>
          )}
          <Link to="/kitchen" className="btn btn-primary btn-sm header-cta">{t('startCooking')}</Link>
          <button
            type="button"
            className="burger"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <IconX size={18} /> : <span className="burger-lines" />}
          </button>
        </div>
      </div>
      <div className={`mobile-menu ${open ? 'open' : ''}`}>
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>
            {l.label}
          </NavLink>
        ))}
        {user && !user.isGuest ? (
          <button type="button" className="mobile-signout" onClick={logout}>
            {t('signOut')} ({user.name.split(' ')[0]})
          </button>
        ) : (
          <NavLink to="/login">{t('signIn')}</NavLink>
        )}
        <div className="mobile-lang"><LangSwitch /></div>
      </div>
    </header>
  )
}
