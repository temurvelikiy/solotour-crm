import { Users, Handshake, TrendingUp, Wallet } from 'lucide-react'
import { useStore, fmt, money, toUZS } from '../store'
import { PageHead, Stat } from '../components/ui'

export default function Analytics() {
  const { db } = useStore()
  const r = db.settings.rate
  const months = Array.from({ length: 6 }, (_, i) => { const d = new Date(); d.setMonth(d.getMonth() - 5 + i); return { k: `${d.getFullYear()}-${d.getMonth()}`, l: d.toLocaleString('uz', { month: 'short' }) } })
  const monthly = months.map((m) => ({ ...m, n: db.clients.filter((c) => { const d = new Date(c.created); return `${d.getFullYear()}-${d.getMonth()}` === m.k }).length }))
  const maxN = Math.max(1, ...monthly.map((m) => m.n))
  const srcs = Object.entries(db.clients.reduce((a, c) => ((a[c.source || 'Boshqa'] = (a[c.source || 'Boshqa'] || 0) + 1), a), {}))
  const won = db.deals.filter((d) => d.stage === 'Yutildi')
  const revenue = db.payments.filter((p) => p.status === "To'langan").reduce((s, p) => s + toUZS(p.amount, p.currency, r), 0)
  const mgr = db.users.map((u) => ({ n: u.name, v: db.deals.filter((d) => d.owner === u.id && d.stage === 'Yutildi').reduce((s, d) => s + toUZS(d.amount, d.currency, r), 0) })).filter((x) => x.v > 0)
  const maxM = Math.max(1, ...mgr.map((m) => m.v))
  const topTours = db.tours.map((t) => ({ n: t.name, v: db.bookings.filter((b) => b.tourId === t.id).reduce((s, b) => s + Number(b.people), 0) })).sort((a, b) => b.v - a.v).slice(0, 5)
  const maxT = Math.max(1, ...topTours.map((t) => t.v))
  const bar = (v, max, color = 'var(--primary)') => <div className="progress"><i style={{ width: `${(v / max) * 100}%`, background: color }} /></div>

  return (
    <>
      <PageHead title="Analitika" sub="Biznes ko'rsatkichlari va hisobotlar" />
      <div className="grid g4" style={{ marginBottom: 20 }}>
        <Stat label="Mijozlar" value={db.clients.length} icon={Users} color="blue" />
        <Stat label="Yutilgan bitimlar" value={won.length} icon={Handshake} color="green" />
        <Stat label="Konversiya (lid → mijoz)" value={`${db.leads.length ? Math.round((db.leads.filter((l) => l.status === 'Konvertatsiya').length / db.leads.length) * 100) : 0}%`} icon={TrendingUp} color="purple" />
        <Stat label="Tushum" value={money(revenue)} icon={Wallet} color="orange" />
      </div>
      <div className="grid g2" style={{ marginBottom: 16 }}>
        <div className="card"><h3>Oylik yangi mijozlar</h3>
          <div className="bars">{monthly.map((m) => <div className="b" key={m.k}><em>{m.n}</em><i style={{ height: `${(m.n / maxN) * 80}%` }} /><span>{m.l}</span></div>)}</div></div>
        <div className="card"><h3>Mijozlar manbasi</h3>
          {srcs.map(([k, v]) => <div className="stat-row" style={{ gridTemplateColumns: '110px 1fr 30px' }} key={k}><span>{k}</span>{bar(v, db.clients.length, '#8b5cf6')}<span className="n">{v}</span></div>)}</div>
      </div>
      <div className="grid g2">
        <div className="card"><h3>Menejerlar bo'yicha savdo (yutilgan)</h3>
          {mgr.length ? mgr.map((m) => <div key={m.n} style={{ marginBottom: 14 }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{m.n}</span><b>{fmt(m.v)} so'm</b></div>{bar(m.v, maxM, '#10b981')}</div>) : <div className="muted">Ma'lumot yo'q</div>}</div>
        <div className="card"><h3>Eng mashhur turlar (yo'lovchilar)</h3>
          {topTours.map((t) => <div key={t.n} style={{ marginBottom: 14 }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t.n}</span><b>{t.v}</b></div>{bar(t.v, maxT, '#06b6d4')}</div>)}</div>
      </div>
    </>
  )
}
