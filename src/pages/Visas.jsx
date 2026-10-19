import { useState } from 'react'
import { FileCheck, Plus, Pencil, Trash2, Check, Circle, AlertTriangle } from 'lucide-react'
import { useStore, fdate, clientName } from '../store'
import { PageHead, Chips, FormModal, Badge, confirmDel, Empty } from '../components/ui'

const ST = ["Hujjat yig'ilmoqda", 'Topshirilgan', 'Tayyor', 'Rad etilgan']
const COL = { "Hujjat yig'ilmoqda": 'yellow', Topshirilgan: 'blue', Tayyor: 'green', 'Rad etilgan': 'red' }
const DOCS = [['passport', 'Pasport'], ['photo', 'Foto'], ['bank', 'Bank ma\'lumotnoma'], ['insurance', 'Sug\'urta'], ['ticket', 'Aviachipta'], ['hotel', 'Mehmonxona broni']]

export default function Visas() {
  const { db, add, update, remove } = useStore()
  const [st, setSt] = useState('all')
  const [form, setForm] = useState(null)
  const list = db.visas.filter((v) => st === 'all' || v.status === st)
  const soon = db.clients.filter((c) => c.passportExpiry && (new Date(c.passportExpiry) - Date.now()) / 864e5 < 180)
  const fields = [
    { key: 'clientId', label: 'Mijoz', type: 'select', required: true, options: [{ value: '', label: '— tanlang —' }, ...db.clients.map((c) => ({ value: c.id, label: c.name }))] },
    { key: 'country', label: 'Davlat / viza turi', required: true }, { key: 'type', label: 'Turi', type: 'select', options: ['Turistik', 'Biznes', 'Ziyorat', 'Tranzit'] },
    { key: 'status', label: 'Status', type: 'select', options: ST }, { key: 'submitted', label: 'Topshirilgan sana', type: 'date' }, { key: 'expected', label: 'Kutilayotgan sana', type: 'date' },
    ...DOCS.map(([k, l]) => ({ key: 'doc_' + k, label: l, type: 'checkbox' })),
  ]
  const save = (v) => {
    const docs = {}; const rest = {}
    Object.entries(v).forEach(([k, x]) => (k.startsWith('doc_') ? (docs[k.slice(4)] = x) : (rest[k] = x)))
    form.id ? update('visas', form.id, { ...rest, docs }) : add('visas', { ...rest, docs })
  }
  const flat = (v) => { const o = { ...v }; DOCS.forEach(([k]) => (o['doc_' + k] = !!v.docs?.[k])); return o }
  return (
    <>
      <PageHead title="Viza va hujjatlar" sub="Viza arizalari, hujjatlar ro'yxati va pasport muddatlari"><button className="btn primary" onClick={() => setForm({})}><Plus size={16} /> Yangi ariza</button></PageHead>
      {soon.length > 0 && <div className="info-box" style={{ background: '#fef3c7', color: '#92400e', borderColor: '#fde68a' }}>
        <b style={{ display: 'flex', gap: 8, alignItems: 'center' }}><AlertTriangle size={16} /> Pasport muddati 6 oydan kam qolgan mijozlar</b>
        <div style={{ marginTop: 6 }}>{soon.map((c) => `${c.name} (${fdate(c.passportExpiry)})`).join(' · ')}</div></div>}
      <div className="card"><Chips value={st} onChange={setSt} items={[['all', 'Barchasi'], ...ST.map((s) => [s, s])]} /></div>
      <div style={{ height: 16 }} />
      {!list.length && <Empty icon={FileCheck} text="Arizalar topilmadi" />}
      <div className="grid g2">{list.map((v) => { const done = DOCS.filter(([k]) => v.docs?.[k]).length; return (
        <div className="card" key={v.id}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div className="ico-sq s-purple"><FileCheck size={20} /></div>
            <div style={{ flex: 1 }}><b style={{ fontSize: 16 }}>{clientName(db, v.clientId)}</b><div className="muted">{v.country} · {v.type}</div></div>
            <Badge color={COL[v.status]}>{v.status}</Badge>
            <button className="icon-btn" onClick={() => setForm(flat(v))}><Pencil size={16} /></button><button className="icon-btn" onClick={() => confirmDel('Arizani') && remove('visas', v.id)}><Trash2 size={16} /></button>
          </div>
          <div className="muted small" style={{ margin: '12px 0 6px' }}>Hujjatlar: {done}/{DOCS.length}</div>
          <div className="progress" style={{ marginBottom: 12 }}><i style={{ width: `${(done / DOCS.length) * 100}%`, background: '#10b981' }} /></div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', fontSize: 13 }}>{DOCS.map(([k, l]) => (
            <span key={k} style={{ display: 'flex', gap: 4, alignItems: 'center', cursor: 'pointer', color: v.docs?.[k] ? '#16a34a' : 'var(--muted)' }} onClick={() => update('visas', v.id, { docs: { ...v.docs, [k]: !v.docs?.[k] } })}>
              {v.docs?.[k] ? <Check size={14} /> : <Circle size={14} />}{l}</span>))}</div>
          <div className="muted small" style={{ marginTop: 12 }}>Topshirilgan: {fdate(v.submitted)} · Kutilmoqda: {fdate(v.expected)}</div>
        </div>) })}</div>
      {form && <FormModal wide title={form.id ? 'Arizani tahrirlash' : 'Yangi viza arizasi'} fields={fields} initial={form.id ? form : { status: ST[0] }} onClose={() => setForm(null)} onSave={save} />}
    </>
  )
}
