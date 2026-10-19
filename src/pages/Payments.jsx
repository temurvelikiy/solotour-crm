import { useState } from 'react'
import { CreditCard, TrendingUp, Clock, AlertTriangle, Plus, Download, Pencil, Trash2 } from 'lucide-react'
import { useStore, fmt, fdate, money, toUZS, clientName } from '../store'
import { PageHead, Chips, FormModal, Badge, exportCSV, confirmDel, Empty } from '../components/ui'

const ST = ['Kutilmoqda', "To'langan", "Qisman to'langan", "Muddati o'tgan", 'Bekor qilingan']
const COL = { Kutilmoqda: 'yellow', "To'langan": 'green', "Qisman to'langan": 'blue', "Muddati o'tgan": 'red', 'Bekor qilingan': 'gray' }

export default function Payments() {
  const { db, add, update, remove } = useStore()
  const [f, setF] = useState('all')
  const [form, setForm] = useState(null)
  const r = db.settings.rate
  const P = db.payments
  const sum = (arr) => arr.reduce((s, p) => s + toUZS(Number(p.amount), p.currency, r), 0)
  const by = (st) => P.filter((p) => p.status === st)
  const collected = sum(by("To'langan")), pending = sum(by('Kutilmoqda')), overdue = sum(by("Muddati o'tgan"))
  const total = sum(P.filter((p) => p.status !== 'Bekor qilingan'))
  const list = P.filter((p) => f === 'all' || p.status === f)
  const bk = (id) => db.bookings.find((b) => b.id === id)
  const label = (p) => { const b = bk(p.bookingId); return b ? `${clientName(db, b.clientId)} · ${db.tours.find((t) => t.id === b.tourId)?.name || ''}` : '—' }

  const fields = [
    { key: 'bookingId', label: 'Buyurtma', type: 'select', full: true, options: [{ value: '', label: '— tanlanmagan —' }, ...db.bookings.map((b) => ({ value: b.id, label: `${clientName(db, b.clientId)} — ${db.tours.find((t) => t.id === b.tourId)?.name || ''}` }))] },
    { key: 'amount', label: 'Summa', type: 'number', required: true }, { key: 'currency', label: 'Valyuta', type: 'select', options: ['UZS', 'USD'] },
    { key: 'method', label: "To'lov usuli", type: 'select', options: ['Naqd', 'Karta', 'Bank', 'Payme', 'Click'] },
    { key: 'status', label: 'Status', type: 'select', options: ST }, { key: 'date', label: 'Sana', type: 'date' },
  ]
  return (
    <>
      <PageHead title="To'lovlar" sub="Kompaniya bo'yicha barcha to'lovlar statistikasi va muddati o'tgan to'lovlar">
        <button className="btn" onClick={() => exportCSV('tolovlar', P)}><Download size={16} /> Eksport</button>
        <button className="btn primary" onClick={() => setForm({})}><Plus size={16} /> Yangi to'lov</button>
      </PageHead>
      <div className="grid g4" style={{ marginBottom: 20 }}>
        {[[CreditCard, 'blue', "Jami to'lovlar", fmt(P.length) , `${fmt(total)} so'm`], [TrendingUp, 'green', "Yig'ilgan", money(collected), `${total ? Math.round((collected / total) * 100) : 0}% yig'ish darajasi`],
          [Clock, 'yellow', 'Kutilmoqda', money(pending), "To'lov kutilmoqda"], [AlertTriangle, 'red', "Muddati o'tgan", money(overdue), `${by("Muddati o'tgan").length} ta muddati o'tgan`]].map(([I, c, l, v, s]) => (
          <div className="card stat" style={{ justifyContent: 'flex-start' }} key={l}><div className={`ico s-${c}`}><I size={22} /></div>
            <div><div className="muted small">{l}</div><div style={{ fontSize: 20, fontWeight: 700 }}>{v}</div><div className="muted small">{s}</div></div></div>))}
      </div>
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center', fontWeight: 600, fontSize: 18 }}><CreditCard size={20} /> Barcha to'lovlar</div>
        <div style={{ padding: '0 20px 20px' }}>
          <Chips value={f} onChange={setF} items={[['all', 'Barchasi'], ...ST.map((s) => [s, s])]} />
          {!list.length ? <Empty icon={CreditCard} text="To'lovlar mavjud emas" /> : (
            <div className="table-wrap" style={{ marginTop: 14 }}><table>
              <thead><tr><th>Mijoz / Tur</th><th>Summa</th><th>Usul</th><th>Sana</th><th>Status</th><th /></tr></thead>
              <tbody>{list.map((p) => (
                <tr key={p.id}><td>{label(p)}</td><td><b>{fmt(p.amount)} {p.currency}</b></td><td>{p.method}</td><td>{fdate(p.date)}</td>
                  <td><Badge color={COL[p.status]}>{p.status}</Badge></td>
                  <td><button className="icon-btn" onClick={() => setForm(p)}><Pencil size={16} /></button><button className="icon-btn" onClick={() => confirmDel("To'lovni") && remove('payments', p.id)}><Trash2 size={16} /></button></td></tr>))}</tbody></table></div>)}
        </div>
      </div>
      {form && <FormModal title={form.id ? "To'lovni tahrirlash" : "Yangi to'lov"} fields={fields} initial={form.id ? form : { date: new Date().toISOString().slice(0, 10) }} onClose={() => setForm(null)}
        onSave={(v) => {
          form.id ? update('payments', form.id, v) : add('payments', v)
          // sync booking paid amount
          if (v.bookingId && v.status === "To'langan") { const b = bk(v.bookingId); if (b && !form.id) update('bookings', b.id, { paid: Number(b.paid) + (v.currency === b.currency ? Number(v.amount) : 0) }) }
        }} />}
    </>
  )
}
