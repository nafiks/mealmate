# CHEAT SHEET — Arsen Kaniyazov (Frontend Developer)

> Your station role: §3 solution pitch (25 sec), drive the live demo (clicks),
> answer everything about the interface, i18n and the Fridge Scanner.

## MY LINES

- "Our solution is MealMate — you tick your ingredients, and it instantly splits 68
  recipes into 'cook right now' and 'almost there'."
- "Kazakh cuisine is first-class, and the whole product — including cooking steps —
  works in three languages."
- "The Fridge Scanner is our newest feature: the camera is real, the AI recognition
  is currently simulated — that is our honest next step."

## MY NUMBERS

| Number | What | If asked deeper |
|---|---|---|
| 3 | languages: EN/RU/KK — UI, content, steps | stored in localized DB columns, API `?lang=` with English fallback |
| 51 | picker ingredients (staples pre-counted) | every one covered by ≥1 recipe (coverage audit) |
| 1280 px / 0.82 | photo pipeline in the diary | canvas downscale + JPEG quality — 3–8 MB photos become ~200 KB |
| 2 → 0 | dead ingredients before → after | my coverage audit: COUNTIF in the Assignment-4 workbook |

## MY ANSWERS TO THE COMMISSION

**"What did YOU personally do?"**
"The entire client layer. The design system — one hand-written CSS file, no UI kit.
All pages: home, the ingredient picker with live matching, catalog, recipe pages,
photo diary, community feed. Full trilingual localization — including cooking steps,
which live in the database. And the bugfixes our tests exposed: a pantry sync race,
a quick-add bug, category overflow on desktop."

**"Why React and not plain HTML or a mobile app?"**
"React because the ingredient picker is one reactive state machine — ticking a chip
must update the match list instantly, and React's state model does that cleanly.
Web over mobile because zero installation was our core requirement: a student opens
a link, not an app store. The codebase is a thin layer over web standards, so a
Capacitor wrapper would give us app stores later without a rewrite."

**"How does the localization work?"**
"Two layers. Content lives in localized database columns — title_ru, title_kk, and
the cooking steps too — the API picks the column with ?lang and falls back to
English. Interface strings live in one dictionary file shared by the API and the
client. Units and phrases — like 'a pinch' — are localized separately."

**"What is simulated or unfinished?"**
"Three things, honestly. The Fridge Scanner recognition is simulated on the client —
camera and UI are real, detection is a placeholder for a vision model. Guest data —
diary photos — resets on hosting restarts because the free tier has an ephemeral
disk. And password-reset emails are shown on screen instead of being sent — no mail
service yet."

**"How do you handle images?"**
"In the browser, before upload: FileReader decodes, a canvas downscales to maximum
1280 pixels, then JPEG at quality 0.82 — a 5 MB phone photo becomes about 200 KB.
The server validates the data-URL format and enforces the size limit again."

## EMERGENCY PHRASES

- "That is a database-side decision — Adilet owns the schema; the client just
  renders what the API returns."
- "Good catch — it is on our roadmap; today I would rather show you what works."
