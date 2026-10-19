import { useState } from 'react'
import { Upload, Download, RefreshCw, Plus, Phone, Mail, User, Clock, LayoutGrid, List, Columns, Users, Link2, Check, X, Repeat, Pencil, Trash2, UserCheck } from 'lucide-react'
import { useStore, fmt, fdate } from '../store'
import { PageHead, Stat, SearchInput, Seg, Chips, FormModal, Badge, exportCSV, importCSV, confirmDel, Empty } from '../components/ui'

const STAGES = ['Yangi', "Bog'lanildi", 'Mos', 'Mos emas', 'Konvertatsiya']
const PRIO = { Shoshilinch: 'red', Yuqori: 'orange', "O'rta": 'yellow', Past: 'gray' }
const PRIO_DOT = { Shoshilinch: '#ef4444', Yuqori: '#f97316', "O'rta": '#eab308', Past: '#94a3b8' }
const SRC = ['Instagram', 'Telegram', 'Sayt', "Qo'lda", 'Tavsiya', "Qo'ng'iroq"]

export default function Leads() {
  const { db, add, update, remove } = useStore()
  const [q, setQ] = useState('')
  const [src, setSrc] = useState('')
  const [prio, setPrio] = useState('')
  const [stage, setStage] = useState('all')
  const [view, setView] = useState('grid')
  const [form, setForm] = useState(null)
  const [drag, setDrag] = useState(null)

  const L = db.leads
  const list = L.filter((l) => {
    const t = q.toLowerCase()
    return (stage === 'all' || l.status === stage) && (!src || l.source === src) && (!prio || l.priority === prio) &&
      (!t || [l.name, l.phone, l.email].some((x) => (x || '').toLowerCase().includes(t)))
  })
  const conv = L.filter((l) => l.status === 'Konvertatsiya')
  const rate = L.length ? Math.round((conv.length / L.length) * 100) : 0
  const dealValue = L.reduce((s, l) => s + Number(l.value || 0), 0)
  const mgrs = db.users.map((u) => u.name)

  const toClient = (l) => {
    add('clients', { name: l.name, phone: l.phone, email: l.email, status: 's1', source: l.source, destination: '', custom: {}, notes: 'Lid asosida yaratildi' })
    update('leads', l.id, { status: 'Konvertatsiya' })
  }
  const fields = [
    { key: 'name', label: 'Ism', required: true }, { key: 'phone', label: 'Telefon', type: 'tel' }, { key: 'email', label: 'Email', type: 'email' },
    { key: 'source', label: 'Manba', type: 'select', options: SRC }, { key: 'priority', label: 'Ustuvorlik', type: 'select', options: Object.keys(PRIO), default: "O'rta" },
    { key: 'status', label: 'Bosqich', type: 'select', options: STAGES }, { key: 'value', label: "Kutilayotgan summa (so'm)", type: 'number' },
    { key: 'manager', label: "Mas'ul menejer", type: 'select', options: mgrs }, { key: 'score', label: 'Ball (%)', type: 'number', default: 50 },
    { key: 'tagsStr', label: 'Teglar (vergul bilan)' }, { key: 'notes', label: 'Izoh', type: 'textarea' },
  ]
  const save = (v) => {
    const { tagsStr, ...rest } = v
    const data = { ...rest, tags: (tagsStr || '').split(',').map((s) => s.trim()).filter(Boolean) }
    form.id ? update('leads', form.id, data) : add('leads', data)
  }

  const Card = ({ l }) => (
    <div className="card ccard" style={{ gap: 8 }}>
      <div className="top" style={{ alignItems: 'flex-start' }}>
        <div className="avatar soft"><User size={18} /></div>
        <div style={{ flex: 1 }}><div className="name" style={{ fontSize: 15 }}>{l.name}</div><div className="muted small">{l.source}</div></div>
        <div style={{ textAlign: 'right' }}><Badge color="purple">{l.status}</Badge>
          <div className="small" style={{ color: PRIO_DOT[l.priority], marginTop: 4 }}>● {l.priority}</div></div>
      </div>
      {l.phone && <div className="line"><Phone size={15} />{l.phone}</div>}
      {l.email && <div className="line"><Mail size={15} />{l.email}</div>}
      <div className="line"><User size={15} />{l.manager}</div>
      <div className="line"><b style={{ color: 'var(--muted)' }}>$</b>{fmt(l.value)} so'm</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{(l.tags || []).map((t) => <span className="tag" key={t}>{t}</span>)}</div>
      <div className="foot" style={{ marginTop: 4 }}>
        <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Clock size={13} />{fdate(l.created)} <Badge color="blue">{l.score}%</Badge></span>
        <span style={{ display: 'flex', gap: 2 }}>
          {l.status !== 'Konvertatsiya' && <button className="icon-btn" title="Mijozga aylantirish" onClick={() => toClient(l)}><UserCheck size={16} /></button>}
          <button className="icon-btn" onClick={() => setForm({ ...l, tagsStr: (l.tags || []).join(', ') })}><Pencil size={16} /></button>
          <button className="icon-btn" onClick={() => confirmDel(`"${l.name}" lidini`) && remove('leads', l.id)}><Trash2 size={16} /></button>
        </span>
      </div>
    </div>
  )

  return (
    <>
      <PageHead title="Lidlar" sub={`Jami: ${L.length} | Bu hafta: ${L.length} | Konversiya: ${rate}%`}>
        <button className="btn" onClick={() => importCSV((rows) => rows.forEach((r) => add('leads', { status: 'Yangi', priority: "O'rta", source: "Qo'lda", tags: [], ...r })))}><Upload size={16} /> Import</button>
        <button className="btn" onClick={() => exportCSV('lidlar', list.map(({ tags, ...r }) => r))}><Download size={16} /> Eksport</button>
        <button className="btn" onClick={() => window.location.reload()}><RefreshCw size={16} /> Yangilash</button>
        <button className="btn primary" onClick={() => setForm({})}><Plus size={16} /> Yangi lead</button>
      </PageHead>
      <div className="grid g6" style={{ marginBottom: 20 }}>
        <div className="card"><div className="muted">Jami leadlar</div><div className="val" style={{ fontSize: 26, fontWeight: 700 }}>{L.length}</div></div>
        <div className="card"><div className="muted">Bu hafta</div><div style={{ fontSize: 26, fontWeight: 700, color: '#2563eb' }}>{L.length}</div></div>
        <div className="card"><div className="muted">Bu oy</div><div style={{ fontSize: 26, fontWeight: 700, color: '#16a34a' }}>{L.length}</div></div>
        <div className="card"><div className="muted">Konversiya</div><div style={{ fontSize: 26, fontWeight: 700, color: '#9333ea' }}>{rate}%</div></div>
        <div className="card"><div className="muted">Deal qiymati</div><div style={{ fontSize: 24, fontWeight: 700, color: '#ea580c' }}>{(dealValue / 1e6).toFixed(1)} mln</div></div>
        <div className="card"><div className="muted">Follow-uplar</div><div style={{ fontSize: 26, fontWeight: 700, color: '#0891b2' }}>{L.filter((l) => l.status !== 'Konvertatsiya' && l.status !== 'Mos emas').length}</div></div>
      </div>
      <div className="card">
        <div className="toolbar">
          <SearchInput value={q} onChange={setQ} placeholder="Ism, telefon, email yoki tashkilot bo'yicha qidirish..." />
          <select value={src} onChange={(e) => setSrc(e.target.value)}><option value="">Barcha manbalar</option>{SRC.map((s) => <option key={s}>{s}</option>)}</select>
          <select value={prio} onChange={(e) => setPrio(e.target.value)}><option value="">Barcha ustuvorlik</option>{Object.keys(PRIO).map((s) => <option key={s}>{s}</option>)}</select>
          <Seg value={view} onChange={setView} items={[['grid', LayoutGrid], ['list', List], ['kanban', Columns]]} />
        </div>
        <Chips value={stage} onChange={setStage} items={[['all', 'Barchasi', Users], ['Yangi', 'Yangi', User], ["Bog'lanildi", "Bog'lanildi", Link2], ['Mos', 'Mos', Check], ['Mos emas', 'Mos emas', X], ['Konvertatsiya', 'Konvertatsiya', Repeat]]} />
      </div>
      <div style={{ height: 16 }} />
      {!list.length && <Empty text="Lidlar topilmadi" />}
      {view === 'grid' && <div className="grid g3">{list.map((l) => <Card key={l.id} l={l} />)}</div>}
      {view === 'list' && list.length > 0 && (
        <div className="card table-wrap" style={{ padding: 0 }}><table>
          <thead><tr><th>Ism</th><th>Manba</th><th>Telefon</th><th>Bosqich</th><th>Ustuvorlik</th><th>Summa</th><th>Menejer</th><th /></tr></thead>
          <tbody>{list.map((l) => (
            <tr key={l.id}><td><b>{l.name}</b></td><td>{l.source}</td><td>{l.phone}</td><td><Badge color="purple">{l.status}</Badge></td>
              <td><Badge color={PRIO[l.priority]}>{l.priority}</Badge></td><td>{fmt(l.value)}</td><td>{l.manager}</td>
              <td><button className="icon-btn" onClick={() => setForm({ ...l, tagsStr: (l.tags || []).join(', ') })}><Pencil size={16} /></button><button className="icon-btn" onClick={() => confirmDel('Lidni') && remove('leads', l.id)}><Trash2 size={16} /></button></td></tr>
          ))}</tbody></table></div>
      )}
      {view === 'kanban' && (
        <div className="kanban">{STAGES.map((s) => (
          <div key={s} className="col" onDragOver={(e) => e.preventDefault()} onDrop={() => drag && update('leads', drag, { status: s })}>
            <div className="col-head">{s}<span className="cnt">{list.filter((l) => l.status === s).length}</span></div>
            {list.filter((l) => l.status === s).map((l) => (
              <div key={l.id} className="kcard" draggable onDragStart={() => setDrag(l.id)} onClick={() => setForm({ ...l, tagsStr: (l.tags || []).join(', ') })}>
                <div className="t">{l.name}</div><div className="m">{l.source} · {fmt(l.value)} so'm</div><div className="m" style={{ color: PRIO_DOT[l.priority] }}>● {l.priority}</div>
              </div>))}
          </div>))}
        </div>
      )}
      {form && <FormModal wide title={form.id ? 'Leadni tahrirlash' : 'Yangi lead'} fields={fields} initial={form.id ? form : { manager: mgrs[1] }} onClose={() => setForm(null)} onSave={save} />}
    </>
  )
}
