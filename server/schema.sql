-- MealMate schema (SQLite)
-- Mirrors the ER model from Assignment 3:
--   USER 1—N USER_INGREDIENT N—1 INGREDIENT
--   RECIPE 1—N RECIPE_INGREDIENT N—1 INGREDIENT
--   RECIPE 1—N INSTRUCTION_BLOCK
--   USER 1—N PHOTO_DIARY N—1 RECIPE

CREATE TABLE IF NOT EXISTS users (
  user_id       INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL DEFAULT 'Guest',
  email         TEXT    UNIQUE,              -- business rule: unique email
  password_hash TEXT,
  is_guest      INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ingredients (
  ingredient_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL UNIQUE,
  name_ru       TEXT,
  name_kk       TEXT,
  emoji         TEXT    NOT NULL,
  category      TEXT    NOT NULL,
  is_staple     INTEGER NOT NULL DEFAULT 0   -- salt/oil/sugar: assumed in every kitchen
);

CREATE TABLE IF NOT EXISTS recipes (
  recipe_id   INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL,
  title_ru    TEXT,
  title_kk    TEXT,
  description TEXT    NOT NULL,
  description_ru TEXT,
  description_kk TEXT,
  cuisine     TEXT    NOT NULL,
  time_min    INTEGER NOT NULL,
  servings    INTEGER NOT NULL DEFAULT 2,
  kcal        INTEGER,
  protein     REAL,
  fat         REAL,
  carbs       REAL,
  image_url   TEXT,
  tags        TEXT    NOT NULL DEFAULT '[]',  -- JSON array
  featured    INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
  recipe_id     INTEGER NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
  ingredient_id INTEGER NOT NULL REFERENCES ingredients(ingredient_id),
  quantity      TEXT,
  unit          TEXT,
  optional      INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (recipe_id, ingredient_id)
);

CREATE TABLE IF NOT EXISTS user_ingredients (
  user_id       INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  ingredient_id INTEGER NOT NULL REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, ingredient_id)
);

CREATE TABLE IF NOT EXISTS instruction_blocks (
  instruction_id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id      INTEGER NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
  step_number    INTEGER NOT NULL,             -- unique within a recipe (business rule)
  description    TEXT    NOT NULL,
  description_ru TEXT,
  description_kk TEXT,
  UNIQUE (recipe_id, step_number)
);

-- password reset tokens (hash stored, never the token itself)
CREATE TABLE IF NOT EXISTS reset_tokens (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  token_hash TEXT    NOT NULL,
  expires_at INTEGER NOT NULL,                 -- unix ms
  used       INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS photo_diary (
  photo_id    INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  recipe_id   INTEGER          REFERENCES recipes(recipe_id) ON DELETE SET NULL,
  photo_url   TEXT    NOT NULL,
  note        TEXT    DEFAULT '',
  uploaded_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS app_meta (
  key   TEXT PRIMARY KEY,
  value TEXT
);

CREATE INDEX IF NOT EXISTS idx_recipe_ing_ingredient ON recipe_ingredients(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ing_recipe     ON recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_diary_user            ON photo_diary(user_id);
