import { useState } from 'react'
import { Settings, CheckSquare, BarChart3, Calendar, Type, Hash, List, Pencil, Trash2, Upload, Download } from 'lucide-react'
import { useStore, fdate } from '../store'
import { PageHead, FormModal, confirmDel, exportCSV } from '../components/ui'

const TYPES = ['Matn', 'Raqam', 'Sana', "Tanlov ro'yxati", 'Belgilagich', 'Email', 'Telefon']
const ICON = { Matn: Type, Raqam: Hash, Sana: Calendar, "Tanlov ro'yxati": List, Belgilagich: CheckSquare, Email: Type, Telefon: Type }

export default function Fields() {
  const { db, add, update, remove } = useStore()
  const [form, setForm] = useState(null)
  const F = db.fields
  const counts = F.reduce((m, f) => ((m[f.type] = (m[f.type] || 0) + 1), m), {})
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'
  const fields = [
    { key: 'name', label: 'Maydon kaliti (lotincha, bo\'shliqsiz)', required: true }, { key: 'label', label: 'Ko\'rinadigan nomi' },
    { key: 'type', label: 'Turi', type: 'select', options: TYPES }, { key: 'optionsStr', label: "Variantlar (vergul bilan, faqat tanlov ro'yxati uchun)" },
    { key: 'required', label: 'Majburiy', type: 'checkbox' },
  ]
  const save = (v) => {
    const { optionsStr, ...rest } = v
    const data = { ...rest, name: rest.name.trim().replace(/\s+/g, '_'), options: (optionsStr || '').split(',').map((s) => s.trim()).filter(Boolean) }
    form.id ? update('fields', form.id, data) : add('fields', data)
  }
  return (
    <>
      <PageHead title="Custom Fields" sub="Mijozlar uchun qo'shimcha maydonlarni boshqaring">
        <button className="btn" onClick={() => alert('Import: maydonlarni JSON orqali qo\'shish keyingi versiyada.')}><Upload size={16} /> Import</button>
        <button className="btn" onClick={() => exportCSV('maydonlar', F.map(({ options, ...r }) => ({ ...r, options: options.join('|') })))}><Download size={16} /> Export</button>
        <button className="btn primary" onClick={() => setForm({})}>+ Yangi maydon</button>
      </PageHead>
      <div className="grid g3" style={{ marginBottom: 20 }}>
        {[[Settings, 'blue', F.length, 'Jami maydonlar'], [CheckSquare, 'red', F.filter((f) => f.required).length, 'Majburiy maydonlar'], [BarChart3, 'green', top, "Eng ko'p tur"]].map(([I, c, v, l]) => (
          <div className="card stat" style={{ justifyContent: 'flex-start' }} key={l}><div className={`ico s-${c}`}><I size={22} /></div><div><div style={{ fontSize: 22, fontWeight: 700 }}>{v}</div><div className="muted small">{l}</div></div></div>))}
      </div>
      <div className="grid g3">{F.map((f) => { const I = ICON[f.type] || Type; return (
        <div className="card" key={f.id} style={{ minHeight: 160 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div className="ico-sq s-blue"><I size={20} /></div>
            <div style={{ flex: 1 }}><b style={{ fontSize: 16 }}>{f.name}</b>{f.required && <span className="req"> *</span>}<div><span className="tag" style={{ display: 'inline-block', marginTop: 6 }}>{f.type}</span></div></div>
            <button className="icon-btn" onClick={() => setForm({ ...f, optionsStr: f.options.join(', ') })}><Pencil size={16} /></button>
            <button className="icon-btn" onClick={() => confirmDel('Maydonni') && remove('fields', f.id)}><Trash2 size={16} /></button>
          </div>
          {f.options?.length > 0 && <div style={{ marginTop: 14 }}><div className="muted small">Variantlar:</div><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>{f.options.slice(0, 3).map((o) => <span className="badge s-blue" key={o}>{o}</span>)}{f.options.length > 3 && <span className="muted small">+{f.options.length - 3} ta yana</span>}</div></div>}
          <div className="muted small" style={{ marginTop: 14 }}>Yaratilgan: {fdate(f.created || new Date())}</div>
        </div>) })}</div>
      {form && <FormModal title={form.id ? 'Maydonni tahrirlash' : 'Yangi maydon'} fields={fields} initial={form.id ? form : { type: 'Matn' }} onClose={() => setForm(null)} onSave={save} />}
    </>
  )
}
