import { Router } from 'express'
import crypto from 'node:crypto'
import { db, one, run } from '../db.js'
import {
  hashPassword, verifyPassword, setSession, clearSession, publicUser,
} from '../auth.js'

const r = Router()

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// POST /api/auth/register
// If the current session is a guest, the guest row is upgraded in place —
// pantry and diary carry over to the new account.
r.post('/register', (req, res) => {
  const name = String(req.body?.name || '').trim().slice(0, 60)
  const email = String(req.body?.email || '').trim().toLowerCase().slice(0, 120)
  const password = String(req.body?.password || '')

  if (!name) return res.status(400).json({ error: 'Please tell us your name.' })
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'That email does not look right.' })
  if (password.length < 6) return res.status(400).json({ error: 'Password needs at least 6 characters.' })

  const hash = hashPassword(password)

  if (req.user?.is_guest) {
    const clash = one(`SELECT user_id FROM users WHERE lower(email) = ? AND user_id != ?`, [email, req.user.user_id])
    if (clash) return res.status(409).json({ error: 'This email is already registered.' })
    db.prepare(`UPDATE users SET name = ?, email = ?, password_hash = ?, is_guest = 0 WHERE user_id = ?`)
      .run(name, email, hash, req.user.user_id)
    const updated = one(`SELECT user_id, name, email, is_guest FROM users WHERE user_id = ?`, [req.user.user_id])
    return res.json({ user: publicUser(updated) })
  }

  const clash = one(`SELECT user_id FROM users WHERE lower(email) = ?`, [email])
  if (clash) return res.status(409).json({ error: 'This email is already registered.' })
  const result = db.prepare(`INSERT INTO users (name, email, password_hash, is_guest) VALUES (?, ?, ?, 0)`)
    .run(name, email, hash)
  setSession(res, Number(result.lastInsertRowid))
  const user = one(`SELECT user_id, name, email, is_guest FROM users WHERE user_id = ?`, [Number(result.lastInsertRowid)])
  res.json({ user: publicUser(user) })
})

// POST /api/auth/login
r.post('/login', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')
  const row = one(`SELECT * FROM users WHERE lower(email) = ? AND is_guest = 0`, [email])
  if (!row || !verifyPassword(password, row.password_hash)) {
    return res.status(401).json({ error: 'Wrong email or password.' })
  }
  setSession(res, row.user_id)
  res.json({ user: publicUser(row) })
})

// POST /api/auth/logout — the session becomes a fresh guest on next write
r.post('/logout', (req, res) => {
  clearSession(res)
  res.json({ ok: true })
})

// POST /api/auth/forgot — issue a one-time reset token (valid 30 min).
// No mail service in this project: in production the link would be emailed.
// The demo returns the token so the flow can be completed end-to-end.
r.post('/forgot', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase()
  const user = one(`SELECT user_id FROM users WHERE lower(email) = ? AND is_guest = 0`, [email])
  if (!user) return res.status(404).json({ error: 'No account with this email.' })

  const token = crypto.randomBytes(24).toString('base64url')
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  run(`INSERT INTO reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)`,
    [user.user_id, tokenHash, Date.now() + 30 * 60 * 1000])

  res.json({ ok: true, demo_token: token }) // demo: the "emailed" link
})

// POST /api/auth/reset { token, password } — consume the token, set new password
r.post('/reset', (req, res) => {
  const token = String(req.body?.token || '')
  const password = String(req.body?.password || '')
  if (password.length < 6) return res.status(400).json({ error: 'Password needs at least 6 characters.' })

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const row = one(
    `SELECT rt.id, rt.user_id, rt.expires_at, rt.used FROM reset_tokens rt
     WHERE rt.token_hash = ?`, [tokenHash]
  )
  if (!row || row.used || row.expires_at < Date.now()) {
    return res.status(400).json({ error: 'This reset link is invalid or has expired.' })
  }
  run(`UPDATE reset_tokens SET used = 1 WHERE id = ?`, [row.id])
  db.prepare(`UPDATE users SET password_hash = ? WHERE user_id = ?`)
    .run(hashPassword(password), row.user_id)
  res.json({ ok: true })
})

// GET /api/auth/me
r.get('/me', (req, res) => {
  res.json({ user: publicUser(req.user) })
})

export default r
