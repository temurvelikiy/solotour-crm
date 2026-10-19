import { useState } from 'react'
import { Building2, Plus, Pencil, Trash2, Phone, Mail, User, Globe } from 'lucide-react'
import { useStore } from '../store'
import { PageHead, SearchInput, Chips, FormModal, Badge, confirmDel, Empty } from '../components/ui'

const TYPES = ['Aviakompaniya', 'Mehmonxona', 'Gid / ekskursiya', 'Transfer', 'Operator', 'Sug\'urta', 'Boshqa']

export default function Partners() {
  const { db, add, update, remove } = useStore()
  const [q, setQ] = useState('')
  const [type, setType] = useState('all')
  const [form, setForm] = useState(null)
  const list = db.partners.filter((p) => (type === 'all' || p.type === type) && (!q || (p.name + p.contact + p.country).toLowerCase().includes(q.toLowerCase())))
  const fields = [
    { key: 'name', label: 'Nomi', required: true }, { key: 'type', label: 'Turi', type: 'select', options: TYPES }, { key: 'country', label: 'Davlat' },
    { key: 'contact', label: "Aloqa shaxsi" }, { key: 'phone', label: 'Telefon', type: 'tel' }, { key: 'email', label: 'Email', type: 'email' }, { key: 'note', label: 'Izoh', type: 'textarea' },
  ]
  return (
    <>
      <PageHead title="Hamkorlar" sub="Mehmonxonalar, aviakompaniyalar, gidlar va boshqa yetkazib beruvchilar"><button className="btn primary" onClick={() => setForm({})}><Plus size={16} /> Yangi hamkor</button></PageHead>
      <div className="card"><div className="toolbar"><SearchInput value={q} onChange={setQ} placeholder="Hamkorlarni qidirish..." /></div>
        <Chips value={type} onChange={setType} items={[['all', 'Barchasi'], ...TYPES.map((t) => [t, t])]} /></div>
      <div style={{ height: 16 }} />
      {!list.length && <Empty icon={Building2} text="Hamkorlar topilmadi" />}
      <div className="grid g3">{list.map((p) => (
        <div className="card ccard" key={p.id}>
          <div className="top"><div className="ico-sq s-orange"><Building2 size={20} /></div><div style={{ flex: 1 }}><div className="name">{p.name}</div><Badge color="orange">{p.type}</Badge></div>
            <button className="icon-btn" onClick={() => setForm(p)}><Pencil size={16} /></button><button className="icon-btn" onClick={() => confirmDel('Hamkorni') && remove('partners', p.id)}><Trash2 size={16} /></button></div>
          {p.country && <div className="line"><Globe size={15} />{p.country}</div>}{p.contact && <div className="line"><User size={15} />{p.contact}</div>}
          {p.phone && <div className="line"><Phone size={15} />{p.phone}</div>}{p.email && <div className="line"><Mail size={15} />{p.email}</div>}
          {p.note && <div className="extra">{p.note}</div>}
        </div>))}</div>
      {form && <FormModal wide title={form.id ? 'Hamkorni tahrirlash' : 'Yangi hamkor'} fields={fields} initial={form.id ? form : { type: TYPES[0] }} onClose={() => setForm(null)} onSave={(v) => (form.id ? update('partners', form.id, v) : add('partners', v))} />}
    </>
  )
}
