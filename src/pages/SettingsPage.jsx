import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { User, Building2, Workflow, Palette, Save, Send, Upload, CreditCard } from 'lucide-react'
import { useEffect } from 'react'
import { useStore, dominantColor, fmt, fdate } from '../store'
import { PRICE_PER_USER, isFree, monthlyTotal, PAY_WITHIN_HOURS, tgHandle, PLANS, planTotal } from '../billing'
import { PageHead } from '../components/ui'
import UserFlow from '../components/UserFlow'

const TABS = [['profile', 'Profil', User], ['company', 'Kompaniya', Building2], ['billing', "Tarif va to'lov", CreditCard], ['integrations', 'Integratsiyalar', Workflow], ['view', "Ko'rinish", Palette]]

export default function SettingsPage() {
  const { db, update, setSettings, changePassword } = useStore()
  const [sp, setSp] = useSearchParams()
  const tab = sp.get('tab') || 'profile'
  const me = db.users.find((u) => u.id === db.me)
  const [p, setP] = useState({ name: me.name, email: me.email })
  const [c, setC] = useState({ company: db.settings.company, phone: db.settings.phone, email: db.settings.email, address: db.settings.address, rate: db.settings.rate })
  const [tg, setTg] = useState(db.settings.telegramToken)
  const [userForm, setUserForm] = useState(null)
  const [payTg, setPayTg] = useState(db.settings.paymentTelegram || '')
  const [pw, setPw] = useState({ a: '', b: '', c: '' })
  const [msg, setMsg] = useState('')
  const [logoColor, setLogoColor] = useState(null)
  useEffect(() => { db.settings.logo ? dominantColor(db.settings.logo).then(setLogoColor) : setLogoColor(null) }, [db.settings.logo])
  const uploadLogo = (file) => {
    if (!file) return
    const rd = new FileReader()
    rd.onload = async () => {
      const color = await dominantColor(rd.result)
      setSettings({ logo: rd.result, ...(color ? { colorMode: 'logo', brand: color } : {}) })
    }
    rd.readAsDataURL(file)
  }
  const ok = (t) => { setMsg(t); setTimeout(() => setMsg(''), 2000) }

  return (
    <>
      <PageHead title="Sozlamalar" sub="Hisobingiz va kompaniya sozlamalarini boshqaring" />
      <div className="settings">
        <div className="tabs-v">{TABS.map(([k, l, I]) => <button key={k} className={tab === k ? 'active' : ''} onClick={() => setSp({ tab: k })}><I size={18} />{l}</button>)}</div>
        <div className="card">
          {tab === 'profile' && <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}><h3 style={{ margin: 0 }}>Profil ma'lumotlari</h3>
              <button className="btn primary" onClick={() => { update('users', me.id, p); ok('Saqlandi') }}><Save size={16} /> Saqlash</button></div>
            <div className="form-grid"><div><label>To'liq ism</label><input value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} /></div>
              <div><label>Email</label><input value={p.email} onChange={(e) => setP({ ...p, email: e.target.value })} /></div></div>
            <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: '28px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}><h3 style={{ margin: 0 }}>Parolni o'zgartirish</h3>
              <button className="btn" disabled={!pw.a || !pw.b || pw.b !== pw.c} onClick={async () => { const r = await changePassword(pw.a, pw.b); if (r.error) return window.alert(r.error); setPw({ a: '', b: '', c: '' }); ok("Parol o'zgartirildi") }}>Parolni o'zgartirish</button></div>
            <div className="form-grid">{[['a', 'Joriy parol'], ['b', 'Yangi parol'], ['c', 'Parolni tasdiqlang']].map(([k, l]) => <div key={k}><label>{l}</label><input type="password" value={pw[k]} onChange={(e) => setPw({ ...pw, [k]: e.target.value })} /></div>)}</div>
          </>}
          {tab === 'company' && <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}><h3 style={{ margin: 0 }}>Kompaniya ma'lumotlari</h3>
              <button className="btn primary" onClick={() => { setSettings({ ...c, rate: Number(c.rate) || 12700 }); ok('Saqlandi') }}><Save size={16} /> Saqlash</button></div>
            <div className="form-grid">
              <div><label>Kompaniya nomi</label><input value={c.company} onChange={(e) => setC({ ...c, company: e.target.value })} /></div>
              <div><label>Telefon</label><input value={c.phone} onChange={(e) => setC({ ...c, phone: e.target.value })} /></div>
              <div><label>Email</label><input value={c.email} onChange={(e) => setC({ ...c, email: e.target.value })} /></div>
              <div><label>Manzil</label><input value={c.address} onChange={(e) => setC({ ...c, address: e.target.value })} /></div>
              <div><label>USD kursi (so'm)</label><input type="number" value={c.rate} onChange={(e) => setC({ ...c, rate: e.target.value })} /></div>
            </div></>}
          {tab === 'billing' && <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Tarif va to'lov</h3>
              <button className="btn primary" onClick={() => setUserForm({})}>+ Foydalanuvchi qo'shish</button>
            </div>
            <div className="grid g3" style={{ marginBottom: 20 }}>
              <div className="card"><div className="muted small">Narx</div><div style={{ fontSize: 22, fontWeight: 700 }}>{fmt(PRICE_PER_USER)} so'm</div><div className="muted small">1 foydalanuvchi uchun, oyiga</div></div>
              <div className="card"><div className="muted small">Pullik foydalanuvchilar</div><div style={{ fontSize: 22, fontWeight: 700 }}>{db.users.filter((u) => !isFree(u.role)).length}</div><div className="muted small">Admin hisobi bepul</div></div>
              <div className="card" style={{ background: 'var(--primary-soft)' }}><div className="muted small">Oylik to'lov</div><div style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)' }}>{fmt(monthlyTotal(db.users))} so'm</div><div className="muted small">hozirgi foydalanuvchilar bo'yicha</div></div>
            </div>
            <h4 style={{ margin: '0 0 10px' }}>To'lov muddati bo'yicha narx</h4>
            <div className="grid g4" style={{ marginBottom: 24 }}>
              {PLANS.map((pl) => {
                const bonus = pl.months - pl.pay
                const label = pl.months === 12 ? '1 yillik' : `${pl.months} oylik`
                return (
                  <div className="card" key={pl.months} style={bonus ? { borderColor: '#16a34a', background: 'color-mix(in srgb,#16a34a 7%,var(--card))' } : undefined}>
                    <div style={{ fontWeight: 600, marginBottom: 6, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>{label}{bonus > 0 && <span className="badge s-green">{bonus} oy bonus</span>}</div>
                    <div style={{ fontSize: 22, fontWeight: 700 }}>{fmt(planTotal(db.users, pl))} so'm</div>
                    {bonus > 0 && <div className="small" style={{ color: '#16a34a', marginTop: 2 }}>{pl.pay} oylik to'lov — {pl.months} oy foydalanasiz</div>}
                    {bonus > 0 && <div className="muted small"><s>{fmt(monthlyTotal(db.users) * pl.months)} so'm</s> · tejaysiz: {fmt(monthlyTotal(db.users) * bonus)} so'm</div>}
                    <div className="muted small" style={{ marginTop: 6 }}>barcha pullik foydalanuvchilar uchun</div>
                    <div className="muted small">1 foydalanuvchi: {fmt(PRICE_PER_USER * pl.pay)} so'm</div>
                  </div>)
              })}
            </div>
            <div className="table-wrap"><table>
              <thead><tr><th>Foydalanuvchi</th><th>Rol</th><th>Qo'shilgan sana</th><th style={{ textAlign: 'right' }}>Oyiga</th></tr></thead>
              <tbody>{db.users.map((u) => (
                <tr key={u.id}><td><b>{u.name}</b><div className="muted small">{u.email}</div></td><td>{u.role}</td><td>{fdate(u.created)}</td>
                  <td style={{ textAlign: 'right' }}>{isFree(u.role) ? <span className="badge s-green">Bepul</span> : <b>{fmt(PRICE_PER_USER)} so'm</b>}</td></tr>))}
                <tr><td colSpan={3} style={{ textAlign: 'right' }}><b>Jami:</b></td><td style={{ textAlign: 'right' }}><b>{fmt(monthlyTotal(db.users))} so'm</b></td></tr>
              </tbody></table></div>
            <div style={{ marginTop: 20, maxWidth: 420 }}>
              <label>To'lov uchun Telegram</label>
              <div style={{ display: 'flex', gap: 10 }}>
                <input value={payTg} onChange={(e) => setPayTg(e.target.value)} placeholder="@username" />
                <button className="btn primary" onClick={() => { setSettings({ paymentTelegram: tgHandle(payTg) }); setPayTg(tgHandle(payTg)); ok('Saqlandi') }}><Save size={16} /> Saqlash</button>
              </div>
              <div className="muted small" style={{ marginTop: 6 }}>Yangi foydalanuvchi qo'shilganda to'lov uchun shu Telegram'ga yo'naltiriladi ({PAY_WITHIN_HOURS} soat ichida to'lash so'raladi).</div>
            </div>
            <p className="muted small" style={{ marginTop: 14 }}>Hisob foydalanuvchilar soniga qarab avtomatik hisoblanadi: yangi foydalanuvchi qo'shsangiz yoki o'chirsangiz, oylik to'lov o'zgaradi. Admin uchun to'lov yo'q.</p>
            <UserFlow form={userForm} onClose={() => setUserForm(null)} />
          </>}
          {tab === 'integrations' && <>
            <h3 style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Send size={20} /> Telegram bot</h3>
            <p className="muted">Bot orqali lidlarni qabul qilish va CRM'ni Telegramdan boshqarish. (Hozircha faqat sozlamalar sahifasi — haqiqiy ulanish keyingi bosqichda backend bilan qo'shiladi.)</p>
            <label>Bot token</label><input value={tg} onChange={(e) => setTg(e.target.value)} placeholder="123456:ABC-DEF..." />
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '14px 0' }}><input type="checkbox" checked={db.settings.telegramOn} onChange={(e) => setSettings({ telegramOn: e.target.checked })} /> Botni yoqish</label>
            <button className="btn primary" onClick={() => { setSettings({ telegramToken: tg }); ok('Saqlandi') }}><Save size={16} /> Saqlash</button></>}
          {tab === 'view' && <>
            <h3>Ko'rinish</h3>
            <label>Kompaniya logotipi</label>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
              <div className="logo" style={{ width: 64, height: 64, fontSize: 28 }}>{db.settings.logo ? <img src={db.settings.logo} alt="" /> : db.settings.company[0]}</div>
              <label className="btn" style={{ margin: 0, cursor: 'pointer' }}><Upload size={16} /> Logotip yuklash
                <input type="file" accept="image/*" hidden onChange={(e) => uploadLogo(e.target.files[0])} /></label>
              {db.settings.logo && <button className="btn danger" onClick={() => setSettings({ logo: '', colorMode: 'default' })}>Olib tashlash</button>}
            </div>
            {db.settings.logo && <>
              <label>Rang tanlovi</label>
              <div style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
                <button className={`opt ${db.settings.colorMode === 'logo' ? 'sel' : ''}`} disabled={!logoColor} onClick={() => setSettings({ colorMode: 'logo', brand: logoColor })}>
                  <span className="swatch" style={{ background: logoColor || '#ccc' }} />
                  <span><b>Logotip rangida</b><div className="muted small">Tizim rangi logotipdan avtomatik olinadi{logoColor ? ` (${logoColor.toUpperCase()})` : ' — rang aniqlanmadi'}</div></span>
                </button>
                <button className={`opt ${db.settings.colorMode === 'default' ? 'sel' : ''}`} onClick={() => setSettings({ colorMode: 'default' })}>
                  <span className="swatch" style={{ background: 'linear-gradient(135deg,#fff 50%,#0f172a 50%)' }} />
                  <span><b>Oddiy oq-qora</b><div className="muted small">Standart ko'k rang va oq/qora mavzu</div></span>
                </button>
              </div>
              {db.settings.colorMode === 'logo' && <div style={{ marginBottom: 24 }}><label>Rangni qo'lda sozlash</label>
                <input type="color" style={{ width: 80, height: 40, padding: 2 }} value={db.settings.brand} onChange={(e) => setSettings({ brand: e.target.value })} /></div>}
            </>}
            <label>Mavzu</label>
            <div className="seg" style={{ marginBottom: 24 }}>{[['light', 'Yorug\''], ['dark', "Qorong'u"]].map(([k, l]) => <button key={k} className={db.settings.theme === k ? 'active' : ''} style={{ padding: '8px 18px' }} onClick={() => setSettings({ theme: k })}>{l}</button>)}</div></>}
          {msg && <div className="toast">{msg}</div>}
        </div>
      </div>
    </>
  )
}
