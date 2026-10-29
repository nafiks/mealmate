import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, 'data')
fs.mkdirSync(dataDir, { recursive: true })

const dbPath = process.env.MEALMATE_DB || path.join(dataDir, 'mealmate.db')

export const db = new DatabaseSync(dbPath)
db.exec('PRAGMA journal_mode = WAL;')
db.exec('PRAGMA foreign_keys = ON;')
db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'))

export const rows = (sql, params = []) => db.prepare(sql).all(...params)
export const one = (sql, params = []) => db.prepare(sql).get(...params)
export const run = (sql, params = []) => db.prepare(sql).run(...params)
