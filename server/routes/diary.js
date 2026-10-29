import { Router } from 'express'
import { one, rows, run } from '../db.js'
import { requireUser } from '../auth.js'

const r = Router()

// Client must send a downscaled JPEG/PNG/WebP data URL (max ~3 MB).
const PHOTO_RE = /^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=\s]+$/

// GET /api/diary/feed — the community: photos from ALL cooks (newest first)
r.get('/feed', (req, res) => {
  const lang = ['ru', 'kk'].includes(req.query.lang) ? req.query.lang : null
  const titleCol = lang === 'ru' ? 'COALESCE(r.title_ru, r.title)' : lang === 'kk' ? 'COALESCE(r.title_kk, r.title)' : 'r.title'
  const entries = rows(
    `SELECT d.photo_id AS id, d.photo_url AS photo, d.note, d.uploaded_at AS date,
            d.recipe_id, ${titleCol} AS recipe_title, u.name AS author, u.is_guest
     FROM photo_diary d
     JOIN users u ON u.user_id = d.user_id
     LEFT JOIN recipes r ON r.recipe_id = d.recipe_id
     ORDER BY d.uploaded_at DESC, d.photo_id DESC LIMIT 60`
  ).filter((e) => !e.is_guest) // guest uploads stay private until an account is created
  res.json({ entries })
})

// GET /api/diary?lang=ru
r.get('/', (req, res) => {
  if (!req.user) return res.json({ entries: [] })
  const lang = ['ru', 'kk'].includes(req.query.lang) ? req.query.lang : null
  const titleCol = lang === 'ru' ? 'COALESCE(r.title_ru, r.title)' : lang === 'kk' ? 'COALESCE(r.title_kk, r.title)' : 'r.title'
  const entries = rows(
    `SELECT d.photo_id AS id, d.photo_url AS photo, d.note, d.uploaded_at AS date,
            d.recipe_id, ${titleCol} AS recipe_title, r.image_url AS recipe_image
     FROM photo_diary d LEFT JOIN recipes r ON r.recipe_id = d.recipe_id
     WHERE d.user_id = ? ORDER BY d.uploaded_at DESC, d.photo_id DESC LIMIT 60`,
    [req.user.user_id]
  )
  res.json({ entries })
})

// POST /api/diary { recipe_id?, photo, note? } — account holders only
r.post('/', requireUser, (req, res) => {
  if (req.user.is_guest) {
    return res.status(401).json({ error: 'Sign in to add diary entries.', code: 'auth_required' })
  }
  const photo = String(req.body?.photo || '')
  const note = String(req.body?.note || '').trim().slice(0, 500)
  const recipeId = parseInt(req.body?.recipe_id, 10)

  if (!PHOTO_RE.test(photo.slice(0, 64)) || !PHOTO_RE.test(photo)) {
    return res.status(400).json({ error: 'Photo must be a base64 image (png/jpeg/webp).' })
  }
  if (photo.length > 4_500_000) {
    return res.status(413).json({ error: 'Photo is too large after compression (max ~3 MB).' })
  }
  let recipe = null
  if (Number.isInteger(recipeId)) {
    recipe = one(`SELECT recipe_id FROM recipes WHERE recipe_id = ?`, [recipeId])
  }

  const result = run(
    `INSERT INTO photo_diary (user_id, recipe_id, photo_url, note) VALUES (?, ?, ?, ?)`,
    [req.user.user_id, recipe ? recipe.recipe_id : null, photo, note]
  )
  const entry = one(
    `SELECT d.photo_id AS id, d.photo_url AS photo, d.note, d.uploaded_at AS date,
            d.recipe_id, r.title AS recipe_title
     FROM photo_diary d LEFT JOIN recipes r ON r.recipe_id = d.recipe_id
     WHERE d.photo_id = ?`,
    [Number(result.lastInsertRowid)]
  )
  res.status(201).json({ entry })
})

// DELETE /api/diary/:id — only your own photos, account holders only
r.delete('/:id', requireUser, (req, res) => {
  if (req.user.is_guest) {
    return res.status(401).json({ error: 'Sign in first.', code: 'auth_required' })
  }
  const id = parseInt(req.params.id, 10)
  const result = run(
    `DELETE FROM photo_diary WHERE photo_id = ? AND user_id = ?`,
    [id, req.user.user_id]
  )
  if (result.changes === 0) return res.status(404).json({ error: 'Entry not found.' })
  res.json({ ok: true })
})

export default r
