import { Router } from 'express'
import { db, one, rows } from '../db.js'

const r = Router()

const langOf = (req) => (['ru', 'kk'].includes(req.query.lang) ? req.query.lang : null)

// Localize title/description by picking the requested column with EN fallback.
function loc(row, lang) {
  if (!lang || !row) return row
  const t = row[`title_${lang}`]
  const d = row[`description_${lang}`]
  const { title_ru, title_kk, description_ru, description_kk, ...rest } = row
  return { ...rest, title: t || row.title, description: d || row.description }
}

const CARD_FIELDS = `
  r.recipe_id AS id, r.title, r.title_ru, r.title_kk,
  r.description, r.description_ru, r.description_kk,
  r.cuisine, r.time_min, r.servings, r.kcal, r.protein, r.fat, r.carbs,
  r.image_url AS image, r.tags
`

function shapeCard(row, lang) {
  return { ...loc(row, lang), tags: JSON.parse(row.tags || '[]') }
}

function parseIds(raw) {
  if (!raw) return []
  return String(raw)
    .split(',')
    .map((s) => parseInt(s, 10))
    .filter((n) => Number.isInteger(n) && n > 0)
    .slice(0, 60)
}

function baseFilters({ maxTime, cuisine, tag, q }) {
  const clauses = []
  const params = []
  if (maxTime) { clauses.push('r.time_min <= ?'); params.push(maxTime) }
  if (cuisine) { clauses.push('r.cuisine = ?'); params.push(cuisine) }
  if (tag) {
    clauses.push(`EXISTS (SELECT 1 FROM json_each(r.tags) je WHERE je.value = ?)`)
    params.push(tag)
  }
  if (q) {
    clauses.push(`(instr(lower(r.title), ?) > 0 OR instr(lower(r.description), ?) > 0
      OR instr(lower(COALESCE(r.title_ru, '')), ?) > 0 OR instr(lower(COALESCE(r.title_kk, '')), ?) > 0)`)
    const needle = q.toLowerCase()
    params.push(needle, needle, needle, needle)
  }
  return { sql: clauses.length ? 'AND ' + clauses.join(' AND ') : '', params }
}

// GET /api/recipes?ingredients=1,2,3&maxTime=30&cuisine=&tag=&q=&lang=ru
r.get('/', (req, res) => {
  const lang = langOf(req)
  const ids = parseIds(req.query.ingredients)
  const { sql: filterSql, params: filterParams } = baseFilters({
    maxTime: parseInt(req.query.maxTime, 10) || null,
    cuisine: req.query.cuisine || null,
    tag: req.query.tag || null,
    q: req.query.q || null,
  })

  // No pantry selection → plain filtered catalog, no match columns.
  if (ids.length === 0) {
    const list = rows(
      `SELECT ${CARD_FIELDS} FROM recipes r WHERE 1=1 ${filterSql}
       ORDER BY r.featured DESC, r.time_min ASC`,
      filterParams
    ).map((row) => shapeCard(row, lang))
    return res.json({ cookNow: [], almost: [], all: list })
  }

  // Matching in SQL: req = required (non-optional, non-staple) count per recipe,
  // got = how many of them the user has. missing = req - got.
  const list = rows(
    `
    WITH sel(ingredient_id) AS (
      SELECT value FROM json_each(?)
    ),
    req AS (
      SELECT ri.recipe_id, COUNT(*) AS total
      FROM recipe_ingredients ri
      JOIN ingredients i ON i.ingredient_id = ri.ingredient_id
      WHERE ri.optional = 0 AND i.is_staple = 0
      GROUP BY ri.recipe_id
    ),
    got AS (
      SELECT ri.recipe_id, COUNT(*) AS have
      FROM recipe_ingredients ri
      JOIN sel s ON s.ingredient_id = ri.ingredient_id
      JOIN ingredients i ON i.ingredient_id = ri.ingredient_id
      WHERE ri.optional = 0 AND i.is_staple = 0
      GROUP BY ri.recipe_id
    )
    SELECT ${CARD_FIELDS}, req.total, COALESCE(got.have, 0) AS have,
           req.total - COALESCE(got.have, 0) AS missing_count
    FROM recipes r
    JOIN req ON req.recipe_id = r.recipe_id
    LEFT JOIN got ON got.recipe_id = r.recipe_id
    WHERE 1=1 ${filterSql}
      AND COALESCE(got.have, 0) >= 1
    ORDER BY missing_count ASC, COALESCE(got.have, 0) DESC, r.time_min ASC
    `,
    [JSON.stringify(ids), ...filterParams]
  ).map((row) => shapeCard(row, lang))

  const cookNow = list.filter((x) => x.missing_count === 0)
  // With a tiny selection (1-2 items) the ≤2-missing rule would hide every
  // relevant recipe (e.g. bacon alone vs carbonara missing 3). Relax it —
  // the have ≥ 1 clause already guarantees real overlap with the selection.
  const maxAlmost = ids.length <= 2 ? 99 : 2
  const almost = list.filter((x) => x.missing_count >= 1 && x.missing_count <= maxAlmost)

  // Attach exact missing ingredients for the "almost there" group.
  if (almost.length) {
    const recipeIds = almost.map((x) => x.id)
    const marks = recipeIds.map(() => '?').join(',')
    const selMarks = ids.map(() => '?').join(',')
    const nameCol = lang === 'ru' ? 'COALESCE(i.name_ru, i.name)' : lang === 'kk' ? 'COALESCE(i.name_kk, i.name)' : 'i.name'
    const miss = rows(
      `
      SELECT ri.recipe_id, i.ingredient_id AS id, ${nameCol} AS name, i.emoji
      FROM recipe_ingredients ri
      JOIN ingredients i ON i.ingredient_id = ri.ingredient_id
      WHERE ri.optional = 0 AND i.is_staple = 0
        AND ri.recipe_id IN (${marks})
        AND ri.ingredient_id NOT IN (${selMarks})
      `,
      [...recipeIds, ...ids]
    )
    const byRecipe = {}
    for (const m of miss) (byRecipe[m.recipe_id] ||= []).push({ id: m.id, name: m.name, emoji: m.emoji })
    for (const a of almost) a.missing = byRecipe[a.id] || []
  }

  res.json({ cookNow, almost, all: [] })
})

