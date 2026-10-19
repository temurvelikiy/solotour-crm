import { useState } from 'react'
import { Info, GripVertical, Pencil, Trash2, Plus, Filter, Trophy } from 'lucide-react'
import { useStore } from '../store'
import { PageHead, FormModal, confirmDel } from '../components/ui'

export default function Statuses() {
  const { db, add, update, remove, setCol } = useStore()
  const [form, setForm] = useState(null)
  const [drag, setDrag] = useState(null)
  const list = [...db.statuses].sort((a, b) => a.order - b.order)

  // ---- funnel numbers ----
  // A client sitting at stage N has passed through all earlier stages, so "reached" = clients at this stage or later.
  const counts = list.map((s) => db.clients.filter((c) => c.status === s.id).length)
  const reached = list.map((_, i) => counts.slice(i).reduce((a, b) => a + b, 0))
  const total = reached[0] || 0
  let saleIdx = list.findIndex((s) => s.sale)
  if (saleIdx < 0) saleIdx = list.findIndex((s) => s.id === 's5')
  const sales = saleIdx >= 0 ? reached[saleIdx] : null
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0)

  const fields = [
    { key: 'name', label: 'Status nomi', required: true, full: true },
    { key: 'color', label: 'Rang', type: 'color' },
    { key: 'sale', label: "Sotuv bosqichi (shu bosqichga yetgan mijoz — sotuv hisoblanadi)", type: 'checkbox', full: true },
  ]
  const drop = (target) => {
    if (!drag || drag === target) return
    const arr = list.filter((s) => s.id !== drag)
    arr.splice(arr.findIndex((s) => s.id === target), 0, list.find((s) => s.id === drag))
    setCol('statuses', arr.map((s, i) => ({ ...s, order: i + 1 })))
  }
  const del = (s) => {
    const used = db.clients.filter((c) => c.status === s.id).length
    if (used) return alert(`Bu statusda ${used} ta mijoz bor. Avval ularni boshqa statusga o'tkazing.`)
    confirmDel('Statusni') && remove('statuses', s.id)
  }
  const save = (v) => {
    if (v.sale) list.forEach((s) => s.sale && s.id !== form.id && update('statuses', s.id, { sale: false })) // only one sale stage
    form.id ? update('statuses', form.id, v) : add('statuses', { ...v, order: db.statuses.length + 1 })
  }

  return (
    <>
      <PageHead title="Sotuv voronkasi" sub="Statuslar sotuv bosqichlari sifatida: nechta lead keldi va nechtasi sotuvga yetdi">
        <button className="btn primary" onClick={() => setForm({})}><Plus size={16} /> Yangi status</button>
      </PageHead>

      <div className="grid g3" style={{ marginBottom: 20 }}>
        <div className="card stat"><div><div className="lbl">Kelgan leadlar</div><div className="val">{total}</div></div><div className="ico c-blue"><Filter size={22} /></div></div>
        <div className="card stat"><div><div className="lbl">Sotuvlar</div><div className="val">{sales ?? '—'}</div>{sales === null && <div className="sub">Sotuv bosqichini belgilang</div>}</div><div className="ico c-green"><Trophy size={22} /></div></div>
        <div className="card stat"><div><div className="lbl">Lead → sotuv konversiyasi</div><div className="val">{sales === null ? '—' : pct(sales, total) + '%'}</div></div><div className="ico c-purple"><Filter size={22} /></div></div>
      </div>

      <div className="card" style={{ padding: 0, marginBottom: 20 }}>
        <div style={{ padding: 22, borderBottom: '1px solid var(--border)', fontSize: 18, fontWeight: 600 }}>Voronka bosqichlari</div>
        <div className="funnel-head"><span /><span>Bosqichga yetganlar</span><span>Hozir shu bosqichda</span><span>Oldingi bosqichdan</span></div>
        {list.map((s, i) => {
          const w = total ? Math.max(34, (reached[i] / total) * 100) : 34
          const prev = i === 0 ? null : pct(reached[i], reached[i - 1])
          return (
            <div className="funnel-row" key={s.id}>
              <div className="funnel-bar-wrap">
                <div className="funnel-bar" style={{ width: w + '%', background: s.color }}>
                  <b>{s.name}</b><span>{reached[i]}</span>
                </div>
              </div>
              <div className="funnel-cell">
                <b>{reached[i]}</b>
                <span className="muted small">{pct(reached[i], total)}%</span>
              </div>
              <div className="funnel-cell"><b>{counts[i]}</b></div>
              <div className="funnel-cell">{prev === null ? <span className="muted">—</span> : <b style={{ color: prev >= 50 ? '#16a34a' : prev >= 25 ? '#ca8a04' : '#dc2626' }}>{prev}%</b>}</div>
              {i === saleIdx && <span className="sale-tag"><Trophy size={12} /> Sotuv</span>}
            </div>
          )
        })}
      </div>

      <div className="info-box"><b style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}><Info size={16} /> Status haqida ma'lumot</b>Status mijozlarning joriy holatini ko'rsatadi. Siz statuslarni qo'shish, tahrirlash va ularning tartibini o'zgartirishingiz mumkin.</div>
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '22px', borderBottom: '1px solid var(--border)', fontSize: 18, fontWeight: 600 }}>Mavjud statuslar</div>
        {list.map((s) => (
          <div className="status-row" key={s.id} draggable onDragStart={() => setDrag(s.id)} onDragOver={(e) => e.preventDefault()} onDrop={() => drop(s.id)}>
            <GripVertical size={18} color="var(--muted)" style={{ cursor: 'grab' }} />
            <span className="dotc" style={{ background: s.color }} />
            <div style={{ flex: 1 }}><b>{s.name}</b> {s.id === list[saleIdx]?.id && <span className="badge s-green"><Trophy size={11} /> Sotuv</span>}<div className="muted small">Tartib: {s.order}</div></div>
            <span className="hexchip" style={{ background: s.color + '22', color: s.color }}>{s.color.toUpperCase()}</span>
            <button className="icon-btn" onClick={() => setForm(s)}><Pencil size={17} /></button>
            <button className="icon-btn" onClick={() => del(s)}><Trash2 size={17} /></button>
          </div>))}
      </div>
      {form && <FormModal title={form.id ? 'Statusni tahrirlash' : 'Yangi status'} fields={fields} initial={form.id ? form : { color: '#3B82F6' }} onClose={() => setForm(null)} onSave={save} />}
    </>
  )
}
