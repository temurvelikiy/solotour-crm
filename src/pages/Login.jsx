import { useState } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { Check, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useStore } from '../store'

export default function Login() {
  const { auth, login, db, booting } = useStore()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [show, setShow] = useState(false)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  if (auth) return <Navigate to="/" replace />

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setErr('')
    const r = await login(email, pass)
    setBusy(false)
    r.error ? setErr(r.error) : nav('/')
  }
  const items = [
    ['Mijozlarni oson boshqaring', "Barcha mijoz ma'lumotlari bir joyda, tezkor qidiruv va filtrlar bilan"],
    ['Turlar va bronlash', 'Tur paketlari, buyurtmalar, viza va hamkorlar bir tizimda'],
    ['Telegram bot bilan integratsiya', "Telegram orqali tezkor mijoz qo'shish va ma'lumot olish"],
  ]
  return (
    <div className="login">
      <div className="login-left">
        <div className="logo" style={{ width: 56, height: 56, fontSize: 28 }}>{db.settings.logo ? <img src={db.settings.logo} alt="" /> : db.settings.company[0]}</div>
        <div style={{ fontSize: 18 }}>Turistik firmalar uchun CRM tizimi</div>
        <ul>{items.map(([t, d]) => (
          <li key={t}><Check size={18} style={{ background: '#ffffff33', borderRadius: '50%', padding: 3, flexShrink: 0 }} /><div><b>{t}</b>{d}</div></li>
        ))}</ul>
      </div>
      <div className="login-right">
        <form className="login-form" onSubmit={submit}>
          <h1>Tizimga kirish</h1>
          <div className="sub">Hisobingizga kiring va mijozlaringizni boshqaring</div>
          <div className="f"><label>Email manzili</label>
            <div style={{ position: 'relative' }}><Mail size={16} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--muted)' }} />
              <input style={{ paddingLeft: 38 }} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" required /></div></div>
          <div className="f"><label>Parol</label>
            <div style={{ position: 'relative' }}><Lock size={16} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--muted)' }} />
              <input style={{ paddingLeft: 38 }} type={show ? 'text' : 'password'} value={pass} onChange={(e) => setPass(e.target.value)} required />
              <button type="button" className="icon-btn" style={{ position: 'absolute', right: 6, top: 5 }} onClick={() => setShow(!show)}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', margin: 0 }}><input type="checkbox" /> Meni eslab qol</label>
            <Link to="/forgot" className="link">Parolni unutdingizmi?</Link>
          </div>
          {err && <div className="req" style={{ marginBottom: 12, textAlign: 'center' }}>{err}</div>}
          <button className="btn primary" disabled={busy || booting} style={{ width: '100%', justifyContent: 'center', padding: 12 }}>Kirish</button>
        </form>
      </div>
    </div>
  )
}
