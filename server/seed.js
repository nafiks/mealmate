import { db, one, run } from './db.js'
import { INGREDIENTS } from './data/ingredients.js'
import { RECIPES } from './data/recipes.js'
import { RECIPE_I18N, INGREDIENT_I18N } from './data/i18n.js'
import { STEPS_EN } from './data/steps.en.js'
import { STEPS_RU } from './data/steps.ru.js'
import { STEPS_KK } from './data/steps.kk.js'

export function seedIfEmpty() {
  const { n } = one(`SELECT COUNT(*) AS n FROM recipes`)
  if (n > 0) return false
  seedAll()
  return true
}

export function seedAll() {
  db.exec(`
    DELETE FROM photo_diary;
    DELETE FROM user_ingredients;
    DELETE FROM instruction_blocks;
    DELETE FROM recipe_ingredients;
    DELETE FROM recipes;
    DELETE FROM ingredients;
    DELETE FROM sqlite_sequence WHERE name IN ('recipes','ingredients','instruction_blocks','photo_diary');
  `)

  const ingId = {}
  const insIng = db.prepare(
    `INSERT INTO ingredients (name, name_ru, name_kk, emoji, category, is_staple) VALUES (?, ?, ?, ?, ?, ?)`
  )
  for (const i of INGREDIENTS) {
    const loc = INGREDIENT_I18N[i.key] || []
    const res = insIng.run(i.name, loc[0] || null, loc[1] || null, i.emoji, i.category, i.staple ? 1 : 0)
    ingId[i.key] = Number(res.lastInsertRowid)
  }

  const insRecipe = db.prepare(`
    INSERT INTO recipes
      (title, title_ru, title_kk, description, description_ru, description_kk,
       cuisine, time_min, servings, kcal, protein, fat, carbs, image_url, tags, featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const insRI = db.prepare(`
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, optional)
    VALUES (?, ?, ?, ?, ?)
  `)
  const insStep = db.prepare(`
    INSERT INTO instruction_blocks (recipe_id, step_number, description, description_ru, description_kk)
    VALUES (?, ?, ?, ?, ?)
  `)

  for (const r of RECIPES) {
    const loc = RECIPE_I18N[r.key] || []
    const [titleRu, descRu] = loc.ru || []
    const [titleKk, descKk] = loc.kk || []
    const res = insRecipe.run(
      r.title, titleRu || null, titleKk || null,
      r.description, descRu || null, descKk || null,
      r.cuisine, r.time, r.servings,
      r.kcal, r.protein, r.fat, r.carbs,
      r.image, JSON.stringify(r.tags || []), r.featured ? 1 : 0
    )
    const recipeId = Number(res.lastInsertRowid)
    r.ing.forEach(([key, qty, unit, optional]) => {
      if (!ingId[key]) throw new Error(`Unknown ingredient key "${key}" in recipe "${r.key}"`)
      insRI.run(recipeId, ingId[key], qty, unit || '', optional ? 1 : 0)
    })
    const enSteps = STEPS_EN[r.key] || r.steps
    const ruSteps = STEPS_RU[r.key] || []
    const kkSteps = STEPS_KK[r.key] || []
    if (STEPS_EN[r.key] && STEPS_EN[r.key].length !== ruSteps.length) {
      throw new Error(`Step count mismatch (en/ru) in recipe "${r.key}"`)
    }
    if (STEPS_EN[r.key] && STEPS_EN[r.key].length !== kkSteps.length) {
      throw new Error(`Step count mismatch (en/kk) in recipe "${r.key}"`)
    }
    enSteps.forEach((text, idx) =>
      insStep.run(recipeId, idx + 1, text, ruSteps[idx] || null, kkSteps[idx] || null)
    )
  }

  console.log(`Seeded ${RECIPES.length} recipes, ${INGREDIENTS.length} ingredients (en/ru/kk).`)
}

// CLI: node server/seed.js
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedAll()
}
