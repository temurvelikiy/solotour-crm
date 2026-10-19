import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useStore, ftime } from '../store'
import { PageHead } from '../components/ui'

const MONTHS = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr']
const DAYS = ['DU', 'SE', 'CH', 'PA', 'JU', 'SH', 'YA']
const FILTERS = [['meet', 'Uchrashuvlar'], ['task', 'Vazifalar'], ['rem', 'Eslatmalar'], ['tour', 'Turlar']]
const key = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export default function CalendarPage() {
  const { db } = useStore()
  const [cur, setCur] = useState(() => { const d = new Date(); d.setDate(1); return d })
  const [mode, setMode] = useState('Oy')
  const [on, setOn] = useState({ meet: true, task: true, rem: true, tour: true })
  const events = {}
  const push = (iso, type, label) => { if (!iso) return; const k = key(new Date(iso)); (events[k] ||= []).push({ type, label }) }
  if (on.meet) db.meetings.forEach((m) => push(m.at, 'meet', `${ftime(m.at)} ${m.title}`))
  if (on.task) db.tasks.forEach((t) => t.status !== 'Bajarildi' && push(t.due + 'T12:00', 'task', t.title))
  if (on.rem) db.reminders.forEach((r) => push(r.at, 'rem', `${ftime(r.at)} ${r.title}`))
  if (on.tour) db.tours.forEach((t) => push(t.start + 'T12:00', 'tour', `✈ ${t.name}`))

  const shift = (n) => setCur((c) => { const d = new Date(c); mode === 'Oy' ? d.setMonth(d.getMonth() + n) : d.setDate(d.getDate() + n * (mode === 'Hafta' ? 7 : 1)); return d })
  const start = new Date(cur.getFullYear(), cur.getMonth(), 1)
  let cells = []
  if (mode === 'Oy') {
    const off = (start.getDay() + 6) % 7
    const first = new Date(start); first.setDate(1 - off)
    const n = Math.ceil((off + new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate()) / 7) * 7
    cells = Array.from({ length: n }, (_, i) => { const d = new Date(first); d.setDate(first.getDate() + i); return d })
  } else if (mode === 'Hafta') {
    const first = new Date(cur); first.setDate(cur.getDate() - ((cur.getDay() + 6) % 7))
    cells = Array.from({ length: 7 }, (_, i) => { const d = new Date(first); d.setDate(first.getDate() + i); return d })
  } else cells = [new Date(cur)]
  const today = key(new Date())

  return (
    <>
      <PageHead title="Kalendar" sub="Barcha voqealarni kalendarda ko'ring" />
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="icon-btn" onClick={() => shift(-1)}><ChevronLeft /></button><button className="icon-btn" onClick={() => shift(1)}><ChevronRight /></button>
            <h2 style={{ margin: 0, fontSize: 20 }}>{MONTHS[cur.getMonth()]} {cur.getFullYear()}</h2>
          </div>
          <button className="btn" onClick={() => setCur(new Date())}>Bugun</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, flexWrap: 'wrap', gap: 10 }}>
          <div className="seg">{['Oy', 'Hafta', 'Kun'].map((m) => <button key={m} className={mode === m ? 'active' : ''} style={{ padding: '6px 14px' }} onClick={() => setMode(m)}>{m}</button>)}</div>
          <div className="legend">{FILTERS.map(([k, l]) => <button key={k} className={`chip ev ${k}`} style={{ opacity: on[k] ? 1 : .4, border: 0, padding: '5px 12px', fontSize: 13 }} onClick={() => setOn({ ...on, [k]: !on[k] })}>● {l}</button>)}</div>
        </div>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="cal" style={mode === 'Kun' ? { gridTemplateColumns: '1fr' } : undefined}>
          {mode !== 'Kun' && DAYS.map((d, i) => <div key={d} className="h" style={i > 4 ? { color: '#ef4444' } : undefined}>{d}</div>)}
          {cells.map((d) => { const k = key(d); const ev = events[k] || []; return (
            <div key={k} className={`cell ${mode === 'Oy' && d.getMonth() !== cur.getMonth() ? 'off' : ''}`} style={mode === 'Kun' ? { minHeight: 300 } : undefined}>
              <div className={`num ${k === today ? 'today' : ''}`}>{d.getDate()}</div><div style={{ clear: 'both' }} />
              {ev.slice(0, mode === 'Oy' ? 3 : 20).map((e, i) => <div key={i} className={`ev ${e.type}`} title={e.label}>{e.label}</div>)}
              {mode === 'Oy' && ev.length > 3 && <div className="muted">+{ev.length - 3} yana</div>}
            </div>) })}
        </div>
      </div>
    </>
  )
}
