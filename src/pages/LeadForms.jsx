import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Copy, ExternalLink, Code2, Pencil, Trash2, ArrowLeft, Check, Eye, Users } from 'lucide-react'
import { useStore } from '../store'
import { PageHead, Modal, Badge, confirmDel, Empty } from '../components/ui'
import LandingView, { DEFAULT_FORM, FIELD_PRESETS } from '../components/LandingView'

const slugify = (s) => s.toLowerCase().replace(/[ʻ'’`]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) || 'forma'
const rnd = () => Math.random().toString(36).slice(2, 6)
const urlOf = (f) => `${window.location.origin}/f/${f.slug}`

function copy(text, done) {
  const fallback = () => { const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove() }
  ;(navigator.clipboard?.writeText(text) || Promise.reject()).catch(fallback).finally(done)
}

function CopyBtn({ text, label = 'Nusxa olish' }) {
  const [ok, setOk] = useState(false)
  return <button className="btn sm" onClick={() => copy(text, () => { setOk(true); setTimeout(() => setOk(false), 1500) })}>{ok ? <Check size={14} /> : <Copy size={14} />} {ok ? 'Nusxalandi' : label}</button>
}

function EmbedModal({ form, onClose }) {
  const link = urlOf(form)
  const code = `<iframe src="${link}?embed=1" width="100%" height="480" style="border:0" loading="lazy"></iframe>`
  return (
    <Modal title="Saytga ulash" onClose={onClose}>
      <div className="modal-body" style={{ display: 'block' }}>
        <label>Landing sahifa havolasi</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}><input readOnly value={link} onFocus={(e) => e.target.select()} /><CopyBtn text={link} /></div>
        <label>Saytingizga joylash kodi (faqat forma)</label>
        <textarea readOnly rows={3} value={code} onFocus={(e) => e.target.select()} />
        <div style={{ marginTop: 8 }}><CopyBtn text={code} label="Kodni nusxalash" /></div>
        <p className="muted small">Reklama havolasiga <code>?utm_source=instagram</code> kabi belgi qo'shsangiz, lidning manbasi shu bo'ladi.</p>
      </div>
    </Modal>
  )
}

function Editor({ form, onClose, onSave }) {
  const { db } = useStore()
  const [f, setF] = useState(() => ({
    name: '', active: true, manager: db.users.find((u) => u.role === 'Manager')?.name || '', ...DEFAULT_FORM,
    fields: FIELD_PRESETS.map((p) => ({ ...p })), ...form,
  }))
  const [err, setErr] = useState('')
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }))
  const setField = (i, patch) => set('fields', f.fields.map((x, j) => (j === i ? { ...x, ...patch } : x)))
  const preview = { ...f, company: db.settings.company, logo: db.settings.logo }

  const submit = () => {
    if (!f.name.trim()) return setErr('Forma nomini kiriting')
    const on = f.fields.filter((x) => x.enabled)
    if (!on.some((x) => ['name', 'phone', 'email'].includes(x.key))) return setErr('Kamida ism, telefon yoki email maydonini yoqing')
    onSave({ ...f, benefits: f.benefits.map((b) => b.trim()).filter(Boolean) })
    onClose()
  }

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal editor">
        <div className="modal-head"><h3>{form?.id ? 'Formani tahrirlash' : 'Yangi forma / landing'}</h3><button className="icon-btn" onClick={onClose}>✕</button></div>
        <div className="editor-body">
          <div className="editor-left">
            <label>Forma nomi (faqat siz uchun)</label>
            <input value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Masalan: Dubai reklamasi" />
            <label>Sarlavha</label>
            <input value={f.title} onChange={(e) => set('title', e.target.value)} />
            <label>Qisqa tavsif</label>
            <textarea rows={2} value={f.subtitle} onChange={(e) => set('subtitle', e.target.value)} />
            <label>Afzalliklar (har biri yangi qatorda)</label>
            <textarea rows={3} value={f.benefits.join('\n')} onChange={(e) => set('benefits', e.target.value.split('\n'))} />
            <label>Rasm havolasi (ixtiyoriy)</label>
            <input value={f.image} onChange={(e) => set('image', e.target.value)} placeholder="https://..." />
            <div className="grid g2" style={{ gap: 12 }}>
              <div><label>Tugma matni</label><input value={f.buttonText} onChange={(e) => set('buttonText', e.target.value)} /></div>
              <div><label>Rang</label><input type="color" style={{ height: 40, padding: 2 }} value={f.color} onChange={(e) => set('color', e.target.value)} /></div>
            </div>
            <label>Yuborilgandan keyingi xabar</label>
            <input value={f.successMessage} onChange={(e) => set('successMessage', e.target.value)} />
            <label>Lidlar uchun mas'ul menejer</label>
            <select value={f.manager} onChange={(e) => set('manager', e.target.value)}>
              <option value="">— tanlanmagan —</option>
              {db.users.map((u) => <option key={u.id} value={u.name}>{u.name}</option>)}
            </select>
            <label>Forma maydonlari</label>
            <div className="field-rows">
              {f.fields.map((x, i) => (
                <div className="field-row" key={x.key}>
                  <input type="checkbox" checked={x.enabled} onChange={(e) => setField(i, { enabled: e.target.checked })} title="Yoqish" />
                  <input value={x.label} onChange={(e) => setField(i, { label: e.target.value })} disabled={!x.enabled} />
                  <label className="req-toggle"><input type="checkbox" checked={x.required} disabled={!x.enabled} onChange={(e) => setField(i, { required: e.target.checked })} /> majburiy</label>
                </div>
              ))}
            </div>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 14 }}><input type="checkbox" checked={f.active} onChange={(e) => set('active', e.target.checked)} /> Forma faol (havola ishlaydi)</label>
          </div>
          <div className="editor-right">
            <div className="muted small" style={{ marginBottom: 8 }}>Ko'rinishi</div>
            <div className="preview-frame"><LandingView cfg={preview} preview /></div>
          </div>
        </div>
        <div className="modal-foot">
          {err && <span className="req" style={{ marginRight: 'auto' }}>{err}</span>}
          <button className="btn" onClick={onClose}>Bekor qilish</button>
          <button className="btn primary" onClick={submit}>Saqlash</button>
        </div>
      </div>
    </div>
  )
}

