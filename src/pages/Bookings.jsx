import { useState } from 'react'
import { Ticket, Plus, Pencil, Trash2, Download } from 'lucide-react'
import { useStore, fdate, fmt, money, toUZS, clientName, userName } from '../store'
import { PageHead, Chips, SearchInput, FormModal, Badge, confirmDel, exportCSV, Empty } from '../components/ui'

const ST = ['Kutilmoqda', 'Tasdiqlangan', "To'langan", 'Bekor qilingan']
const COL = { Kutilmoqda: 'yellow', Tasdiqlangan: 'blue', "To'langan": 'green', 'Bekor qilingan': 'gray' }

export default function Bookings() {
  const { db, add, update, remove } = useStore()
  const [q, setQ] = useState('')
  const [st, setSt] = useState('all')
  const [form, setForm] = useState(null)
  const tour = (id) => db.tours.find((t) => t.id === id)
  const list = db.bookings.filter((b) => (st === 'all' || b.status === st) && (!q || (clientName(db, b.clientId) + (tour(b.tourId)?.name || '')).toLowerCase().includes(q.toLowerCase())))
  const r = db.settings.rate
  const act = db.bookings.filter((b) => b.status !== 'Bekor qilingan')
  const total = act.reduce((s, b) => s + toUZS(b.total, b.currency, r), 0)
  const paid = act.reduce((s, b) => s + toUZS(b.paid, b.currency, r), 0)

  const fields = [
    { key: 'clientId', label: 'Mijoz', type: 'select', required: true, options: [{ value: '', label: '— tanlang —' }, ...db.clients.map((c) => ({ value: c.id, label: c.name }))] },
    { key: 'tourId', label: 'Tur', type: 'select', required: true, options: [{ value: '', label: '— tanlang —' }, ...db.tours.map((t) => ({ value: t.id, label: t.name }))] },
    { key: 'people', label: 'Kishilar soni', type: 'number', default: 1 }, { key: 'total', label: 'Umumiy summa', type: 'number', help: 'bo\'sh qoldirilsa avtomatik hisoblanadi' },
    { key: 'currency', label: 'Valyuta', type: 'select', options: ['USD', 'UZS'] }, { key: 'paid', label: "To'langan summa", type: 'number', default: 0 },
    { key: 'status', label: 'Status', type: 'select', options: ST }, { key: 'manager', label: 'Menejer', type: 'select', options: db.users.map((u) => ({ value: u.id, label: u.name })) },
    { key: 'date', label: 'Sana', type: 'date' },
  ]
  const save = (v) => {
    const t = tour(v.tourId)
    const data = { ...v, currency: v.total === '' && t ? t.currency : v.currency, total: v.total === '' && t ? t.price * v.people : v.total }
    form.id ? update('bookings', form.id, data) : add('bookings', data)
  }
  return (
    <>
      <PageHead title="Buyurtmalar" sub="Mijozlarga turlarni bronlash va to'lov holati">
        <button className="btn" onClick={() => exportCSV('buyurtmalar', db.bookings.map((b) => ({ ...b, mijoz: clientName(db, b.clientId), tur: tour(b.tourId)?.name })))}><Download size={16} /> Eksport</button>
        <button className="btn primary" onClick={() => setForm({})}><Plus size={16} /> Yangi buyurtma</button>
      </PageHead>
      <div className="grid g4" style={{ marginBottom: 20 }}>
        <div className="card"><div className="muted">Buyurtmalar</div><div style={{ fontSize: 26, fontWeight: 700 }}>{act.length}</div></div>
        <div className="card"><div className="muted">Jami summa</div><div style={{ fontSize: 20, fontWeight: 700 }}>{money(total)}</div></div>
        <div className="card"><div className="muted">To'langan</div><div style={{ fontSize: 20, fontWeight: 700, color: '#16a34a' }}>{money(paid)}</div></div>
        <div className="card"><div className="muted">Qarz</div><div style={{ fontSize: 20, fontWeight: 700, color: '#dc2626' }}>{money(total - paid)}</div></div>
      </div>
      <div className="card"><div className="toolbar"><SearchInput value={q} onChange={setQ} placeholder="Mijoz yoki tur bo'yicha qidirish..." /></div>
        <Chips value={st} onChange={setSt} items={[['all', 'Barchasi'], ...ST.map((s) => [s, s])]} /></div>
      <div style={{ height: 16 }} />
      {!list.length ? <Empty icon={Ticket} text="Buyurtmalar topilmadi" /> : (
        <div className="card table-wrap" style={{ padding: 0 }}><table>
          <thead><tr><th>Mijoz</th><th>Tur</th><th>Kishi</th><th>Summa</th><th>To'langan</th><th>Qarz</th><th>Status</th><th>Sana</th><th /></tr></thead>
          <tbody>{list.map((b) => (
            <tr key={b.id}><td><b>{clientName(db, b.clientId)}</b><div className="muted small">{userName(db, b.manager)}</div></td><td>{tour(b.tourId)?.name}</td><td>{b.people}</td>
              <td>{money(b.total, b.currency)}</td><td style={{ color: '#16a34a' }}>{money(b.paid, b.currency)}</td><td style={{ color: b.total - b.paid > 0 ? '#dc2626' : undefined }}>{money(b.total - b.paid, b.currency)}</td>
              <td><Badge color={COL[b.status]}>{b.status}</Badge></td><td>{fdate(b.date)}</td>
              <td><button className="icon-btn" onClick={() => setForm(b)}><Pencil size={16} /></button><button className="icon-btn" onClick={() => confirmDel('Buyurtmani') && remove('bookings', b.id)}><Trash2 size={16} /></button></td></tr>))}</tbody></table></div>)}
      {form && <FormModal wide title={form.id ? 'Buyurtmani tahrirlash' : 'Yangi buyurtma'} fields={fields} initial={form.id ? form : { status: 'Kutilmoqda', manager: db.me, date: new Date().toISOString().slice(0, 10), currency: 'USD', total: '' }} onClose={() => setForm(null)} onSave={save} />}
    </>
  )
}
