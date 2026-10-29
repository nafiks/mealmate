import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiGet } from '../api.js'
import { useApp } from '../store.jsx'
import { useI18n, INGREDIENT_I18N, cuisineLabel } from '../i18n.js'
import RecipeCard from '../components/RecipeCard.jsx'
import Reveal from '../components/Reveal.jsx'
import { IconArrowRight, IconSpark } from '../components/icons.jsx'

const MARQUEE_KEYS = ['potato', 'eggs', 'onion', 'rice', 'tomato', 'cheese', 'pasta', 'chicken', 'carrot', 'bread', 'milk', 'mushrooms', 'bell-pepper', 'beef', 'cucumber']
const MARQUEE_EMOJI = { potato: '🥔', eggs: '🥚', onion: '🧅', rice: '🍚', tomato: '🍅', cheese: '🧀', pasta: '🍝', chicken: '🍗', carrot: '🥕', bread: '🍞', milk: '🥛', mushrooms: '🍄', 'bell-pepper': '🫑', beef: '🥩', cucumber: '🥒' }

function CountUp({ value }) {
  const ref = useRef(null)
  const [n, setN] = useState(0)
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return setN(value)
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const t0 = performance.now()
      const dur = 900
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / dur)
        setN(Math.round(value * (1 - Math.pow(1 - p, 3))))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.4 })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [value])
  return <span ref={ref}>{n}</span>
}

const HERO_IMG_MAIN = 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1200&auto=format&fit=crop'
const HERO_IMG_SECOND = 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?q=80&w=900&auto=format&fit=crop'

export default function Home() {
  const { meta, lang } = useApp()
  const { t } = useI18n()
  const [featured, setFeatured] = useState([])

  useEffect(() => {
    apiGet(`/api/recipes?lang=${lang}`)
      .then((d) => setFeatured((d.all || []).slice(0, 6)))
      .catch(() => {})
  }, [lang])

  const stats = meta?.stats || { recipes: 43, ingredients: 46, avg_time: 26 }
  const cuisines = meta?.cuisines || []

  const marqueeItems = MARQUEE_KEYS.map((k) => {
    const loc = INGREDIENT_I18N[k]
    const name = loc ? (lang === 'ru' ? loc[0] : lang === 'kk' ? loc[1] : k.replace(/-/g, ' ')) : k.replace(/-/g, ' ')
    return [MARQUEE_EMOJI[k], name.charAt(0).toUpperCase() + name.slice(1)]
  })

  return (
    <main>
      {/* ---------- HERO ---------- */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <Reveal><p className="kicker">{t('heroKicker')}</p></Reveal>
            <Reveal delay={80}>
              <h1 className="h-hero">
                {t('heroTitleA')} <em className="hl">{t('heroTitleB')}</em>.
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="hero-sub">{t('heroSub')}</p>
            </Reveal>
            <Reveal delay={240}>
              <div className="hero-cta">
                <Link to="/kitchen" className="btn btn-primary btn-lg">
                  {t('heroCta')} <IconArrowRight size={17} />
                </Link>
                <Link to="/recipes" className="btn btn-ghost btn-lg">{t('heroCta2')}</Link>
              </div>
            </Reveal>
            <Reveal delay={320}>
              <div className="hero-stats">
                <div className="stat">
                  <strong><CountUp value={stats.recipes} /></strong>
                  <span>{t('statRecipes')}</span>
                </div>
                <div className="stat">
                  <strong><CountUp value={stats.ingredients} /></strong>
                  <span>{t('statIngredients')}</span>
                </div>
                <div className="stat">
                  <strong><CountUp value={stats.avg_time} /> {t('min')}</strong>
                  <span>{t('statTime')}</span>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="hero-collage" aria-hidden="true">
            <div className="collage-card main">
              <img src={HERO_IMG_MAIN} alt="" loading="eager" />
            </div>
            <div className="collage-card second">
              <img src={HERO_IMG_SECOND} alt="" loading="lazy" />
            </div>
            <div className="float-pill pill-1"><span>🥚</span> {t('pillHave')}</div>
            <div className="float-pill pill-2"><span>🧀</span> {t('pillMiss')} cheese</div>
            <div className="collage-tagline">{t('collageTagline')}</div>
          </div>
        </div>
      </section>

      {/* ---------- MARQUEE ---------- */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...marqueeItems, ...marqueeItems].map(([e, name], i) => (
            <span key={i}><b>{e}</b> {name}</span>
          ))}
        </div>
      </div>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="section container">
        <Reveal><p className="kicker">{t('howKicker')}</p></Reveal>
        <Reveal delay={60}><h2 className="h2">{t('howTitleA')} <em>{t('howTitleB')}</em></h2></Reveal>
        <div className="steps">
          {[
            ['01', t('how1T'), t('how1D')],
            ['02', t('how2T'), t('how2D')],
            ['03', t('how3T'), t('how3D')],
          ].map(([n, title, desc], i) => (
            <Reveal key={n} delay={i * 90} className="step-card">
              <span className="step-num">{n}</span>
              <h3>{title}</h3>
              <p>{desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- FEATURED ---------- */}
      <section className="section container">
        <div className="section-head">
          <div>
            <Reveal><p className="kicker">{t('popKicker')}</p></Reveal>
            <Reveal delay={60}><h2 className="h2">{t('popTitleA')} <em>{t('popTitleB')}</em>.</h2></Reveal>
          </div>
          <Reveal delay={120}>
            <Link to="/recipes" className="link-more">{t('allRecipes')} <IconArrowRight size={15} /></Link>
          </Reveal>
        </div>
        <div className="grid-3">
          {featured.map((r, i) => (
            <RecipeCard key={r.id} recipe={r} delay={(i % 3) * 80} />
          ))}
        </div>
      </section>

      {/* ---------- CUISINES ---------- */}
      <section className="section container">
        <Reveal><p className="kicker">{t('cuiKicker')}</p></Reveal>
        <Reveal delay={60}><h2 className="h2">{t('cuiTitle')}</h2></Reveal>
        <div className="cuisine-row">
          {cuisines.map((c, i) => (
            <Reveal key={c.name} delay={i * 60}>
              <Link to={`/recipes?cuisine=${encodeURIComponent(c.name)}`} className="cuisine-pill">
                <strong>{cuisineLabel(lang, c.name)}</strong>
                <span>{c.count} {t('cuiCount')}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- CTA BAND ---------- */}
      <section className="container">
        <Reveal className="cta-band grain">
          <IconSpark size={26} className="cta-spark" />
          <h2 className="h2">{t('ctaTitleA')} <em>{t('ctaTitleB')}</em></h2>
          <p>{t('ctaSub')}</p>
          <Link to="/kitchen" className="btn btn-lime btn-lg">{t('ctaBtn')}</Link>
        </Reveal>
      </section>
    </main>
  )
}
