import { useEffect } from 'react'
import { Routes, Route, useLocation, Link } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import { useI18n } from './i18n.js'
import Home from './pages/Home.jsx'
import Kitchen from './pages/Kitchen.jsx'
import Catalog from './pages/Catalog.jsx'
import Recipe from './pages/Recipe.jsx'
import Diary from './pages/Diary.jsx'
import Auth from './pages/Auth.jsx'
import Forgot from './pages/Forgot.jsx'
import Reset from './pages/Reset.jsx'
import Community from './pages/Community.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function NotFound() {
  const { t } = useI18n()
  return (
    <main className="container">
      <div className="empty-hero">
        <span className="empty-emoji">🍽️</span>
        <h3>{t('notOnMenu')}</h3>
        <p>{t('menuD')}</p>
        <Link to="/" className="btn btn-primary">{t('backHome')}</Link>
      </div>
    </main>
  )
}

export default function App() {
  return (
    <div className="app-shell">
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/kitchen" element={<Kitchen />} />
        <Route path="/recipes" element={<Catalog />} />
        <Route path="/recipes/:id" element={<Recipe />} />
        <Route path="/diary" element={<Diary />} />
        <Route path="/community" element={<Community />} />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/join" element={<Auth mode="join" />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/reset" element={<Reset />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </div>
  )
}
