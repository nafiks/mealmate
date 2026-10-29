import express from 'express'
import helmet from 'helmet'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

import { attachUser } from './auth.js'
import { seedIfEmpty } from './seed.js'
import recipesRoutes from './routes/recipes.js'
import ingredientsRoutes from './routes/ingredients.js'
import authRoutes from './routes/auth.js'
import pantryRoutes from './routes/pantry.js'
import diaryRoutes from './routes/diary.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3001
const isProd = process.env.NODE_ENV === 'production'

if (seedIfEmpty()) console.log('Database was empty — seeded starter content.')

const app = express()
app.set('trust proxy', 1)

// Split hosting: set CORS_ORIGIN=https://your-frontend.vercel.app to allow it.
if (process.env.CORS_ORIGIN) {
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN)
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    if (req.method === 'OPTIONS') return res.sendStatus(204)
    next()
  })
}

app.use(helmet({
  contentSecurityPolicy: false, // recipe photos come from images.unsplash.com
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))
app.use(express.json({ limit: '6mb' }))
app.use(attachUser)

// --- tiny in-memory rate limiter for auth & uploads ---
const buckets = new Map()
function limit(windowMs, max) {
  return (req, res, next) => {
    const key = `${req.ip}:${Math.floor(Date.now() / windowMs)}`
    const count = (buckets.get(key) || 0) + 1
    buckets.set(key, count)
    if (buckets.size > 5000) buckets.clear()
    if (count > max) return res.status(429).json({ error: 'Too many requests — slow down a little.' })
    next()
  }
}

app.get('/api/health', (_req, res) => res.json({ ok: true, name: 'mealmate-api' }))
app.use('/api/ingredients', ingredientsRoutes)
app.use('/api/recipes', recipesRoutes)
app.use('/api/auth', limit(10 * 60 * 1000, 40), authRoutes)
app.use('/api/pantry', pantryRoutes)
app.use('/api/diary', diaryRoutes)

app.use('/api', (_req, res) => res.status(404).json({ error: 'Unknown API endpoint' }))

// --- production: serve the built SPA ---
const distDir = path.join(__dirname, '..', 'client', 'dist')
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next()
    res.sendFile(path.join(distDir, 'index.html'))
  })
} else if (isProd) {
  app.get('*', (_req, res) => res.status(503).send('Client is not built. Run: npm run build'))
}

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Something went wrong on our side.' })
})

app.listen(PORT, () => {
  console.log(`MealMate API on http://localhost:${PORT} ${isProd ? '(production)' : '(dev)'}`)
})
