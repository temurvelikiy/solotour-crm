import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { api } from '../store'

export default function ResetPassword() {
  const [sp] = useSearchParams()
  const token = sp.get('token') || ''
  const nav = useNavigate()
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [err, setErr] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (pw !== pw2) return setErr('Parollar mos kelmadi')
    setBusy(true); setErr('')
    try { await api('POST', '/auth/reset', { token, password: pw }); setDone(true); setTimeout(() => nav('/login'), 2500) } catch (x) { setErr(x.message) }
    setBusy(false)
  }
  return (
    <div className="login-right" style={{ minHeight: '100vh' }}>
      <form className="login-form" onSubmit={submit}>
        <h1>Yangi parol</h1>
        <div className="sub">Hisobingiz uchun yangi parol o'rnating.</div>
        {!token ? (
          <div className="req" style={{ textAlign: 'center' }}>Havola yaroqsiz. Parolni qaytadan tiklashni so'rang.</div>
        ) : done ? (
          <div className="info-box">Parol o'zgartirildi. Kirish sahifasiga o'tilmoqda...</div>
        ) : (
          <>
            {[['Yangi parol', pw, setPw], ['Parolni tasdiqlang', pw2, setPw2]].map(([l, v, set]) => (
              <div className="f" key={l}><label>{l}</label>
                <div style={{ position: 'relative' }}><Lock size={16} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--muted)' }} />
                  <input style={{ paddingLeft: 38 }} type="password" value={v} onChange={(e) => set(e.target.value)} minLength={6} required /></div></div>
            ))}
            {err && <div className="req" style={{ marginBottom: 12, textAlign: 'center' }}>{err}</div>}
            <button className="btn primary" disabled={busy} style={{ width: '100%', justifyContent: 'center', padding: 12 }}>Parolni saqlash</button>
          </>
        )}
        <p style={{ textAlign: 'center', marginTop: 22 }}><Link to="/login" className="link">Kirish sahifasiga qaytish</Link></p>
      </form>
    </div>
  )
}
