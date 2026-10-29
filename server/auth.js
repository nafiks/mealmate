import crypto from 'node:crypto'
import { db, one, run } from './db.js'

const COOKIE = 'mm_session'
const SESSION_TTL = 1000 * 60 * 60 * 24 * 90 // 90 days

// --- session secret (persisted so logins survive restarts) ---
function getSecret() {
  const row = one(`SELECT value FROM app_meta WHERE key = 'session_secret'`)
  if (row) return row.value
  const secret = crypto.randomBytes(32).toString('hex')
  run(`INSERT OR REPLACE INTO app_meta (key, value) VALUES ('session_secret', ?)`, [secret])
  return secret
}
const SECRET = getSecret()

// --- passwords: scrypt with per-user salt ---
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password, stored) {
  const [salt, hash] = String(stored || '').split(':')
  if (!salt || !hash) return false
  const test = crypto.scryptSync(password, salt, 64)
  const expected = Buffer.from(hash, 'hex')
  return expected.length === test.length && crypto.timingSafeEqual(expected, test)
}

// --- signed session tokens (HMAC-SHA256, no external deps) ---
const b64u = (buf) => Buffer.from(buf).toString('base64url')

function sign(payload) {
  const body = b64u(JSON.stringify(payload))
  const mac = crypto.createHmac('sha256', SECRET).update(body).digest('base64url')
  return `${body}.${mac}`
}

function unsign(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null
  const [body, mac] = token.split('.')
  const check = crypto.createHmac('sha256', SECRET).update(body).digest('base64url')
  const a = Buffer.from(mac)
  const b = Buffer.from(check)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
    if (!payload?.uid || payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

function parseCookies(header) {
  const out = {}
  if (!header) return out
  for (const part of header.split(';')) {
    const i = part.indexOf('=')
    if (i > -1) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim())
  }
  return out
}

export function setSession(res, userId) {
  const token = sign({ uid: userId, exp: Date.now() + SESSION_TTL })
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL,
    secure: false // Railway terminates TLS before the app; secure:false keeps local runs working
  })
}

export function clearSession(res) {
  res.cookie(COOKIE, '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 })
}

export function createGuest() {
  const res = run(`INSERT INTO users (name, is_guest) VALUES (?, 1)`, ['Guest'])
  return one(`SELECT * FROM users WHERE user_id = ?`, [Number(res.lastInsertRowid)])
}

// --- middleware ---
export function attachUser(req, _res, next) {
  req.user = null
  const token = parseCookies(req.headers.cookie)[COOKIE]
  const payload = unsign(token)
  if (payload) {
    const user = one(`SELECT user_id, name, email, is_guest FROM users WHERE user_id = ?`, [payload.uid])
    if (user) req.user = user
  }
  next()
}

// Guarantees req.user exists on write endpoints: guests get an auto-provisioned
// user row, so pantry & diary work with zero sign-up friction (cookie carries it).
export function requireUser(req, res, next) {
  if (req.user) return next()
  const guest = createGuest()
  req.user = { user_id: guest.user_id, name: guest.name, email: null, is_guest: 1 }
  setSession(res, guest.user_id)
  next()
}

export function publicUser(u) {
  if (!u) return null
  return { id: u.user_id, name: u.name, email: u.email, isGuest: !!u.is_guest }
}
