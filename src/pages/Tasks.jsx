import { useState } from 'react'
import { CheckSquare, CheckCircle2, AlertTriangle, Users, Upload, Download, Plus, Calendar, User, UserCheck, LayoutGrid, Columns, Pencil, Trash2, ListChecks } from 'lucide-react'
import { useStore, fdate, userName, clientName } from '../store'
import { PageHead, SearchInput, Seg, FormModal, Badge, exportCSV, importCSV, confirmDel } from '../components/ui'

const COLS = [['Bajarilmagan', '#6b7280'], ['Jarayonda', '#3b82f6'], ['Bajarildi', '#22c55e']]
const PRIO = { Shoshilinch: 'red', Yuqori: 'orange', "O'rta": 'yellow', Past: 'gray' }

export default function Tasks() {
  const { db, add, update, remove } = useStore()
  const [q, setQ] = useState('')
  const [prio, setPrio] = useState('')
  const [mine, setMine] = useState(false)
  const [over, setOver] = useState(false)
  const [view, setView] = useState('kanban')
  const [form, setForm] = useState(null)
  const [drag, setDrag] = useState(null)
  const today = new Date().toISOString().slice(0, 10)
  const T = db.tasks
  const isOver = (t) => t.status !== 'Bajarildi' && t.due && t.due < today
  const list = T.filter((t) => (!q || t.title.toLowerCase().includes(q.toLowerCase())) && (!prio || t.priority === prio) && (!mine || t.assignee === db.me) && (!over || isOver(t)))

  const fields = [
    { key: 'title', label: 'Vazifa', required: true, full: true },
    { key: 'status', label: 'Status', type: 'select', options: COLS.map((c) => c[0]) },
    { key: 'priority', label: 'Muhimlik', type: 'select', options: Object.keys(PRIO), default: "O'rta" },
    { key: 'due', label: 'Muddat', type: 'date' },
    { key: 'assignee', label: "Mas'ul", type: 'select', options: db.users.map((u) => ({ value: u.id, label: u.name })) },
    { key: 'clientId', label: 'Mijoz', type: 'select', full: true, options: [{ value: '', label: '— tanlanmagan —' }, ...db.clients.map((c) => ({ value: c.id, label: c.name }))] },
    { key: 'description', label: 'Tavsif', type: 'textarea' },
  ]
  const Card = ({ t }) => (
    <div className="kcard" draggable onDragStart={() => setDrag(t.id)} onClick={() => setForm(t)}>
      <div className="t" style={{ display: 'flex', gap: 6, alignItems: 'center', textDecoration: t.status === 'Bajarildi' ? 'line-through' : 'none', color: t.status === 'Bajarildi' ? 'var(--muted)' : undefined }}>
        {isOver(t) ? <AlertTriangle size={15} color="#ef4444" /> : <ListChecks size={15} />}{t.title}</div>
      <div className="m"><Calendar size={13} />{fdate(t.due)}</div>
      <div className="m"><User size={13} />{userName(db, t.assignee)}</div>
      {t.clientId && <div className="m" style={{ color: 'var(--primary)' }}>{clientName(db, t.clientId)}</div>}
      <div style={{ marginTop: 8 }}><Badge color={PRIO[t.priority]}>{t.priority}</Badge></div>
    </div>
  )
  return (
    <>
      <PageHead title="Vazifalar" sub="Jamoaviy vazifalarni boshqaring va kuzating">
        <button className="btn" onClick={() => importCSV((rows) => rows.forEach((r) => add('tasks', { status: 'Bajarilmagan', priority: "O'rta", assignee: db.me, ...r })))}><Upload size={16} /> Import</button>
        <button className="btn" onClick={() => exportCSV('vazifalar', T)}><Download size={16} /> Eksport</button>
        <button className="btn primary" onClick={() => setForm({})}><Plus size={16} /> Yangi vazifa</button>
      </PageHead>
      <div className="grid g4" style={{ marginBottom: 20 }}>
        {[[CheckSquare, 'blue', T.length, 'Jami vazifalar'], [CheckCircle2, 'green', T.filter((t) => t.status === 'Bajarildi').length, 'Bajarildi'], [AlertTriangle, 'red', T.filter(isOver).length, "Muddati o'tgan"], [Users, 'purple', T.filter((t) => t.assignee === db.me).length, 'Menga tayinlangan']].map(([I, c, v, l]) => (
          <div className="card stat" style={{ justifyContent: 'flex-start' }} key={l}><div className={`ico s-${c}`}><I size={22} /></div><div><div style={{ fontSize: 26, fontWeight: 700 }}>{v}</div><div className="muted small">{l}</div></div></div>))}
      </div>
      <div className="card" style={{ display: 'grid', gap: 12 }}>
        <SearchInput value={q} onChange={setQ} placeholder="Vazifalarni qidirish..." />
        <select value={prio} onChange={(e) => setPrio(e.target.value)}><option value="">Barcha muhimliklar</option>{Object.keys(PRIO).map((p) => <option key={p}>{p}</option>)}</select>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div className="chips" style={{ margin: 0 }}>
            <button className={`chip ${mine ? 'active' : ''}`} onClick={() => setMine(!mine)}><UserCheck size={14} />Mening vazifalarim</button>
            <button className={`chip ${over ? 'active' : ''}`} onClick={() => setOver(!over)}><AlertTriangle size={14} />Muddati o'tgan</button>
          </div>
          <Seg value={view} onChange={setView} items={[['grid', LayoutGrid], ['kanban', Columns]]} />
        </div>
      </div>
      <div style={{ height: 16 }} />
      {view === 'kanban' ? (
        <div className="kanban">{COLS.map(([s, color]) => (
          <div key={s} className="col" onDragOver={(e) => e.preventDefault()} onDrop={() => drag && update('tasks', drag, { status: s })}>
            <div className="col-head"><span style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />{s}<span className="cnt">{list.filter((t) => t.status === s).length}</span></div>
            {list.filter((t) => t.status === s).map((t) => <Card key={t.id} t={t} />)}
          </div>))}</div>
      ) : <div className="grid g3">{list.map((t) => <div className="card" key={t.id}><Card t={t} /><button className="btn sm danger" onClick={() => confirmDel('Vazifani') && remove('tasks', t.id)}><Trash2 size={14} /> O'chirish</button></div>)}</div>}
      {form && <FormModal wide title={form.id ? 'Vazifani tahrirlash' : 'Yangi vazifa'} fields={fields} initial={form.id ? form : { assignee: db.me, status: 'Bajarilmagan' }} onClose={() => setForm(null)} onSave={(v) => (form.id ? update('tasks', form.id, v) : add('tasks', v))} />}
    </>
  )
}