export default function LeadForms() {
  const { db, add, update, remove } = useStore()
  const [edit, setEdit] = useState(null)
  const [embed, setEmbed] = useState(null)
  const forms = db.forms

  const save = (v) => {
    if (v.id) return update('forms', v.id, v)
    add('forms', { ...v, slug: `${slugify(v.name)}-${rnd()}`, views: 0, submissions: 0 })
  }

  return (
    <>
      <PageHead title="Lead formalari va landing sahifalar" sub="Havola yoki sayt orqali lid yig'ing — arizalar avtomatik Lidlar bo'limiga tushadi">
        <Link to="/leads" className="btn"><ArrowLeft size={16} /> Lidlar</Link>
        <button className="btn primary" onClick={() => setEdit({})}><Plus size={16} /> Yangi forma</button>
      </PageHead>
      {!forms.length && <div className="card"><Empty text="Hali forma yaratilmagan. «Yangi forma» tugmasini bosing." /></div>}
      <div className="grid g2">
        {forms.map((f) => {
          const conv = f.views ? Math.round(((f.submissions || 0) / f.views) * 100) : 0
          return (
            <div className="card" key={f.id} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span className="swatch" style={{ width: 8, height: 40, background: f.color, borderRadius: 6 }} />
                <div style={{ flex: 1 }}><b style={{ fontSize: 16 }}>{f.name}</b><div className="muted small">{f.title}</div></div>
                <Badge color={f.active === false ? 'gray' : 'green'}>{f.active === false ? "O'chirilgan" : 'Faol'}</Badge>
              </div>
              <div className="link-box"><span>{urlOf(f)}</span></div>
              <div className="grid g3" style={{ gap: 8 }}>
                <div className="mini"><Eye size={14} /> <b>{f.views || 0}</b><span>ko'rish</span></div>
                <div className="mini"><Users size={14} /> <b>{f.submissions || 0}</b><span>lid</span></div>
                <div className="mini"><b>{conv}%</b><span>konversiya</span></div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <CopyBtn text={urlOf(f)} label="Havola" />
                <a className="btn sm" href={`${urlOf(f)}?preview=1`} target="_blank" rel="noreferrer"><ExternalLink size={14} /> Ochish</a>
                <button className="btn sm" onClick={() => setEmbed(f)}><Code2 size={14} /> Saytga ulash</button>
                <span style={{ marginLeft: 'auto' }}>
                  <button className="icon-btn" onClick={() => setEdit(f)}><Pencil size={16} /></button>
                  <button className="icon-btn" onClick={() => confirmDel('Formani') && remove('forms', f.id)}><Trash2 size={16} /></button>
                </span>
              </div>
            </div>
          )
        })}
      </div>
      {edit && <Editor form={edit.id ? edit : null} onClose={() => setEdit(null)} onSave={save} />}
      {embed && <EmbedModal form={embed} onClose={() => setEmbed(null)} />}
    </>
  )
}
