import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const KEY = 'solotour-crm-v1' // legacy local-storage key, cleared on start
export const uid = () => Math.random().toString(36).slice(2, 10)
import { RATE_DEFAULT, STATUS_SEED } from './seed'
export { RATE_DEFAULT, STATUS_SEED }

const Ctx = createContext(null)
const TOKEN = 'solotour-token'
const PREFS = 'solotour-prefs'
const LOCAL_KEYS = ['theme', 'lang'] // per-browser preferences, never sent to the server

const readPrefs = () => { try { return JSON.parse(localStorage.getItem(PREFS)) || {} } catch { return {} } }
const writePrefs = (p) => { try { localStorage.setItem(PREFS, JSON.stringify({ ...readPrefs(), ...p })) } catch {} }

const COLS = ['clients', 'leads', 'deals', 'tours', 'bookings', 'payments', 'visas', 'partners', 'tasks', 'reminders', 'meetings', 'calls', 'statuses', 'fields', 'services', 'users']
const DEFAULT_SETTINGS = { company: 'CRM', phone: '', email: '', address: '', rate: RATE_DEFAULT, theme: 'light', lang: 'uz', logo: '', colorMode: 'default', brand: '#2563eb', telegramToken: '', telegramOn: false, paymentTelegram: '' }
const emptyDb = () => ({ ...Object.fromEntries(COLS.map((c) => [c, []])), me: null, settings: { ...DEFAULT_SETTINGS, ...readPrefs() } })

