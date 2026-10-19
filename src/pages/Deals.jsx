import { useState } from 'react'
import { DollarSign, Trophy, TrendingUp, Target, Download, Plus, Eye, Trash2, Columns, List, User, Users, Pencil } from 'lucide-react'
import { useStore, fmt, toUZS } from '../store'
import { PageHead, SearchInput, Seg, Chips, FormModal, Badge, exportCSV, confirmDel, Empty } from '../components/ui'

const STAGES = ['Yangi', 'Tekshirish', 'Taklif', 'Muzokara', 'Yutildi', "Yo'qotildi"]
const COLOR = { Yangi: 'blue', Tekshirish: 'purple', Taklif: 'yellow', Muzokara: 'orange', Yutildi: 'green', "Yo'qotildi": 'red' }
const PROB = { Yangi: 0.1, Tekshirish: 0.25, Taklif: 0.5, Muzokara: 0.75, Yutildi: 1, "Yo'qotildi": 0 }

export default function Deals() {
  const { db, add, update, remove } = useStore()
  const [q, setQ] = useState('')
  const [stage, setStage] = useState('all')
  const [view, setView] = useState('list')
  const [form, setForm] = useState(null)
  const [drag, setDrag] = useState(null)
  const rate = db.settings.rate
  const D = db.deals
  const uzs = (d) => toUZS(Number(d.amount), d.currency, rate)
  const total = D.reduce((s, d) => s + uzs(d), 0)
  const won = D.filter((d) => d.stage === 'Yutildi'), lost = D.filter((d) => d.stage === "Yo'qotildi")
  const winRate = won.length + lost.length ? Math.round((won.length / (won.length + lost.length)) * 100) : 0
  const forecast = D.reduce((s, d) => s + uzs(d) * PROB[d.stage], 0)
  const list = D.filter((d) => (stage === 'all' || d.stage === stage) && (!q || d.title.toLowerCase().includes(q.toLowerCase())))
  const cl = (id) => db.clients.find((c) => c.id === id)
  const own = (id) => db.users.find((u) => u.id === id)?.name

  const fields = [
    { key: 'title', label: 'Bitim nomi', required: true, full: true },
    { key: 'amount', label: 'Summa', type: 'number', required: true }, { key: 'currency', label: 'Valyuta', type: 'select', options: ['UZS', 'USD'] },
    { key: 'stage', label: 'Bosqich', type: 'select', options: STAGES },
    { key: 'clientId', label: 'Mijoz', type: 'select', options: [{ value: '', label: '— tanlanmagan —' }, ...db.clients.map((c) => ({ value: c.id, label: c.name }))] },
    { key: 'owner', label: "Mas'ul", type: 'select', options: db.users.map((u) => ({ value: u.id, label: u.name })) },
  ]
  const cur = (d) => `${fmt(d.amount)} ${d.currency}`
  return (
    <>
      <PageHead title="Bitimlar" sub="Savdo pipeline va bitimlarni boshqaring">
        <button className="btn" onClick={() => exportCSV('bitimlar', D)}><Download size={16} /> Eksport</button>
        <button className="btn primary" onClick={() => setForm({})}><Plus size={16} /> Yangi bitim</button>
      </PageHead>
      <div className="grid g4" style={{ marginBottom: 20 }}>
        {[[DollarSign, 'blue', fmt(total), 'Jami summa (so\'m)'], [Trophy, 'green', winRate + '%', 'Yutuv darajasi'], [TrendingUp, 'purple', fmt(forecast), 'Prognoz'], [Target, 'orange', fmt(lost.reduce((s, d) => s + uzs(d), 0)), "Yo'qotilgan"]].map(([I, c, v, l]) => (
          <div className="card stat" style={{ justifyContent: 'flex-start' }} key={l}><div className={`ico s-${c}`}><I size={22} /></div><div><div style={{ fontSize: 22, fontWeight: 700 }}>{v}</div><div className="muted small">{l}</div></div></div>
        ))}
      </div>
      <div className="card">
        <div className="toolbar"><SearchInput value={q} onChange={setQ} placeholder="Bitimlarni qidirish..." /><Seg value={view} onChange={setView} items={[['kanban', Columns], ['list', List]]} /></div>
        <Chips value={stage} onChange={setStage} items={[['all', 'Barchasi'], ...STAGES.map((s) => [s, s])]} />
      </div>
      <div style={{ height: 16 }} />
      {!list.length && <Empty text="Bitimlar topilmadi" />}
      {view === 'list' && <div className="list">{list.map((d) => (
        <div className="card" key={d.id}>
          <div className="row-card">
            <div><h4>{d.title}</h4><div style={{ fontSize: 18, fontWeight: 600, margin: '12px 0 8px' }}>{cur(d)}</div>
              <div className="meta"><Badge color={COLOR[d.stage]}>{d.stage}</Badge><span><User size={14} />{own(d.owner)}</span>{cl(d.clientId) && <span style={{ color: 'var(--primary)' }}><Users size={14} />{cl(d.clientId).name}</span>}</div></div>
            <div><button className="icon-btn" onClick={() => setForm(d)}><Pencil size={17} /></button><button className="icon-btn" onClick={() => confirmDel('Bitimni') && remove('deals', d.id)}><Trash2 size={17} /></button></div>
          </div>
        </div>))}</div>}
      {view === 'kanban' && <div className="kanban">{STAGES.map((s) => (
        <div key={s} className="col" onDragOver={(e) => e.preventDefault()} onDrop={() => drag && update('deals', drag, { stage: s })}>
          <div className="col-head">{s}<span className="cnt">{list.filter((d) => d.stage === s).length}</span></div>
          {list.filter((d) => d.stage === s).map((d) => (
            <div key={d.id} className="kcard" draggable onDragStart={() => setDrag(d.id)} onClick={() => setForm(d)}>
              <div className="t">{d.title}</div><div className="m"><b>{cur(d)}</b></div><div className="m">{own(d.owner)}</div></div>))}
        </div>))}</div>}
      {form && <FormModal title={form.id ? 'Bitimni tahrirlash' : 'Yangi bitim'} fields={fields} initial={form.id ? form : { owner: db.me }} onClose={() => setForm(null)} onSave={(v) => (form.id ? update('deals', form.id, v) : add('deals', v))} />}
    </>
  )
}
