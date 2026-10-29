# MealMate 🍳

**Find a recipe from what you already have at home.**

MealMate matches the ingredients in your kitchen to recipes you can cook **right now** —
and shows exactly what is missing for the rest. Built for students and first kitchens:
no installation required, works in any browser.

> CS-2618 · Samarin · Kaniyazov · Sadybek · Temirtas

## 1. The product

**Problem**: students living on their own cannot decide what to cook from what they
already have → food waste, extra spending, skipped dinners.

**Solution**: tick what you have and get two honest lists:

| List | Meaning |
|---|---|
| **Cook right now** | every required ingredient is in your kitchen (staples like salt & oil are auto-counted) |
| **Almost there** | missing just 1–2 ingredients — a recipe only appears if you already have **at least one** of its ingredients, so results are always relevant |

Plus: filters (time ≤15/30/45, tags, cuisine), KBJU per serving, favorites,
a **photo diary**, a **community feed** of everyone's cooked dishes, and accounts
(guest pantry carries over on registration).

### Design concept — "Fresh Market Editorial"

Warm paper `#F6F1E7` + deep forest green + lime accent; tomato red reserved strictly
for "missing" states. **Fraunces** (display serif) + **Manrope** (UI). Real food
photography with graceful gradient+emoji fallback tiles. Editorial details: hairline
rules, uppercase kickers, serif numerals, ingredient marquee, grain on dark panels.
Motion with a purpose: scroll-reveals, springy chip check-pop, card lift + image zoom,
count-up stats; `prefers-reduced-motion` respected.

UX findings from user testing — solved: clear ingredient tiles with instant state,
sticky mobile bar "Show matches ↓" as an explicit finish, persistent header + labeled
back links.

## 2. Pages

| Route | Purpose |
|---|---|
| `/` | Hero, how-it-works, featured recipes, cuisines, CTA |
| `/kitchen` | **The core tool**: ingredient picker + live matching |
| `/recipes` | Catalog with search, cuisine/tag filters, saved-only view |
| `/recipes/:id` | Detailed steps (3 languages), have/missing ingredients, KBJU bars, diary |
| `/diary` | Your photo diary (sign-in required for uploads) |
| `/community` | Photos from all registered cooks |
| `/login`, `/join`, `/forgot`, `/reset` | Auth + password recovery |

## 3. Tech stack

| Layer | Choice |
|---|---|
| Frontend | **React 18 + Vite**, hand-crafted CSS design system, react-router |
| Backend | **Node.js + Express** |
| Database | **SQLite** via built-in `node:sqlite` (no native deps; swap `server/db.js` for Postgres) |
| Hosting | **Railway** (single service) or Vercel (SPA) + Railway (API) |

> Requires **Node.js ≥ 22.5**.

## 4. Localization (EN · RU · ҚАЗ)

Header switcher `EN / РУ / ҚАЗ`; browser language auto-detected, choice persisted.

- UI strings and label maps: `server/data/i18n.js` (shared by API and client).
- Recipe titles, descriptions, ingredient names: localized DB columns
  (`title_ru`, `title_kk`, `name_ru`, `name_kk`); API takes `?lang=ru|kk` with EN fallback.
- **Cooking steps are fully localized in all three languages**
  (`instruction_blocks.description_ru/kk`) — detailed: heat levels, timings, doneness cues.
- Units and phrases ("a pinch", "tbsp") are localized on the client.

## 5. Accounts & community

- **Sign in is required** for saving recipes (♥) and diary uploads. A guest tapping them
  is sent to sign in and the action **resumes automatically** afterwards. The server also
  rejects diary writes from guest sessions.
- **Password recovery**: `POST /api/auth/forgot` issues a one-time SHA-256-hashed token
  (30 min). No mail service in the demo — the "emailed" link is shown on screen
  (`/forgot` → `/reset?token=…` → new password).
- **Community feed** (`/community`): photos from all registered cooks, newest first.
  Guest uploads stay private until an account is created.

## 6. Quick start

```bash
npm install

# development: API on :3001 + Vite on :5173 (with /api proxy)
npm run dev

# production: build the SPA, Express serves it on :3001
npm run build
npm start

# reseed the recipe database
npm run seed:reset
```

Seed content: **58 recipes** (Kazakh 14, Russian 11, European 13, Asian 10, Mexican 10),
50 ingredients, KBJU, detailed steps in 3 languages, tags. The database file is created
and seeded automatically on first start (`server/data/mealmate.db`).

## 7. Showing the site to others

```bash
cloudflared tunnel --url http://localhost:3001
# → a temporary public https://<random>.trycloudflare.com URL
```

Same Wi-Fi: `http://<your-lan-ip>:3001` (allow Node through the firewall).
Permanent: deploy to Railway (below).

## 8. API

| Method & path | Purpose |
|---|---|
| `GET /api/health` | liveness |
| `GET /api/ingredients` | grouped list (+ `key` for quick sets) + quick-add sets |
| `GET /api/recipes/meta/all` | cuisines, tags, stats |
| `GET /api/recipes?ingredients=&maxTime=&cuisine=&tag=&q=&lang=` | matching: `cookNow[]`, `almost[]` with exact missing items |
| `GET /api/recipes/:id?ingredients=&lang=` | full recipe, localized steps & ingredients |
| `POST /api/auth/register` / `login` / `logout` · `GET /api/auth/me` | accounts (guest row upgrade keeps pantry/diary) |
| `POST /api/auth/forgot` · `POST /api/auth/reset` | password recovery (one-time hashed token) |
| `GET /api/pantry` · `PUT /api/pantry` | saved ingredient selection |
| `GET /api/diary` · `POST /api/diary` · `DELETE /api/diary/:id` | photo diary (account holders) |
| `GET /api/diary/feed` | community feed |

Matching is done in SQL (CTEs `req`/`got`): required = non-optional, non-staple
ingredients; `missing = total − have`; a recipe enters the results only when
`have ≥ 1` (real overlap with your selection).

## 9. Security

scrypt password hashing with per-user salt · HMAC-SHA256-signed httpOnly session
cookies · helmet · per-IP rate limiting on auth & uploads · strict input validation ·
parameterized SQL only · one-time hashed reset tokens.

## 10. Deployment (Railway — recommended)

1. Push to GitHub → Railway → Deploy from repo.
2. Add a **Volume** mounted at `/data`, set `MEALMATE_DB=/data/mealmate.db`.
3. Start command `npm start`; Railway provides `PORT` and HTTPS.

Vercel (SPA) + Railway (API): set `CORS_ORIGIN` on the API and `VITE_API_URL` on Vercel.

## 11. Project structure

```
mealmate/
├── package.json            # one package: dev / build / start
├── vite.config.js          # client root + /api proxy
├── server/
│   ├── index.js            # Express: static SPA + API + security
│   ├── db.js  schema.sql  seed.js  auth.js
│   ├── data/               # seed content: ingredients, recipes, i18n, steps (en/ru/kk)
│   └── routes/             # recipes, ingredients, auth, pantry, diary
└── client/
    ├── index.html
    └── src/
        ├── styles/global.css   # design system
        ├── i18n.js  store.jsx  api.js
        ├── components/         # Header, Footer, RecipeCard, MatchRing, Reveal, DiaryModal…
        └── pages/              # Home, Kitchen, Catalog, Recipe, Diary, Community, Auth, Forgot, Reset
```

---

*Made with too many eggs and one very patient frying pan.*
