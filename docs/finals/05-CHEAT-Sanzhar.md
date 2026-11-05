# CHEAT SHEET — Sanzhar Temirtas (Backend Developer & Security)

> Your station role: finish §4 (security, 8 sec), deliver §5 testing-and-results
> (20 sec), answer ALL backend and security questions.

## MY LINES

- "…and we protect users by hashing passwords with scrypt, signing session cookies,
  and rate-limiting brute-force attacks."
- "We tested with real users — three UX problems found, three fixed. Our database
  audit found two ingredients with zero recipes; we added ten recipes and coverage
  went to zero."

## MY NUMBERS

| Number | What | If asked deeper |
|---|---|---|
| 40 / 10 min | auth rate limit per IP (diary uploads: 20) | in-memory bucket, resets automatically |
| 30 min | password-reset token lifetime | one-time, SHA-256 hash stored — the token itself never saved |
| 90 days | session cookie lifetime | httpOnly + SameSite=Lax, HMAC-SHA256 signed |
| 6 MB / 3 MB | upload body limit / post-compression | enforced on both client (canvas) and server (validation) |
| 3 | UX problems from testing → 3 fixes | plus the coverage fix from the DB audit |

## MY ANSWERS TO THE COMMISSION

**"What did YOU personally do?"**
"The backend layer. Every API endpoint — ingredients, matching, authentication,
pantry, diary and the community feed. The security stack: scrypt password hashing,
HMAC-signed session cookies, security headers, rate limiting and strict input
validation. And the content pipeline: 68 recipes with nutrition data and cooking
steps in three languages, seeded into the database."

**"How exactly do you store passwords?"**
"scrypt — a memory-hard key-derivation function built into Node — with a unique
random salt per user. We compare with a timing-safe equality check, so even the
comparison cannot leak information. If the database leaked, an attacker would get
salted hashes and would still have to brute-force each one at heavy memory cost."

**"How do sessions work without a login server?"**
"A signed cookie. The payload is the user id and expiry; we sign it with HMAC-SHA256
using a server secret. The cookie is httpOnly — JavaScript cannot read it — and
SameSite=Lax. Forgery requires the secret, which never leaves the server. Guests get
the same mechanics with a guest row, and registering upgrades that row instead of
creating a new identity — so their pantry carries over."

**"Demonstrate one security scenario."**
"Brute force. I send rapid wrong passwords at /api/auth/login — the first forty get
a clean 401, request forty-one gets HTTP 429 Too Many Requests for the rest of the
window. The account is never locked for the real owner, and the attacker gains
nothing: scrypt makes each guess cost real time even offline. On our slides it is
the four-step diagram; the limiter is live on the deployed app right now."

**"How did you use AI — and how did you verify it?"**
"We disclosed it in every assignment. AI generated application code, seed content
and the coverage spreadsheet. We verified by running it: every recipe was reviewed
against real cooking logic, every API endpoint was tested with real requests, the
coverage numbers in the Assignment-4 workbook come from live database queries I can
re-run in front of you. The honest gaps — simulated fridge-scan AI, silent source
video — we disclosed in the product itself."

**"What happens if the database leaks?"**
"Worst case: usernames, e-mails, salted scrypt hashes, and public recipe data. No
plaintext passwords, no card data — we do not collect any. Sessions survive because
cookies are signed with a server-side secret, not with database content."

## EMERGENCY PHRASES

- "Security is layered: even if one measure failed, the next one — hashing, headers,
  validation — still holds."
- "We disclose what is simulated instead of claiming it works: the scanner AI, for
  example, is labeled as a demo inside the product."
