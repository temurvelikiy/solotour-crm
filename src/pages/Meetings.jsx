import { useState } from 'react'
import { Calendar, CalendarClock, CalendarCheck, CheckCircle2, Download, Plus, Clock, MapPin, Users, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useStore, fdate, ftime } from '../store'
import { PageHead, SearchInput, Chips, FormModal, Badge, exportCSV, confirmDel, Empty } from '../components/ui'

const ST = ['Rejalashtirilgan', 'Jarayonda', 'Yakunlangan', 'Bekor qilingan']
const KINDS = ['Yuzma-yuz', 'Onlayn', 'Telefon']
const toLocal = (iso) => { const d = new Date(iso); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16) }

export default function Meetings() {
  const { db, add, update, remove } = useStore()
  const [q, setQ] = useState('')
  const [kind, setKind] = useState('')
  const [st, setSt] = useState('all')
  const [form, setForm] = useState(null)
  const [menu, setMenu] = useState(null)
  const M = db.meetings
  const today = new Date().toDateString()
  const list = M.filter((m) => (!q || m.title.toLowerCase().includes(q.toLowerCase())) && (!kind || m.kind === kind) && (st === 'all' || m.status === st)).sort((a, b) => new Date(b.at) - new Date(a.at))
  const fields = [
    { key: 'title', label: 'Mavzu', required: true, full: true }, { key: 'at', label: 'Boshlanish', type: 'datetime' }, { key: 'end', label: 'Tugash vaqti', type: 'time' },
    { key: 'kind', label: 'Turi', type: 'select', options: KINDS }, { key: 'status', label: 'Status', type: 'select', options: ST },
    { key: 'place', label: 'Joy / havola' }, { key: 'people', label: "Ishtirokchilar" }, { key: 'result', label: 'Natija', type: 'textarea' },
  ]
  return (
    <>
      <PageHead title="Uchrashuvlar" sub="Barcha uchrashuvlarni rejalashtiring va kuzating">
        <button className="btn" onClick={() => exportCSV('uchrashuvlar', M)}><Download size={16} /> Eksport</button>
        <button className="btn primary" onClick={() => setForm({})}><Plus size={16} /> Yangi uchrashuv</button>
      </PageHead>
      <div className="grid g4" style={{ marginBottom: 20 }}>
        {[[Calendar, 'blue', M.length, 'Jami'], [CalendarClock, 'yellow', M.filter((m) => m.status === 'Rejalashtirilgan').length, 'Rejalashtirilgan'], [CalendarCheck, 'purple', M.filter((m) => new Date(m.at).toDateString() === today).length, 'Bugun'], [CheckCircle2, 'green', M.filter((m) => m.status === 'Yakunlangan').length, 'Yakunlangan']].map(([I, c, v, l]) => (
          <div className="card stat" style={{ justifyContent: 'flex-start' }} key={l}><div className={`ico s-${c}`}><I size={22} /></div><div><div style={{ fontSize: 26, fontWeight: 700 }}>{v}</div><div className="muted small">{l}</div></div></div>))}
      </div>
      <div className="card"><div className="toolbar"><SearchInput value={q} onChange={setQ} placeholder="Uchrashuvlarni qidirish..." />
        <select value={kind} onChange={(e) => setKind(e.target.value)}><option value="">Barcha turlar</option>{KINDS.map((k) => <option key={k}>{k}</option>)}</select></div>
        <Chips value={st} onChange={setSt} items={[['all', 'Barchasi'], ...ST.map((s) => [s, s])]} /></div>
      <div style={{ height: 16 }} />
      {!list.length && <Empty icon={Calendar} text="Uchrashuvlar topilmadi" />}
      <div className="list">{list.map((m) => { const done = m.status === 'Yakunlangan'; return (
        <div className="card" key={m.id}><div className="row-card">
          <div style={{ display: 'flex', gap: 14 }}>
            <div className="ico-sq s-green"><MapPin size={20} /></div>
            <div><h4 style={{ textDecoration: done ? 'line-through' : 'none', color: done ? 'var(--muted)' : undefined }}>{m.title}</h4>
              <Badge color={done ? 'green' : m.status === 'Bekor qilingan' ? 'gray' : 'blue'}>{m.status}</Badge>
              <div className="meta"><span><Clock size={13} />{fdate(m.at)} {ftime(m.at)}{m.end ? ` — ${m.end}` : ''}</span><span className="tag">{m.kind}</span>{m.place && <span><MapPin size={13} />{m.place}</span>}{m.people && <span><Users size={13} />{m.people}</span>}</div>
              {m.result && <div style={{ color: '#16a34a', fontStyle: 'italic', marginTop: 10 }}>Natija: {m.result}</div>}</div>
          </div>
          <div style={{ position: 'relative' }}><button className="icon-btn" onClick={() => setMenu(menu === m.id ? null : m.id)}><MoreHorizontal size={18} /></button>
            {menu === m.id && <div className="menu" onMouseLeave={() => setMenu(null)}>
              {!done && <button onClick={() => { update('meetings', m.id, { status: 'Yakunlangan' }); setMenu(null) }}><CheckCircle2 size={14} /> Yakunlash</button>}
              <button onClick={() => { setForm({ ...m, at: toLocal(m.at) }); setMenu(null) }}><Pencil size={14} /> Tahrirlash</button>
              <button style={{ color: '#dc2626' }} onClick={() => { setMenu(null); confirmDel('Uchrashuvni') && remove('meetings', m.id) }}><Trash2 size={14} /> O'chirish</button></div>}</div>
        </div></div>) })}</div>
      {form && <FormModal wide title={form.id ? 'Uchrashuvni tahrirlash' : 'Yangi uchrashuv'} fields={fields} initial={form.id ? form : { at: toLocal(new Date(Date.now() + 864e5).toISOString()), status: 'Rejalashtirilgan' }} onClose={() => setForm(null)}
        onSave={(v) => { const d = { ...v, at: new Date(v.at).toISOString() }; form.id ? update('meetings', form.id, d) : add('meetings', d) }} />}
    </>
  )
}
