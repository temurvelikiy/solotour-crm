import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'
import { api } from '../store'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setErr('')
    try { await api('POST', '/auth/forgot', { email }); setSent(true) } catch (x) { setErr(x.message) }
    setBusy(false)
  }
  return (
    <div className="login-right" style={{ minHeight: '100vh' }}>
      <form className="login-form" onSubmit={submit}>
        <h1>Parolni tiklash</h1>
        <div className="sub">Hisobingizga ulangan email manzilni kiriting. Parolni tiklash havolasi shu manzilga yuboriladi.</div>
        {sent ? (
          <div className="info-box">Agar bu email tizimda mavjud bo'lsa, parolni tiklash havolasi yuborildi. Xatni (va spam papkasini) tekshiring. Havola 1 soat amal qiladi.</div>
        ) : (
          <>
            <div className="f"><label>Email manzili</label>
              <div style={{ position: 'relative' }}><Mail size={16} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--muted)' }} />
                <input style={{ paddingLeft: 38 }} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" required autoFocus /></div></div>
            {err && <div className="req" style={{ marginBottom: 12, textAlign: 'center' }}>{err}</div>}
            <button className="btn primary" disabled={busy} style={{ width: '100%', justifyContent: 'center', padding: 12 }}>Havola yuborish</button>
          </>
        )}
        <p style={{ textAlign: 'center', marginTop: 22 }}><Link to="/login" className="link" style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><ArrowLeft size={14} /> Kirish sahifasiga qaytish</Link></p>
      </form>
    </div>
  )
}
