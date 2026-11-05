# CHEAT SHEET — Adilet Sadybek (Database Administrator)

> Your station role: §4 technologies pitch (12 sec), answer ALL database questions,
> run the live ER change if the commission asks for it.

## MY LINES

- "We built it with React, Node.js and SQLite because it runs in any browser with
  zero installation."
- "Our database stores users, ingredients, recipes and a photo diary in seven tables —
  and the ingredient matching itself runs in SQL."

## MY NUMBERS

| Number | What | If asked deeper |
|---|---|---|
| 7 | core entities + 2 support tables (app_meta, reset_tokens) | exact ER is on our slides and in docs/er-diagram.dbml |
| 2 | junction tables solving M:N | user_ingredients and recipe_ingredients |
| 3 | localization column pairs (title/name/description ×ru/kk) | API ?lang= with English fallback |
| 2 → 0 | dead ingredients before → after the coverage audit | COUNTIF-based, see Assignment-4 workbook |
| 1 SQL | the whole matching — two CTEs in one query | req/got, missing = total − have |

## MY ANSWERS TO THE COMMISSION

**"Why SQLite and not PostgreSQL?"**
"Honest engineering: our load is a university demo, and SQLite gives real persistence
with zero administration and zero native dependencies — the driver is built into
Node. We isolated all SQL behind one thin module (db.js), so moving to PostgreSQL
means rewriting that one file, not the application. We already avoid SQLite-only
features for exactly this reason."

**"Show me your ER model. What would you change?"**
"On the slides: 7 entities — users, ingredients, recipes, the two M:N junctions,
instruction blocks, photo diary — plus reset tokens. Business rules: unique e-mail,
step numbers unique per recipe, FK with ON DELETE CASCADE. A live change I would
make: add a `servings_scale` attribute to recipe_ingredients so users can cook for
three instead of two — one column, no schema break, because quantities are already
per-serving normalized."

**"Where is your matching logic — in the database or in code?"**
"In SQL, where it belongs. One query with two CTEs: `req` counts required
ingredients per recipe — non-optional, non-staple; `got` counts how many of them the
user has. missing = total − have. Zero means 'cook right now', one or two means
'almost there'. Filters for time, cuisine and tags run in the same query."

**"How do you guarantee relevant results? What if I tick only bacon?"**
"Two guards. First, `have ≥ 1` — a recipe appears only if at least one of its
required ingredients is in the selection, so a bacon search never returns dishes
without bacon. Second, with a tiny selection the 'almost' threshold adapts —
otherwise one bacon tick would hide carbonara just because three items are missing."

**"How do you protect the data itself?"**
"Foreign keys with ON DELETE CASCADE — deleting a recipe cleans its steps and
junction rows automatically. UNIQUE constraints on e-mail and step numbers.
Everything is parameterized — no string-built SQL, so injection is structurally
impossible. And the database file is excluded from the repository."

## LIVE CHANGE — prep for the defense

Open https://dbdiagram.io → New Diagram → paste `docs/er-diagram.dbml` (it is in our
repo) → the diagram renders. If asked to change live: add one line inside a table
(e.g. `servings_scale integer` inside recipe_ingredients) — the diagram updates
instantly, and I explain: "one column in SQLite mirrors this one line."

## EMERGENCY PHRASES

- "By design, the schema mirrors our ER model from Assignment 3 — the extensions are
  additive columns, so the model survived into production unchanged."
- "Coverage counts recipes, not popularity — that limitation is in our Assignment-4
  report; the next audit would weigh recipe quality too."
