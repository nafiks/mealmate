# Assignment 4 — Individual Investigation (DRAFT for Arsen Kaniyazov, CS-2618)

> **How to use this file:** everything below is based on REAL, verifiable work from our
> project (the coverage analysis runs against the live database). Before submitting:
> (1) open the XLSX, re-run the two formulas yourself and be ready to explain them,
> (2) write section G **in your own words**, (3) export this file to PDF (2–3 pages),
> (4) fill in the AI-use disclosure honestly. Do not submit anything you cannot explain.

## A. Project and question

- **Project:** MealMate — a web app that matches the ingredients a student already has
  at home to recipes they can cook right now (CS-2618 team project).
- **My unique question:** *What share of the ingredients offered in our ingredient picker
  cannot be used in any recipe, and did the coverage fix remove those dead items?*
- **Indicator:** number and share of picker ingredients that appear in **0 recipes**
  (measurable, numeric); secondary indicator: average recipes per ingredient.
- Why this is distinct from my teammates' questions: this question audits the
  **content/database side of the frontend picker** — the exact layer I own as the
  frontend developer — using database counts, not user timing or opinion surveys.

## B. Method and raw evidence

- **Method chosen:** option B — recorded observations from a real, permitted process:
  our own production database (`server/data/mealmate.db`, table `recipe_ingredients`).
- **Observations collected:** 51 (one row per ingredient shown in the `/kitchen` picker),
  each recording how many of our 68 recipes include that ingredient.
- **When/where:** 30 Oct 2026, from the live local deployment (localhost:3001).
- **Raw data:** see `Assignment4-Arsen-coverage-data.xlsx`, sheet **Raw Data** (editable).
- Sensitive data: none — the dataset contains ingredient names and counts only.

## C. Analysis

Sheet **Analysis** (all formulas editable):

- **Calculation 1:** `=COUNTIF('Raw Data'!D2:D52,0)` → ingredients with zero recipes.
- **Calculation 2:** `=AVERAGE('Raw Data'!D2:D52)` → average recipes per ingredient.
- Supporting: `=COUNTIF(...,1)` (weak coverage), `=B3/B4*100` (share of dead items, %).
- **Chart:** column chart "Recipe coverage per picker ingredient (n=51)", sorted
  ascending so the weakest-covered ingredients sit on the left (sheet **Chart**).
- Cleaning: no missing or duplicate rows were found (ingredient names are UNIQUE in the
  schema), so no rows were removed; optional ingredients are counted the same as
  required ones — noted as a limitation of the counting method.

## D. Findings

- **Finding 1 (numbers):** before the fix the picker offered 51 ingredients, of which
  **2 (3.9%) had zero recipes** — Bacon and canned Corn — and **9 more (17.6%) had only
  one recipe**. Selecting Bacon alone returned an empty results screen.
- **Finding 2 (numbers):** after adding 10 targeted recipes (68 total), dead items
  dropped to **0 of 51 (0%)** and the average recipes per ingredient reached **≈4.2**;
  every picker item now appears in at least one recipe.
- **Limitation:** the metric measures *coverage*, not *usefulness* — a high count does
  not mean the recipes are popular, and 68 recipes is still a small database, so many
  realistic ingredient combinations can still return no full match.

## E. Smart decision (data flow)

```
DATA SOURCE                    INPUT / TRANSMISSION          PROCESSING                     OUTPUT / ACTION
MealMate SQLite DB          →  GET /api/ingredients +     →  SQL match: required =       →  Two honest lists in UI:
(recipes, ingredients,         GET /api/recipes?             non-optional & non-staple;     "Cook right now" /
recipe_ingredients tables)     ingredients=1,2,…&lang        have = overlap with user       "Almost there" (missing
                               (HTTPS, JSON)                 selection; missing = total−have  1–2 shown as chips)
```

- **Automation recommendation:** a scheduled "coverage report" query (the same COUNTIF
  logic as in the spreadsheet) could run on every database update and warn the admin
  when a picker ingredient drops below 1 recipe — preventing dead picker items at
  content-entry time, not after release.
- **IoT decision:** sensors are **not** justified here — the fridge cannot report its
  contents reliably or cheaply; the user ticking ingredients is simpler and more
  accurate. (Justified absence of IoT.)
- **Risk identified:** the matching rule that shows "Almost there" recipes depends on
  the overlap between user selection and recipe requirements — a too-strict threshold
  can make a valid selection (e.g. only Bacon) return zero results. Reliability risk:
  an empty-looking screen for a correct query reads as "broken" to users.

## F. Improvement

- **BEFORE:** two picker ingredients (Bacon, canned Corn, 3.9% of the picker) had **0
  recipes**, and 9 more had only 1. Selecting Bacon alone showed an empty screen
  ("Пока ничего не нашлось") even though the app had bacon dishes — the strict
  "missing ≤ 2 ingredients" rule hid every relevant recipe.
- **AFTER (PROPOSED → IMPLEMENTED):** (1) added 10 recipes targeted exactly at the
  uncovered ingredients (Carbonara, BLT, Corn Chowder, Corn & Egg Salad, Yogurt Bowl,
  Stuffed Peppers, Fish Cakes, Pasta with Peas & Bacon, Chicken & Avocado Salad,
  Bolognese) → dead items 2 → 0; (2) matching made adaptive: with 1–2 selected
  ingredients the results list every recipe containing at least one of them, sorted by
  missing count, so a single-ingredient selection always shows relevant dishes.
- **Evidence link:** Finding 1 (2 dead items; empty result on Bacon) and Finding 2
  (0 dead items; Bacon now returns 3 recipes: Carbonara, BLT, Pasta with Peas & Bacon).
- **Status: IMPLEMENTED** (deployed on the local production build; screenshots:
  `docs/screenshots/`, file names `before-bacon-empty.png`, `after-bacon-results.png` —
  take them from localhost:3001/kitchen before submitting).

## G. Reflection and AI use

> **Write this section yourself (100–150 words) and translate into your own style.**
> Skeleton: "I audited the ingredient picker against our recipe database and counted
> coverage for all 51 items. I was surprised that two ingredients — bacon and corn —
> had no recipes at all, and that a correct single-ingredient search returned an empty
> screen because of a strict matching rule. I added ten recipes targeting the gaps and
> made the matching threshold adaptive. The team should next add a coverage report to
> the admin workflow so dead ingredients are caught when recipes are added. What I
> would verify next: whether the new recipes actually reduce empty-result searches."

**AI-use disclosure (edit to match what you actually did and your instructor's policy):**
"ZCode (AI coding agent) was used to build the MealMate application codebase, generate
the seed dataset, and produce the initial coverage spreadsheet from our database. I
verified the formulas myself by re-running them in Excel, reproduced the Bacon empty
result before the fix and the 3-recipe result after it, and wrote this reflection."

## Sources

- MealMate production database (`server/data/mealmate.db`) — team project artifact.
- Course example: "Study Room Finder" worked example in Assignment 4 brief (method only).
