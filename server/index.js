import express from 'express'
import jwt from 'jsonwebtoken'
import { randomBytes } from 'node:crypto'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  COLLECTIONS, listDocs, getDoc, putDoc, delDoc, replaceCol, getMeta, setMeta, listUsers, userById, userByEmail,
  publicUser, insertUser, updateUser, setPassword, deleteUser, checkPassword, jwtSecret, createResetToken, consumeResetToken,
} from './db.js'
import { sendMail } from './mail.js'

const app = express()
app.set('trust proxy', 1)
const PORT = Number(process.env.PORT) || 3001
const SECRET = jwtSecret()
const uid = () => randomBytes(5).toString('hex')

app.use(express.json({ limit: '8mb' }))
// Same-origin by default (the API serves the frontend). Set CORS_ORIGIN only if the frontend is hosted elsewhere.
if (process.env.CORS_ORIGIN) {
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN)
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
    if (req.method === 'OPTIONS') return res.sendStatus(204)
    next()
  })
}

const fail = (res, code, msg) => res.status(code).json({ error: msg })
const ROLES = ['Admin', 'Manager', 'Operator', 'Buxgalter']

// which roles may write which collections (Admin: everything)
const WRITE = {
  Manager: ['clients', 'leads', 'deals', 'payments', 'tasks', 'reminders', 'meetings', 'calls', 'services', 'tours', 'bookings', 'visas', 'partners'],
  Operator: ['clients', 'leads', 'calls', 'tasks', 'reminders', 'meetings', 'visas'],
  Buxgalter: ['payments', 'bookings', 'deals'],
}
const canWrite = (role, col) => role === 'Admin' || (WRITE[role] || []).includes(col)

// ---------- auth ----------
const attempts = new Map()
function throttled(key) {
  const now = Date.now()
  const a = (attempts.get(key) || []).filter((t) => now - t < 60_000)
  attempts.set(key, a)
  return a.length >= 8
}

app.post('/api/auth/login', (req, res) => {
  const { email = '', password = '' } = req.body || {}
  const key = `${req.ip}|${String(email).toLowerCase()}`
  if (throttled(key)) return fail(res, 429, "Juda ko'p urinish. 1 daqiqadan keyin qayta urinib ko'ring")
  const u = userByEmail(String(email).trim())
  if (!u || !checkPassword(u, String(password))) {
    attempts.get(key).push(Date.now())
    return fail(res, 401, "Email yoki parol noto'g'ri")
  }
  const token = jwt.sign({ sub: u.id }, SECRET, { expiresIn: '7d' })
  res.json({ token, user: publicUser(u) })
})

// ---- forgot / reset password (public) ----
const appUrl = (req) => (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '')

app.post('/api/auth/forgot', async (req, res) => {
  const email = String(req.body?.email || '').trim()
  const key = `forgot|${req.ip}`
  if (throttled(key)) return fail(res, 429, "Juda ko'p urinish. Keyinroq qayta urinib ko'ring")
  attempts.get(key).push(Date.now())
  // always answer the same way so the form can't be used to discover registered emails
  res.json({ ok: true })
  try {
    const u = email && userByEmail(email)
    if (!u) return
    const token = createResetToken(u.id)
    const link = `${appUrl(req)}/#/reset?token=${token}`
    const company = getMeta('settings', {}).company || 'CRM'
    await sendMail({
      to: u.email,
      subject: `${company}: parolni tiklash`,
      text: `Salom, ${u.name}!\n\nParolni tiklash uchun havola (1 soat amal qiladi):\n${link}\n\nAgar siz so'ramagan bo'lsangiz, bu xatni e'tiborsiz qoldiring.`,
      html: `<p>Salom, ${u.name.replace(/[<>&]/g, '')}!</p><p>Parolni tiklash uchun tugmani bosing (havola 1 soat amal qiladi):</p><p><a href="${link}" style="background:#2563eb;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Parolni tiklash</a></p><p style="color:#64748b;font-size:13px">Agar tugma ishlamasa: ${link}<br>Agar siz so'ramagan bo'lsangiz, bu xatni e'tiborsiz qoldiring.</p>`,
    })
  } catch (e) { console.error('forgot failed', e) }
})

app.post('/api/auth/reset', (req, res) => {
  const { token = '', password = '' } = req.body || {}
  if (String(password).length < 6) return fail(res, 400, "Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak")
  const userId = consumeResetToken(token)
  if (!userId) return fail(res, 400, "Havola yaroqsiz yoki muddati o'tgan. Qaytadan so'rang")
  setPassword(userId, String(password))
  res.json({ ok: true })
})

function auth(req, res, next) {
  const h = req.headers.authorization || ''
  try {
    const { sub } = jwt.verify(h.replace(/^Bearer /, ''), SECRET)
    const u = userById(sub)
    if (!u) throw new Error('no user')
    req.user = publicUser(u)
    next()
  } catch {
    fail(res, 401, 'Sessiya tugagan, qayta kiring')
  }
}
app.get('/api/health', (_, res) => res.json({ ok: true }))
app.use('/api', auth)