// GET /api/recipes/meta/all — cuisines, tags, stats (registered before /:id)
r.get('/meta/all', (_req, res) => {
  const cuisines = rows(
    `SELECT cuisine AS name, COUNT(*) AS count FROM recipes GROUP BY cuisine ORDER BY count DESC`
  )
  // 'Vegetarian' is intentionally not offered as a filter tag (product decision)
  const tagRows = rows(`SELECT je.value AS name, COUNT(*) AS count
    FROM recipes r, json_each(r.tags) je
    WHERE je.value != 'Vegetarian'
    GROUP BY je.value ORDER BY count DESC`)
  const stats = one(`
    SELECT
      (SELECT COUNT(*) FROM recipes) AS recipes,
      (SELECT COUNT(*) FROM ingredients WHERE is_staple = 0) AS ingredients,
      (SELECT CAST(ROUND(AVG(time_min)) AS INT) FROM recipes) AS avg_time
  `)
  res.json({ cuisines, tags: tagRows, stats })
})

// GET /api/recipes/:id?ingredients=1,2,3&lang=ru
r.get('/:id', (req, res) => {
  const lang = langOf(req)
  const id = parseInt(req.params.id, 10)
  const recipe = one(`SELECT recipe_id AS id, title, title_ru, title_kk, description, description_ru,
    description_kk, cuisine, time_min, servings, kcal, protein, fat, carbs,
    image_url AS image, tags FROM recipes WHERE recipe_id = ?`, [id])
  if (!recipe) return res.status(404).json({ error: 'Recipe not found' })
  Object.assign(recipe, loc(recipe, lang))
  recipe.tags = JSON.parse(recipe.tags || '[]')

  const stepCol = lang === 'ru' ? 'COALESCE(b.description_ru, b.description)'
    : lang === 'kk' ? 'COALESCE(b.description_kk, b.description)' : 'b.description'
  recipe.steps = rows(
    `SELECT b.step_number AS n, ${stepCol} AS description FROM instruction_blocks b
     WHERE b.recipe_id = ? ORDER BY b.step_number`, [id]
  )

  const nameCol = lang === 'ru' ? 'COALESCE(i.name_ru, i.name)' : lang === 'kk' ? 'COALESCE(i.name_kk, i.name)' : 'i.name'
  const ids = parseIds(req.query.ingredients)
  const haveSet = new Set(ids)
  recipe.ingredients = rows(
    `SELECT i.ingredient_id AS id, ${nameCol} AS name, i.emoji, ri.quantity, ri.unit, ri.optional, i.is_staple
     FROM recipe_ingredients ri JOIN ingredients i ON i.ingredient_id = ri.ingredient_id
     WHERE ri.recipe_id = ? ORDER BY ri.optional ASC, i.is_staple DESC, i.name`, [id]
  ).map((x) => ({
    ...x,
    optional: !!x.optional,
    staple: !!x.is_staple,
    have: x.is_staple === 1 || haveSet.has(x.id),
  }))
  recipe.missing_count = recipe.ingredients.filter((x) => !x.have && !x.optional).length

  const simName = lang === 'ru' ? 'COALESCE(title_ru, title)' : lang === 'kk' ? 'COALESCE(title_kk, title)' : 'title'
  recipe.similar = rows(
    `SELECT recipe_id AS id, ${simName} AS title, time_min, kcal, image_url AS image, cuisine
     FROM recipes WHERE cuisine = ? AND recipe_id != ?
     ORDER BY abs(time_min - ?) ASC LIMIT 3`,
    [recipe.cuisine, id, recipe.time_min]
  )

  res.json(recipe)
})

export default r
