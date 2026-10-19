import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomBytes, createHash } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { seed, STATUS_SEED } from '../src/seed.js'

const FILE = process.env.DB_FILE || fileURLToPath(new URL('./data/crm.db', import.meta.url))
mkdirSync(dirname(FILE), { recursive: true })
export const db = new DatabaseSync(FILE)

db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS docs (col TEXT NOT NULL, id TEXT NOT NULL, data TEXT NOT NULL, seq INTEGER NOT NULL, PRIMARY KEY (col, id));
  CREATE INDEX IF NOT EXISTS docs_col ON docs (col, seq);
  CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE COLLATE NOCASE, role TEXT NOT NULL, created TEXT NOT NULL, pass_hash TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS reset_tokens (hash TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires INTEGER NOT NULL);
`)

// ---- password reset tokens (only a hash is stored) ----
const sha = (t) => createHash('sha256').update(t).digest('hex')
export function createResetToken(userId, ttlMs = 60 * 60 * 1000) {
  db.prepare('DELETE FROM reset_tokens WHERE expires < ? OR user_id = ?').run(Date.now(), userId)
  const token = randomBytes(32).toString('base64url')
  db.prepare('INSERT INTO reset_tokens (hash, user_id, expires) VALUES (?, ?, ?)').run(sha(token), userId, Date.now() + ttlMs)
  return token
}
export function consumeResetToken(token) {
  const row = db.prepare('SELECT user_id, expires FROM reset_tokens WHERE hash = ?').get(sha(String(token)))
  if (!row || row.expires < Date.now()) return null
  db.prepare('DELETE FROM reset_tokens WHERE user_id = ?').run(row.user_id)
  return row.user_id
}

export const COLLECTIONS = [
  'clients', 'leads', 'deals', 'tours', 'bookings', 'payments', 'visas', 'partners', 'tasks',
  'reminders', 'meetings', 'calls', 'statuses', 'fields', 'services',
]

const q = {
  list: db.prepare('SELECT data FROM docs WHERE col = ? ORDER BY seq DESC'),
  get: db.prepare('SELECT data FROM docs WHERE col = ? AND id = ?'),
  put: db.prepare('INSERT INTO docs (col, id, data, seq) VALUES (?, ?, ?, ?) ON CONFLICT(col, id) DO UPDATE SET data = excluded.data'),
  del: db.prepare('DELETE FROM docs WHERE col = ? AND id = ?'),
  clear: db.prepare('DELETE FROM docs WHERE col = ?'),
  maxSeq: db.prepare('SELECT COALESCE(MAX(seq), 0) AS m FROM docs'),
  metaGet: db.prepare('SELECT v FROM meta WHERE k = ?'),
  metaSet: db.prepare('INSERT INTO meta (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v'),
}

let seq = q.maxSeq.get().m
export const listDocs = (col) => q.list.all(col).map((r) => JSON.parse(r.data))
export const getDoc = (col, id) => { const r = q.get.get(col, id); return r ? JSON.parse(r.data) : null }
export const putDoc = (col, doc) => q.put.run(col, doc.id, JSON.stringify(doc), ++seq)
export const delDoc = (col, id) => q.del.run(col, id).changes > 0
export const replaceCol = (col, docs) => {
  db.exec('BEGIN')
  try {
    q.clear.run(col)
    // docs arrive newest-first (UI order); insert in reverse so seq keeps that order
    ;[...docs].reverse().forEach((d) => putDoc(col, d))
    db.exec('COMMIT')
  } catch (e) { db.exec('ROLLBACK'); throw e }
}
export const getMeta = (k, fallback = null) => { const r = q.metaGet.get(k); return r ? JSON.parse(r.v) : fallback }
export const setMeta = (k, v) => q.metaSet.run(k, JSON.stringify(v))

// ---- users ----
const strip = ({ pass_hash, ...u }) => u
export const listUsers = () => db.prepare('SELECT * FROM users ORDER BY created DESC, rowid DESC').all().map(strip)
export const userById = (id) => db.prepare('SELECT * FROM users WHERE id = ?').get(id)
export const userByEmail = (email) => db.prepare('SELECT * FROM users WHERE email = ?').get(email)
export const publicUser = strip
export const insertUser = ({ id, name, email, role, created }, password) =>
  db.prepare('INSERT INTO users (id, name, email, role, created, pass_hash) VALUES (?, ?, ?, ?, ?, ?)').run(id, name, email, role, created, bcrypt.hashSync(password, 10))
export const updateUser = (id, patch) => {
  const u = userById(id)
  if (!u) return null
  const n = { name: patch.name ?? u.name, email: patch.email ?? u.email, role: patch.role ?? u.role }
  db.prepare('UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?').run(n.name, n.email, n.role, id)
  if (patch.password) setPassword(id, patch.password)
  return strip(userById(id))
}
export const setPassword = (id, password) => db.prepare('UPDATE users SET pass_hash = ? WHERE id = ?').run(bcrypt.hashSync(password, 10), id)
export const deleteUser = (id) => db.prepare('DELETE FROM users WHERE id = ?').run(id).changes > 0
export const checkPassword = (u, password) => bcrypt.compareSync(password, u.pass_hash)

// ---- seeding ----
export function seedAll(demoPassword = process.env.DEMO_PASSWORD || 'demo1234') {
  const s = seed()
  db.exec('BEGIN')
  try {
    db.exec('DELETE FROM docs; DELETE FROM users;')
    seq = 0
    for (const col of COLLECTIONS) [...(s[col] || [])].reverse().forEach((d) => putDoc(col, d))
    for (const u of s.users) insertUser(u, demoPassword)
    const { theme, lang, ...shared } = s.settings
    setMeta('settings', shared)
    db.exec('COMMIT')
  } catch (e) { db.exec('ROLLBACK'); throw e }
}
// First start with an empty database: create the admin account (and sample data only if SEED_DEMO=1).
export function bootstrapIfEmpty() {
  if (listUsers().length > 0) return
  if (process.env.SEED_DEMO === '1') { seedAll(); console.log('Seeded demo data (SEED_DEMO=1)'); return }
  const s = seed()
  const email = (process.env.ADMIN_EMAIL || 'admin@solotour.uz').trim()
  const generated = !process.env.ADMIN_PASSWORD
  const password = process.env.ADMIN_PASSWORD || randomBytes(9).toString('base64url')
  STATUS_SEED.forEach((st) => putDoc('statuses', st))
  s.fields.forEach((f) => putDoc('fields', f))
  const { theme, lang, ...shared } = s.settings
  setMeta('settings', { ...shared, plan: undefined })
  insertUser({ id: 'u1', name: process.env.ADMIN_NAME || 'Admin', email, role: 'Admin', created: new Date().toISOString() }, password)
  console.log('================================================')
  console.log(' Admin account created')
  console.log(`   email:    ${email}`)
  console.log(generated ? `   password: ${password}   (generated - change it after first login)` : '   password: from ADMIN_PASSWORD')
  console.log('================================================')
}
bootstrapIfEmpty()

export function jwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET
  let s = getMeta('jwt_secret')
  if (!s) { s = randomBytes(48).toString('hex'); setMeta('jwt_secret', s) }
  return s
}