app.get('/api/auth/me', (req, res) => res.json({ user: req.user }))
app.post('/api/auth/password', (req, res) => {
  const { current = '', next = '' } = req.body || {}
  if (String(next).length < 6) return fail(res, 400, "Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak")
  if (!checkPassword(userById(req.user.id), String(current))) return fail(res, 400, "Joriy parol noto'g'ri")
  setPassword(req.user.id, String(next))
  res.json({ ok: true })
})

// ---------- data ----------
app.get('/api/bootstrap', (req, res) => {
  const out = { me: req.user.id, users: listUsers(), settings: getMeta('settings', {}) }
  for (const c of COLLECTIONS) out[c] = listDocs(c)
  res.json(out)
})

const adminOnly = (req, res, next) => (req.user.role === 'Admin' ? next() : fail(res, 403, "Bu amal faqat Admin uchun"))

app.put('/api/settings', adminOnly, (req, res) => {
  const { theme, lang, ...patch } = req.body || {}
  const s = { ...getMeta('settings', {}), ...patch }
  setMeta('settings', s)
  res.json(s)
})


// users (Admin only; passwords never returned)
app.post('/api/users', adminOnly, (req, res) => {
  const { id, name, email, role = 'Manager', password, created } = req.body || {}
  if (!name || !email) return fail(res, 400, 'Ism va email majburiy')
  if (!ROLES.includes(role)) return fail(res, 400, "Noto'g'ri rol")
  if (String(password || '').length < 6) return fail(res, 400, "Parol kamida 6 ta belgidan iborat bo'lishi kerak")
  if (userByEmail(email)) return fail(res, 409, 'Bu email allaqachon mavjud')
  const row = { id: id || uid(), name: String(name), email: String(email).trim(), role, created: created || new Date().toISOString() }
  insertUser(row, String(password))
  res.status(201).json(row)
})
app.patch('/api/users/:id', (req, res) => {
  const self = req.params.id === req.user.id
  if (req.user.role !== 'Admin' && !self) return fail(res, 403, 'Ruxsat yoʻq')
  const patch = { ...req.body }
  if (req.user.role !== 'Admin') delete patch.role // can't promote self
  if (patch.role && !ROLES.includes(patch.role)) return fail(res, 400, "Noto'g'ri rol")
  if (patch.password && String(patch.password).length < 6) return fail(res, 400, "Parol kamida 6 ta belgidan iborat bo'lishi kerak")
  if (patch.email) { const o = userByEmail(patch.email); if (o && o.id !== req.params.id) return fail(res, 409, 'Bu email allaqachon mavjud') }
  const u = updateUser(req.params.id, patch)
  u ? res.json(u) : fail(res, 404, 'Topilmadi')
})
app.delete('/api/users/:id', adminOnly, (req, res) => {
  if (req.params.id === req.user.id) return fail(res, 400, "O'zingizni o'chira olmaysiz")
  deleteUser(req.params.id) ? res.json({ ok: true }) : fail(res, 404, 'Topilmadi')
})

// generic collections
const colGuard = (req, res, next) => {
  if (!COLLECTIONS.includes(req.params.col)) return fail(res, 404, 'Bunday bo‘lim yo‘q')
  if (req.method !== 'GET' && !canWrite(req.user.role, req.params.col)) return fail(res, 403, 'Bu amal uchun ruxsat yo‘q')
  next()
}
const clean = (b) => { const o = { ...b }; delete o._id; return o }

app.get('/api/:col', colGuard, (req, res) => res.json(listDocs(req.params.col)))
app.post('/api/:col', colGuard, (req, res) => {
  const body = clean(req.body)
  if (!body || typeof body !== 'object') return fail(res, 400, "Noto'g'ri ma'lumot")
  const row = { ...body, id: body.id || uid(), created: body.created || new Date().toISOString() }
  if (getDoc(req.params.col, row.id)) return fail(res, 409, 'Bu ID allaqachon mavjud')
  putDoc(req.params.col, row)
  res.status(201).json(row)
})
app.patch('/api/:col/:id', colGuard, (req, res) => {
  const cur = getDoc(req.params.col, req.params.id)
  if (!cur) return fail(res, 404, 'Topilmadi')
  const row = { ...cur, ...clean(req.body), id: cur.id }
  putDoc(req.params.col, row)
  res.json(row)
})
app.put('/api/:col', colGuard, (req, res) => {
  const rows = req.body?.rows
  if (!Array.isArray(rows) || rows.some((r) => !r || !r.id)) return fail(res, 400, "Noto'g'ri ma'lumot")
  replaceCol(req.params.col, rows)
  res.json({ ok: true })
})
app.delete('/api/:col/:id', colGuard, (req, res) => (delDoc(req.params.col, req.params.id) ? res.json({ ok: true }) : fail(res, 404, 'Topilmadi')))

app.use('/api', (_, res) => fail(res, 404, 'Topilmadi'))

// serve the built frontend in production
const dist = join(dirname(fileURLToPath(import.meta.url)), '../dist')
if (existsSync(dist)) {
  app.use(express.static(dist))
  app.get('*', (_, res) => res.sendFile(join(dist, 'index.html')))
}

app.use((err, req, res, next) => { console.error(err); fail(res, 500, 'Server xatosi') })
app.listen(PORT, '0.0.0.0', () => console.log(`CRM API on http://localhost:${PORT}`))
