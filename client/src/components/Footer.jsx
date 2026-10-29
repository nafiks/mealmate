import { Link } from 'react-router-dom'
import { useI18n, cuisineLabel } from '../i18n.js'
import { Logo } from './Header.jsx'

export default function Footer() {
  const { lang, t } = useI18n()
  const cuisines = ['Kazakh', 'Russian', 'European', 'Asian', 'Mexican']

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Logo light />
            <p>{t('footerTag')}</p>
          </div>
          <nav className="footer-col" aria-label={t('footerProduct')}>
            <h4>{t('footerProduct')}</h4>
            <Link to="/kitchen">{t('yourKitchen')}</Link>
            <Link to="/recipes">{t('allRecipes')}</Link>
            <Link to="/diary">{t('navDiary')}</Link>
          </nav>
          <nav className="footer-col" aria-label={t('footerCuisines')}>
            <h4>{t('footerCuisines')}</h4>
            {cuisines.map((c) => (
              <Link key={c} to={`/recipes?cuisine=${encodeURIComponent(c)}`}>{cuisineLabel(lang, c)}</Link>
            ))}
          </nav>
        </div>
        <div className="footer-bottom">
          <span className="footer-team">CS-2618 · Samarin · Kaniyazov · Sadybek · Temirtas</span>
          <span>{t('footerMade')}</span>
        </div>
      </div>
    </footer>
  )
}
