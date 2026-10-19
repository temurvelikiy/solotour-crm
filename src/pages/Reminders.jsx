import { useState } from 'react'
import { Bell, AlertTriangle, CalendarClock, CheckCircle2, Download, Plus, Clock, User, Check, Pencil, Trash2, Phone, Mail, ListChecks, CalendarCheck } from 'lucide-react'
import { useStore, fdate, ftime, clientName } from '../store'
import { PageHead, SearchInput, Chips, FormModal, Badge, exportCSV, confirmDel, Empty } from '../components/ui'

const TYPES = ['Vazifa', "Qo'ng'iroq", 'Email', 'Uchrashuv', 'Boshqa']
const ICON = { Vazifa: ListChecks, "Qo'ng'iroq": Phone, Email: Mail, Uchrashuv: CalendarCheck, Boshqa: Bell }
const ST = ['Kutilmoqda', 'Keyinga surilgan', 'Bajarilgan', 'Bekor qilingan']
const COL = { Kutilmoqda: 'yellow', 'Keyinga surilgan': 'blue', Bajarilgan: 'green', 'Bekor qilingan': 'gray' }
const toLocal = (iso) => { const d = new Date(iso); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16) }

export default function Reminders() {
  const { db, add, update, remove } = useStore()
  const [q, setQ] = useState('')
  const [type, setType] = useState('')
  const [st, setSt] = useState('all')
  const [late, setLate] = useState(false)
  const [form, setForm] = useState(null)
  const R = db.reminders
  const now = new Date()
  const isLate = (r) => r.status === 'Kutilmoqda' && new Date(r.at) < now
  const isToday = (r) => new Date(r.at).toDateString() === now.toDateString()
  const list = R.filter((r) => (!q || r.title.toLowerCase().includes(q.toLowerCase())) && (!type || r.type === type) && (st === 'all' || r.status === st) && (!late || isLate(r)))
    .sort((a, b) => new Date(a.at) - new Date(b.at))
  const fields = [
    { key: 'title', label: 'Sarlavha', required: true, full: true }, { key: 'type', label: 'Turi', type: 'select', options: TYPES },
    { key: 'at', label: 'Vaqt', type: 'datetime' }, { key: 'status', label: 'Status', type: 'select', options: ST },
    { key: 'clientId', label: 'Mijoz', type: 'select', options: [{ value: '', label: '— tanlanmagan —' }, ...db.clients.map((c) => ({ value: c.id, label: c.name }))] },
    { key: 'note', label: 'Izoh', type: 'textarea' },
  ]
  return (
    <>
      <PageHead title="Eslatmalar" sub="Mijozlar va bitimlar bilan bog'lanish eslatmalari">
        <button className="btn" onClick={() => exportCSV('eslatmalar', R)}><Download size={16} /> Eksport</button>
        <button className="btn primary" onClick={() => setForm({})}><Plus size={16} /> Yangi eslatma</button>
      </PageHead>
      <div className="grid g4" style={{ marginBottom: 20 }}>
        {[[Bell, 'blue', R.filter((r) => r.status === 'Kutilmoqda').length, 'Kutilmoqda'], [AlertTriangle, 'red', R.filter(isLate).length, 'Kechikkan'], [CalendarClock, 'yellow', R.filter((r) => isToday(r) && r.status === 'Kutilmoqda').length, 'Bugun'], [CheckCircle2, 'green', R.filter((r) => r.status === 'Bajarilgan').length, 'Bajarilgan']].map(([I, c, v, l]) => (
          <div className="card stat" style={{ justifyContent: 'flex-start' }} key={l}><div className={`ico s-${c}`}><I size={22} /></div><div><div style={{ fontSize: 26, fontWeight: 700 }}>{v}</div><div className="muted small">{l}</div></div></div>))}
      </div>
      <div className="card" style={{ display: 'grid', gap: 12 }}>
        <SearchInput value={q} onChange={setQ} placeholder="Eslatmalarni qidirish..." />
        <select value={type} onChange={(e) => setType(e.target.value)}><option value="">Barcha turlar</option>{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
        <div className="chips" style={{ margin: 0 }}><button className={`chip ${late ? 'active' : ''}`} onClick={() => setLate(!late)}><AlertTriangle size={14} />Kechikkanlar</button></div>
        <Chips value={st} onChange={setSt} items={[['all', 'Barchasi'], ...ST.map((s) => [s, s])]} />
      </div>
      <div style={{ height: 16 }} />
      {!list.length && <Empty icon={Bell} text="Eslatmalar topilmadi" />}
      <div className="list">{list.map((r) => { const I = ICON[r.type] || Bell; const done = r.status === 'Bajarilgan'; return (
        <div className="card" key={r.id} style={{ opacity: done ? .75 : 1 }}>
          <div className="row-card">
            <div style={{ display: 'flex', gap: 14 }}>
              <div className="ico-sq s-purple"><I size={20} /></div>
              <div><h4 style={{ textDecoration: done ? 'line-through' : 'none' }}>{r.title} <Badge color={isLate(r) ? 'red' : COL[r.status]}>{isLate(r) ? 'Kechikkan' : r.status}</Badge></h4>
                {r.note && <div className="muted">{r.note}</div>}
                <div className="meta"><span><Clock size={13} />{fdate(r.at)} {ftime(r.at)}</span><span className="tag">{r.type}</span>{r.clientId && <span><User size={13} />{clientName(db, r.clientId)}</span>}</div></div>
            </div>
            <div style={{ display: 'flex' }}>
              {!done && <button className="icon-btn" title="Bajarildi" onClick={() => update('reminders', r.id, { status: 'Bajarilgan' })}><Check size={18} /></button>}
              <button className="icon-btn" onClick={() => setForm({ ...r, at: toLocal(r.at) })}><Pencil size={17} /></button>
              <button className="icon-btn" onClick={() => confirmDel('Eslatmani') && remove('reminders', r.id)}><Trash2 size={17} /></button>
            </div>
          </div>
        </div>) })}</div>
      {form && <FormModal title={form.id ? 'Eslatmani tahrirlash' : 'Yangi eslatma'} fields={fields} initial={form.id ? form : { at: toLocal(new Date(Date.now() + 36e5).toISOString()), status: 'Kutilmoqda' }} onClose={() => setForm(null)}
        onSave={(v) => { const d = { ...v, at: new Date(v.at).toISOString() }; form.id ? update('reminders', form.id, d) : add('reminders', d) }} />}
    </>
  )
}