class NetErr extends Error {}
export async function api(method, path, body) {
  let res
  try {
    res = await fetch('/api' + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(localStorage.getItem(TOKEN) ? { Authorization: 'Bearer ' + localStorage.getItem(TOKEN) } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch { throw new NetErr("Server bilan aloqa yo'q") }
  const ct = res.headers.get('content-type') || ''
  if (!ct.includes('json')) throw new NetErr("Server bilan aloqa yo'q")
  const data = await res.json()
  if (!res.ok) { const e = new Error(data.error || 'Xatolik'); e.status = res.status; throw e }
  return data
}

export function StoreProvider({ children }) {
  const [db, setDb] = useState(emptyDb)
  const [auth, setAuth] = useState(() => !!localStorage.getItem(TOKEN))
  const [booting, setBooting] = useState(() => !!localStorage.getItem(TOKEN))
  const [bootError, setBootError] = useState('')

  const loadServer = useCallback(async () => {
    const data = await api('GET', '/bootstrap')
    setDb({ ...emptyDb(), ...data, settings: { ...DEFAULT_SETTINGS, ...data.settings, ...readPrefs() } })
  }, [])

  const boot = useCallback(() => {
    if (!localStorage.getItem(TOKEN)) { setBooting(false); return }
    setBooting(true); setBootError('')
    loadServer()
      .catch((e) => {
        if (e instanceof NetErr) setBootError(e.message) // keep the session, let the user retry
        else { localStorage.removeItem(TOKEN); setAuth(false) }
      })
      .finally(() => setBooting(false))
  }, [loadServer])

  useEffect(() => { try { localStorage.removeItem(KEY); localStorage.removeItem(KEY + '-auth') } catch {} boot() }, [boot])

  useEffect(() => { document.documentElement.setAttribute('data-theme', db.settings.theme) }, [db.settings.theme])
  useEffect(() => {
    const el = document.documentElement.style
    if (db.settings.colorMode === 'logo' && db.settings.brand) el.setProperty('--primary', db.settings.brand)
    else el.removeProperty('--primary')
  }, [db.settings.colorMode, db.settings.brand])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN)
    setAuth(false); setDb(emptyDb())
  }, [])

  // fire-and-forget server write; on failure tell the user and resync from the server
  const sync = useCallback((method, path, body) => {
    api(method, path, body).catch((e) => {
      if (e.status === 401) return logout()
      window.alert(e.message)
      loadServer().catch(() => {})
    })
  }, [loadServer, logout])

  const add = useCallback((col, item) => {
    const row = { id: uid(), created: new Date().toISOString(), ...item }
    const { password, ...local } = row
    setDb((s) => ({ ...s, [col]: [local, ...s[col]] }))
    sync('POST', '/' + col, row)
    return local
  }, [sync])
  const update = useCallback((col, id, patch) => {
    const { password, ...local } = patch
    setDb((s) => ({ ...s, [col]: s[col].map((r) => (r.id === id ? { ...r, ...local } : r)) }))
    sync('PATCH', `/${col}/${id}`, patch)
  }, [sync])
  const remove = useCallback((col, id) => {
    setDb((s) => ({ ...s, [col]: s[col].filter((r) => r.id !== id) }))
    sync('DELETE', `/${col}/${id}`)
  }, [sync])
  const setCol = useCallback((col, rows) => { setDb((s) => ({ ...s, [col]: rows })); sync('PUT', '/' + col, { rows }) }, [sync])
  const setSettings = useCallback((patch) => {
    setDb((s) => ({ ...s, settings: { ...s.settings, ...patch } }))
    const local = {}, shared = {}
    Object.entries(patch).forEach(([k, v]) => (LOCAL_KEYS.includes(k) ? (local[k] = v) : (shared[k] = v)))
    if (Object.keys(local).length) writePrefs(local)
    if (Object.keys(shared).length) sync('PUT', '/settings', shared)
  }, [sync])

  // returns {ok:true} or {error}
  const login = useCallback(async (email, password) => {
    try {
      const { token } = await api('POST', '/auth/login', { email, password })
      localStorage.setItem(TOKEN, token)
      await loadServer()
      setAuth(true)
      return { ok: true }
    } catch (e) {
      localStorage.removeItem(TOKEN)
      return { error: e.message }
    }
  }, [loadServer])

  const changePassword = useCallback(async (current, next) => {
    try { await api('POST', '/auth/password', { current, next }); return { ok: true } } catch (e) { return { error: e.message } }
  }, [])

  const value = { db, add, update, remove, setCol, setSettings, auth, login, logout, changePassword, booting, bootError, retry: boot }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useStore = () => useContext(Ctx)

// ---- helpers ----
export const fmt = (n) => Math.round(Number(n) || 0).toLocaleString('en-US').replace(/,/g, ' ')
export const money = (n, cur = 'UZS') => (cur === 'USD' ? `$${fmt(n)}` : `${fmt(n)} so'm`)
export const toUZS = (n, cur, rate) => (cur === 'USD' ? n * rate : n)
export const fdate = (iso) => {
  if (!iso) return '-'
  const x = new Date(iso)
  if (isNaN(x)) return '-'
  return `${String(x.getDate()).padStart(2, '0')}.${String(x.getMonth() + 1).padStart(2, '0')}.${x.getFullYear()}`
}
export const ftime = (iso) => {
  const x = new Date(iso)
  return isNaN(x) ? '' : `${String(x.getHours()).padStart(2, '0')}:${String(x.getMinutes()).padStart(2, '0')}`
}
export const ago = (iso) => {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (m < 60) return `${m || 1} daqiqa oldin`
  if (m < 1440) return `${Math.round(m / 60)} soat oldin`
  return `${Math.round(m / 1440)} kun oldin`
}
export const dur = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
export const userName = (db, id) => db.users.find((u) => u.id === id)?.name || '-'
export const clientName = (db, id) => db.clients.find((c) => c.id === id)?.name || ''
export const toISODate = (iso) => (iso ? String(iso).slice(0, 10) : '')

// dominant vivid color of an image (data URL)
export function dominantColor(src) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const S = 64, cv = document.createElement('canvas')
      cv.width = cv.height = S
      const ctx = cv.getContext('2d')
      ctx.drawImage(img, 0, 0, S, S)
      const px = ctx.getImageData(0, 0, S, S).data
      const buckets = {}
      for (let i = 0; i < px.length; i += 4) {
        const [r, g, b, a] = [px[i], px[i + 1], px[i + 2], px[i + 3]]
        if (a < 200) continue
        const max = Math.max(r, g, b), min = Math.min(r, g, b)
        const sat = max === 0 ? 0 : (max - min) / max
        if (max < 40 || min > 225 || sat < 0.25) continue
        const key = `${r >> 5}-${g >> 5}-${b >> 5}`
        const e = (buckets[key] ||= { n: 0, r: 0, g: 0, b: 0 })
        e.n++; e.r += r; e.g += g; e.b += b
      }
      const top = Object.values(buckets).sort((x, y) => y.n - x.n)[0]
      if (!top) return resolve(null)
      const h = (v) => Math.round(v / top.n).toString(16).padStart(2, '0')
      resolve(`#${h(top.r)}${h(top.g)}${h(top.b)}`)
    }
    img.onerror = () => resolve(null)
    img.src = src
  })
}
