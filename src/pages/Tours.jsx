import { useState } from 'react'
import { Map, Plus, Calendar, Hotel, Plane, Utensils, Moon, Pencil, Trash2, Download } from 'lucide-react'
import { useStore, fdate, fmt, money } from '../store'
import { PageHead, SearchInput, FormModal, confirmDel, exportCSV, Empty } from '../components/ui'

export default function Tours() {
  const { db, add, update, remove } = useStore()
  const [q, setQ] = useState('')
  const [form, setForm] = useState(null)
  const list = db.tours.filter((t) => !q || (t.name + t.country).toLowerCase().includes(q.toLowerCase()))
  const booked = (t) => db.bookings.filter((b) => b.tourId === t.id && b.status !== 'Bekor qilingan').reduce((s, b) => s + Number(b.people), 0)
  const fields = [
    { key: 'name', label: 'Tur nomi', required: true, full: true }, { key: 'country', label: 'Davlat / yo\'nalish', required: true },
    { key: 'nights', label: 'Kechalar soni', type: 'number', default: 5 }, { key: 'price', label: '1 kishi uchun narx', type: 'number', required: true },
    { key: 'currency', label: 'Valyuta', type: 'select', options: ['USD', 'UZS'] }, { key: 'capacity', label: 'Joylar soni', type: 'number', default: 20 },
    { key: 'start', label: 'Boshlanish sanasi', type: 'date' }, { key: 'transport', label: 'Transport' }, { key: 'hotel', label: 'Mehmonxona' },
    { key: 'meal', label: 'Ovqatlanish' }, { key: 'description', label: 'Tavsif', type: 'textarea' },
  ]
  return (
    <>
      <PageHead title="Turlar katalogi" sub="Barcha tur paketlar: narx, sana va bo'sh joylar">
        <button className="btn" onClick={() => exportCSV('turlar', db.tours)}><Download size={16} /> Eksport</button>
        <button className="btn primary" onClick={() => setForm({})}><Plus size={16} /> Yangi tur</button>
      </PageHead>
      <div className="card toolbar" style={{ marginBottom: 20 }}><SearchInput value={q} onChange={setQ} placeholder="Tur yoki davlat bo'yicha qidirish..." /></div>
      {!list.length && <Empty icon={Map} text="Turlar topilmadi" />}
      <div className="grid g3">{list.map((t) => { const b = booked(t), left = t.capacity - b, pct = Math.min(100, (b / t.capacity) * 100); return (
        <div className="card" key={t.id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 12 }}><div className="ico-sq s-cyan"><Map size={20} /></div>
            <div style={{ flex: 1 }}><b style={{ fontSize: 16 }}>{t.name}</b><div className="muted small">{t.country} · <Moon size={11} /> {t.nights} kecha</div></div>
            <button className="icon-btn" onClick={() => setForm(t)}><Pencil size={16} /></button><button className="icon-btn" onClick={() => confirmDel('Turni') && remove('tours', t.id)}><Trash2 size={16} /></button></div>
          <div className="muted" style={{ minHeight: 38 }}>{t.description}</div>
          <div className="meta" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', color: 'var(--muted)', fontSize: 13 }}>
            <span><Calendar size={13} /> {fdate(t.start)}</span><span><Plane size={13} /> {t.transport}</span><span><Hotel size={13} /> {t.hotel}</span><span><Utensils size={13} /> {t.meal}</span></div>
          <div><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}><span>Band: {b}/{t.capacity}</span><span style={{ color: left <= 3 ? '#dc2626' : '#16a34a' }}>{left > 0 ? `${left} joy bor` : "Joy yo'q"}</span></div>
            <div className="progress"><i style={{ width: pct + '%', background: pct > 85 ? '#ef4444' : '#06b6d4' }} /></div></div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, fontWeight: 700, fontSize: 17 }}>{money(t.price, t.currency)} <span className="muted small" style={{ fontWeight: 400 }}>/ kishi</span></div>
        </div>) })}</div>
      {form && <FormModal wide title={form.id ? 'Turni tahrirlash' : 'Yangi tur'} fields={fields} initial={form.id ? form : { currency: 'USD', start: new Date().toISOString().slice(0, 10) }} onClose={() => setForm(null)}
        onSave={(v) => { form.id ? update('tours', form.id, v) : add('tours', { booked: 0, ...v }) }} />}
    </>
  )
}
