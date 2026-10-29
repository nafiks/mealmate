import { Router } from 'express'
import { rows } from '../db.js'
import { QUICK_SETS } from '../data/recipes.js'
import { INGREDIENTS } from '../data/ingredients.js'

const r = Router()

// GET /api/ingredients — grouped list for the picker + quick add sets
r.get('/', (_req, res) => {
  // keys live in the seed files, not the DB — join by unique name
  const keyByName = Object.fromEntries(INGREDIENTS.map((i) => [i.name, i.key]))

  const list = rows(
    `SELECT ingredient_id AS id, name, name_ru, name_kk, emoji, category, is_staple
     FROM ingredients ORDER BY is_staple DESC, category ASC, name ASC`
  ).map((x) => ({ ...x, key: keyByName[x.name] || null, staple: !!x.is_staple }))

  const grouped = {}
  for (const item of list) (grouped[item.category] ||= []).push(item)

  res.json({ ingredients: list, grouped, quickSets: QUICK_SETS })
})

export default r
