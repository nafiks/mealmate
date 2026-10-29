import { Router } from 'express'
import { db, one, rows } from '../db.js'
import { requireUser } from '../auth.js'

const r = Router()

// GET /api/pantry — current user's saved ingredients
r.get('/', (req, res) => {
  if (!req.user) return res.json({ ingredient_ids: [] })
  const list = rows(
    `SELECT ingredient_id FROM user_ingredients WHERE user_id = ?`, [req.user.user_id]
  )
  res.json({ ingredient_ids: list.map((x) => x.ingredient_id) })
})

// PUT /api/pantry — replace the whole selection (ids come from /api/ingredients only)
r.put('/', requireUser, (req, res) => {
  const ids = Array.isArray(req.body?.ingredient_ids) ? req.body.ingredient_ids : null
  if (!ids) return res.status(400).json({ error: 'ingredient_ids must be an array' })

  const clean = [...new Set(
    ids.map((n) => parseInt(n, 10)).filter((n) => Number.isInteger(n) && n > 0)
  )].slice(0, 80)

  db.exec('BEGIN')
  try {
    db.prepare(`DELETE FROM user_ingredients WHERE user_id = ?`).run(req.user.user_id)
    const ins = db.prepare(
      `INSERT OR IGNORE INTO user_ingredients (user_id, ingredient_id)
       SELECT ?, ingredient_id FROM ingredients WHERE ingredient_id = ?`
    )
    for (const id of clean) ins.run(req.user.user_id, id)
    db.exec('COMMIT')
  } catch (e) {
    db.exec('ROLLBACK')
    throw e
  }
  res.json({ ingredient_ids: clean })
})

export default r
