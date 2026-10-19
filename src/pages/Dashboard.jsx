import { Link, useNavigate } from 'react-router-dom'
import { Users, UserPlus, TrendingUp, Calendar, Plus, Map, Ticket, Wallet } from 'lucide-react'
import { useStore, ago, money, toUZS, userName } from '../store'
import { Stat, HexBadge } from '../components/ui'
import { useState } from 'react'
import { ClientForm } from './Clients'

export default function Dashboard() {
  const { db, add } = useStore()
  const nav = useNavigate()
  const [form, setForm] = useState(false)
  const me = db.users.find((u) => u.id === db.me)
  const now = Date.now()
  const cnt = (ms) => db.clients.filter((c) => now - new Date(c.created) < ms).length
  const st = (id) => db.statuses.find((s) => s.id === id)
  const sorted = [...db.statuses].sort((a, b) => a.order - b.order)
  const total = db.clients.length
  const recent = [...db.clients].sort((a, b) => new Date(b.created) - new Date(a.created)).slice(0, 4)
  const revenue = db.payments.filter((p) => p.status === "To'langan").reduce((s, p) => s + toUZS(p.amount, p.currency, db.settings.rate), 0)
  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Xayrli tong' : hour < 18 ? 'Xayrli kun' : 'Xayrli kech'

  return (
    <>
      <div className="card page-head" style={{ marginBottom: 20 }}>
        <div><h1 style={{ margin: 0 }}>{greet}, {me.name}!</h1><p className="muted">{db.settings.company} kompaniyasi uchun CRM paneli</p></div>
        <div className="actions">
          <button className="btn" onClick={() => nav('/clients')}><Users size={16} /> Mijozlarni ko'rish</button>
          <button className="btn primary" onClick={() => setForm(true)}><Plus size={16} /> Yangi mijoz</button>
        </div>
      </div>
      <div className="grid g4" style={{ marginBottom: 20 }}>
        <Stat label="Jami mijozlar" value={total} icon={Users} color="blue" />
        <Stat label="Yangi mijozlar" value={cnt(30 * 864e5)} icon={UserPlus} color="green" />
        <Stat label="Shu hafta yangi" value={cnt(7 * 864e5)} icon={TrendingUp} color="purple" />
        <Stat label="Bugun yangi" value={cnt(864e5)} icon={Calendar} color="orange" />
      </div>
      <div className="grid g4" style={{ marginBottom: 20 }}>
        <Stat label="Faol turlar" value={db.tours.length} icon={Map} color="cyan" />
        <Stat label="Buyurtmalar" value={db.bookings.length} icon={Ticket} color="purple" />
        <Stat label="Tushum (to'langan)" value={`${(revenue / 1e6).toFixed(1)} mln`} icon={Wallet} color="green" />
        <Stat label="Ochiq vazifalar" value={db.tasks.filter((t) => t.status !== 'Bajarildi').length} icon={Calendar} color="red" />
      </div>
      <div className="grid g2">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h3>Mijozlar bo'yicha statistika</h3><span className="muted">Jami mijozlar: {total}</span>
          </div>
          {sorted.map((s) => {
            const n = db.clients.filter((c) => c.status === s.id).length
            return (
              <div className="stat-row" key={s.id}>
                <span className="d" style={{ background: s.color }} /><span>{s.name}</span>
                <div className="progress"><i style={{ width: `${total ? (n / total) * 100 : 0}%`, background: s.color }} /></div>
                <span className="n">{n}</span>
              </div>
            )
          })}
        </div>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h3>So'nggi mijozlar</h3><Link to="/clients" className="muted">Barchasini ko'rish</Link>
          </div>
          {recent.map((c) => {
            const s = st(c.status)
            return (
              <div className="recent" key={c.id}>
                <div className="avatar soft">{c.name[0]}</div>
                <div className="info"><b>{c.name}</b><span>📞 {c.phone}</span><span>✉ {c.email}</span></div>
                <div className="right">{s && <HexBadge color={s.color}>{s.name}</HexBadge>}<div style={{ marginTop: 6 }}>{ago(c.created)}</div></div>
              </div>
            )
          })}
        </div>
      </div>
      {form && <ClientForm onClose={() => setForm(false)} onSave={(v) => add('clients', v)} />}
    </>
  )
}
