import { useState } from 'react'
import { Phone, PhoneIncoming, PhoneOutgoing, Clock, Download, Plus, Eye, MoreHorizontal, User, Pencil, Trash2 } from 'lucide-react'
import { useStore, fdate, ftime, dur } from '../store'
import { PageHead, SearchInput, Chips, FormModal, Badge, exportCSV, confirmDel, Empty } from '../components/ui'

const RES = ['Javob berildi', 'Javob yoq', 'Band', 'Xabar qoldirildi']
const COL = { 'Javob berildi': 'green', 'Javob yoq': 'red', Band: 'yellow', 'Xabar qoldirildi': 'blue' }
const toLocal = (iso) => { const d = new Date(iso); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16) }

export default function Calls() {
  const { db, add, update, remove } = useStore()
  const [q, setQ] = useState('')
  const [res, setRes] = useState('')
  const [dir, setDir] = useState('all')
  const [form, setForm] = useState(null)
  const C = db.calls
  const answered = C.filter((c) => c.duration > 0)
  const avg = answered.length ? Math.round(answered.reduce((s, c) => s + c.duration, 0) / answered.length) : 0
  const list = C.filter((c) => (!q || [c.phone, c.note, c.user].some((x) => (x || '').toLowerCase().includes(q.toLowerCase()))) && (!res || c.result === res) && (dir === 'all' || c.dir === dir))
    .sort((a, b) => new Date(b.at) - new Date(a.at))
  const fields = [
    { key: 'dir', label: "Yo'nalish", type: 'select', options: ['Chiquvchi', 'Kiruvchi'] }, { key: 'result', label: 'Natija', type: 'select', options: RES },
    { key: 'phone', label: 'Telefon', type: 'tel', required: true }, { key: 'user', label: 'Menejer', type: 'select', options: db.users.map((u) => u.name) },
    { key: 'at', label: 'Vaqt', type: 'datetime' }, { key: 'duration', label: 'Davomiyligi (soniya)', type: 'number', default: 0 },
    { key: 'note', label: 'Izoh', type: 'textarea' },
  ]
  return (
    <>
      <PageHead title="Qo'ng'iroqlar jurnali" sub="Barcha qo'ng'iroqlarni kuzatib boring">
        <button className="btn" onClick={() => exportCSV('qongiroqlar', C)}><Download size={16} /> Eksport</button>
        <button className="btn primary" onClick={() => setForm({})}><Plus size={16} /> Yangi qo'ng'iroq</button>
      </PageHead>
      <div className="grid g4" style={{ marginBottom: 20 }}>
        {[[Phone, 'blue', C.length, 'Jami'], [PhoneIncoming, 'green', C.filter((c) => c.dir === 'Kiruvchi').length, 'Kiruvchi'], [PhoneOutgoing, 'purple', C.filter((c) => c.dir === 'Chiquvchi').length, 'Chiquvchi'], [Clock, 'yellow', dur(avg), "O'rtacha"]].map(([I, c, v, l]) => (
          <div className="card stat" style={{ justifyContent: 'flex-start' }} key={l}><div className={`ico s-${c}`}><I size={22} /></div><div><div style={{ fontSize: 26, fontWeight: 700 }}>{v}</div><div className="muted small">{l}</div></div></div>))}
      </div>
      <div className="card"><div className="toolbar"><SearchInput value={q} onChange={setQ} placeholder="Qo'ng'iroqlarni qidirish..." />
        <select value={res} onChange={(e) => setRes(e.target.value)}><option value="">Barcha natijalar</option>{RES.map((r) => <option key={r}>{r}</option>)}</select></div>
        <Chips value={dir} onChange={setDir} items={[['all', 'Barchasi'], ['Kiruvchi', 'Kiruvchi'], ['Chiquvchi', 'Chiquvchi']]} /></div>
      <div style={{ height: 16 }} />
      {!list.length && <Empty icon={Phone} text="Qo'ng'iroqlar topilmadi" />}
      <div className="list">{list.map((c) => { const I = c.dir === 'Kiruvchi' ? PhoneIncoming : PhoneOutgoing; return (
        <div className="card" key={c.id}><div className="row-card">
          <div style={{ display: 'flex', gap: 14 }}>
            <div className={`ico-sq ${c.dir === 'Kiruvchi' ? 's-green' : 's-blue'}`}><I size={20} /></div>
            <div><h4>{c.dir} <Badge color={COL[c.result]}>{c.result === 'Javob yoq' ? "Javob yo'q" : c.result}</Badge> {c.duration > 0 && <span className="badge tag"><Clock size={11} /> {dur(c.duration)}</span>}</h4>
              <div style={{ fontFamily: 'monospace', margin: '10px 0 4px' }}>{c.phone}</div>
              {c.note && <div>{c.note}</div>}
              <div className="meta"><span><Clock size={13} />{fdate(c.at)} {ftime(c.at)}</span><span style={{ color: 'var(--primary)' }}><User size={13} />{c.user}</span></div></div>
          </div>
          <div><button className="icon-btn" onClick={() => setForm({ ...c, at: toLocal(c.at) })}><Pencil size={17} /></button><button className="icon-btn" onClick={() => confirmDel("Qo'ng'iroqni") && remove('calls', c.id)}><Trash2 size={17} /></button></div>
        </div></div>) })}</div>
      {form && <FormModal wide title={form.id ? "Qo'ng'iroqni tahrirlash" : "Yangi qo'ng'iroq"} fields={fields} initial={form.id ? form : { at: toLocal(new Date().toISOString()), user: db.users[0].name }} onClose={() => setForm(null)}
        onSave={(v) => { const d = { ...v, at: new Date(v.at).toISOString() }; form.id ? update('calls', form.id, d) : add('calls', d) }} />}
    </>
  )
}
