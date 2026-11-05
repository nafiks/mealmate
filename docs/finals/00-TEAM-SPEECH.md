# TEAM SPEECH — 2 minutes · English · split between 4 speakers

> Rehearse with a timer tonight. Speak slowly — 2 minutes is shorter than you think.
> **Total: ~120 sec.** Each bracket [ ] = who speaks.

---

## §1 · INTRO + PROBLEM — Artur (20 sec)

> "Hello! We are Team MealMate from group CS-2618. Here is a number for you:
> **76 kilograms** — the food one person in Kazakhstan throws away every year,
> according to the UNEP Food Waste Index. The problem is that students living away
> from home struggle to decide what to cook from the random products in their fridge —
> so they waste food, waste money, and skip meals."

*(RU: «Привет! Мы — команда MealMate, группа CS-2618. 76 килограммов еды в год
выбрасывает один человек в Казахстане — данные UNEP. Проблема: студенты не решают,
что приготовить из случайных продуктов в холодильнике — еда и деньги на ветер».)*

## §2 · EVIDENCE — Artur (25 sec)

> "To confirm this is real, we studied the UNEP 2021 report and a food-security survey
> of 244 students in Almaty — the link between food security and student well-being is
> proven. We also tested our prototype with real users: every single tester found a
> recipe with our matcher in under two minutes, and told us what to improve — we did."

*(RU: «Подтвердили исследование UNEP 2021 и опрос 244 студентов в Алматы. Своими
тестами: каждый тестировщик нашёл рецепт меньше чем за 2 минуты — и мы исправили
всё, что они отметили».)*

## §3 · SOLUTION — Arsen (25 sec)

> "Our solution is MealMate — a web app that matches recipes to the food you already
> have. You tick your ingredients, and it instantly splits 68 recipes into 'cook right
> now' and 'almost there' — showing exactly what to buy. What makes it different:
> it is built for local kitchens — Kazakh cuisine is first-class — and it works in
> three languages: English, Russian and Kazakh."

*(RU: «MealMate сопоставляет рецепты с тем, что есть. Отмечаешь продукты — 68 рецептов
делятся на „готовить сейчас" и „почти готово" с точным списком покупок. Отличие:
заточен под местные кухни, три языка».)*

## §4 · TECHNOLOGIES — Adilet + Sanzhar (20 sec)

**Adilet (12 sec):**
> "We built it with React, Node.js and SQLite because it runs in any browser with zero
> installation. Our database stores users, ingredients, recipes and a photo diary in
> seven tables — and the ingredient matching itself runs in SQL."

**Sanzhar (8 sec):**
> "…and we protect users by hashing passwords with scrypt, signing session cookies,
> and rate-limiting brute-force attacks."

*(RU: «React + Node + SQLite — работает в любом браузере. В БД — пользователи,
ингредиенты, рецепты, дневник; матчинг в SQL. Защита: хэши паролей, подписанные
куки, рейт-лимит».)*

## §5 · TESTING AND RESULTS — Sanzhar (20 sec)

> "We tested the product with real users — and we audited our own database. Testing
> exposed three UX problems; we fixed all three. Our audit found two ingredients with
> zero recipes — we added ten recipes, and dead coverage dropped to zero."

*(RU: «Реальные юзер-тесты — три UX-проблемы, все исправлены. Аудит БД нашёл два
ингредиента без рецептов — добавили десять, покрытие стало полным».)*

## §6 · PLANS + HANDOVER — Artur (10 sec)

> "Next, we plan a fridge scanner with real computer vision — a working prototype is
> already in the app. Each of us owned a layer of this product. Now — let us show you
> how it works."

*(RU: «Дальше — сканер холодильника с настоящим computer vision, прототип уже в
приложении. У каждого своя часть продукта. Показываем!»)*

---

## TIMING MAP

| Sec | Speaker | Section |
|-----|---------|---------|
| 0–20 | **Artur** | Intro + 76 kg fact |
| 20–45 | **Artur** | Evidence (UNEP + 244 students + own tests) |
| 45–70 | **Arsen** | Solution + differentiator |
| 70–82 | **Adilet** | Stack + database |
| 82–90 | **Sanzhar** | Security |
| 90–110 | **Sanzhar** | Testing → results |
| 110–120 | **Artur** | Plans + handover to demo |

## THE 5 NUMBERS EVERYONE MUST KNOW

1. **76 kg** — food waste per person/year in Kazakhstan (UNEP 2021)
2. **68** recipes · **51** ingredients · **0** dead ingredients (was 2)
3. **3** languages — UI, content, cooking steps
4. **244** students — Almaty food-security survey (problem evidence)
5. **3** UX problems from testing → **3** fixes, all implemented
