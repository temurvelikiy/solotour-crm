import { useState } from 'react'
import { Package, TrendingUp, Crown, Plus, Briefcase, DollarSign, Pencil, Trash2 } from 'lucide-react'
import { useStore, fdate, fmt, toUZS } from '../store'
import { PageHead, FormModal, confirmDel, Empty } from '../components/ui'

export default function Services() {
  const { db, add, update, remove } = useStore()
  const [form, setForm] = useState(null)
  const S = db.services
  const r = db.settings.rate
  const uzs = S.map((s) => toUZS(Number(s.price), s.currency, r))
  const avg = uzs.length ? uzs.reduce((a, b) => a + b, 0) / uzs.length : 0
  const max = S.length ? S[uzs.indexOf(Math.max(...uzs))] : null
  const fields = [
    { key: 'name', label: 'Xizmat nomi', required: true, full: true }, { key: 'price', label: 'Narx', type: 'number', required: true },
    { key: 'currency', label: 'Valyuta', type: 'select', options: ['UZS', 'USD'] }, { key: 'description', label: 'Tavsif', type: 'textarea' },
  ]
  return (
    <>
      <PageHead title="Xizmatlar" sub="Kompaniyangiz taklif qiladigan barcha xizmatlar"><button className="btn primary" onClick={() => setForm({})}><Plus size={16} /> Yangi xizmat</button></PageHead>
      <div className="grid g3" style={{ marginBottom: 20 }}>
        {[[Package, 'blue', S.length, 'Jami xizmatlar'], [TrendingUp, 'green', `${fmt(avg)} so'm`, "O'rtacha narx"], [Crown, 'yellow', max ? `${fmt(Math.max(...uzs))} so'm` : '-', 'Eng qimmat xizmat']].map(([I, c, v, l]) => (
          <div className="card stat" style={{ justifyContent: 'flex-start' }} key={l}><div className={`ico s-${c}`}><I size={22} /></div><div><div style={{ fontSize: 22, fontWeight: 700 }}>{v}</div><div className="muted small">{l}</div></div></div>))}
      </div>
      {!S.length && <Empty icon={Briefcase} text="Xizmatlar mavjud emas" />}
      <div className="grid g3">{S.map((s) => (
        <div className="card" key={s.id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}><div className="ico-sq s-purple"><Briefcase size={20} /></div><div><b style={{ fontSize: 16 }}>{s.name}</b><div className="muted small">{fdate(s.created)}</div></div></div>
          <div className="muted" style={{ flex: 1, minHeight: 40 }}>{s.description}</div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <b style={{ fontSize: 17, display: 'flex', alignItems: 'center', gap: 4 }}><DollarSign size={17} color="#16a34a" />{s.currency} {fmt(s.price)}</b>
            <span><button className="icon-btn" onClick={() => setForm(s)}><Pencil size={17} /></button><button className="icon-btn" onClick={() => confirmDel('Xizmatni') && remove('services', s.id)}><Trash2 size={17} /></button></span>
          </div>
        </div>))}</div>
      {form && <FormModal title={form.id ? 'Xizmatni tahrirlash' : 'Yangi xizmat'} fields={fields} initial={form.id ? form : {}} onClose={() => setForm(null)} onSave={(v) => (form.id ? update('services', form.id, v) : add('services', v))} />}
    </>
  )
}
