import { useState, useEffect } from 'react'
import { X, Search } from 'lucide-react'

export function PageHead({ title, sub, children }) {
  return (
    <div className="page-head">
      <div><h1>{title}</h1>{sub && <p>{sub}</p>}</div>
      <div className="actions">{children}</div>
    </div>
  )
}

export function Stat({ label, value, sub, icon: Icon, color = 'blue', soft }) {
  return (
    <div className="card stat">
      <div>
        <div className="lbl">{label}</div>
        <div className="val">{value}</div>
        {sub && <div className="sub">{sub}</div>}
      </div>
      {Icon && <div className={`ico ${soft ? 's-' + color : 'c-' + color}`}><Icon size={22} /></div>}
    </div>
  )
}

const BADGE = { blue: 's-blue', green: 's-green', purple: 's-purple', orange: 's-orange', red: 's-red', yellow: 's-yellow', cyan: 's-cyan', gray: 'tag' }
export const Badge = ({ color = 'gray', children, style }) => <span className={`badge ${BADGE[color]}`} style={style}>{children}</span>
export const HexBadge = ({ color, children }) => <span className="badge" style={{ background: color + '22', color }}>{children}</span>

export function Empty({ icon: Icon, text }) {
  return <div className="empty">{Icon && <Icon size={44} />}<div>{text}</div></div>
}

export function Modal({ title, onClose, children, foot, wide }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? 'wide' : ''}`}>
        <div className="modal-head"><h3>{title}</h3><button className="icon-btn" onClick={onClose}><X size={20} /></button></div>
        {children}
        {foot && <div className="modal-foot">{foot}</div>}
      </div>
    </div>
  )
}

/**
 * Generic form modal.
 * fields: [{key,label,type:'text'|'number'|'date'|'datetime'|'time'|'select'|'textarea'|'email'|'tel'|'checkbox', options:[{value,label}]|string[], required, full}]
 */
export function FormModal({ title, fields, initial = {}, onSave, onClose, submitLabel = 'Saqlash', wide, note }) {
  const [v, setV] = useState(() => {
    const o = { ...initial }
    fields.forEach((f) => { if (o[f.key] === undefined) o[f.key] = f.type === 'checkbox' ? false : f.default ?? (f.type === 'select' ? optVal(f.options?.[0]) : '') })
    return o
  })
  const [err, setErr] = useState('')
  const set = (k, val) => setV((s) => ({ ...s, [k]: val }))
  const submit = (e) => {
    e.preventDefault()
    const miss = fields.find((f) => f.required && !String(v[f.key] ?? '').trim())
    if (miss) return setErr(`"${miss.label}" majburiy`)
    onSave(v)
    onClose()
  }
  return (
    <Modal title={title} onClose={onClose} wide={wide}>
      <form onSubmit={submit} style={{ display: 'contents' }}>
        <div className="modal-body">
          {fields.map((f) => (
            <div key={f.key} className={f.full || f.type === 'textarea' ? 'full' : ''}>
              {f.type !== 'checkbox' && <label>{f.label}{f.required && <span className="req"> *</span>}</label>}
              <Input f={f} value={v[f.key]} onChange={(x) => set(f.key, x)} />
            </div>
          ))}
          {note && <div className="full">{note(v)}</div>}
          {err && <div className="full req">{err}</div>}
        </div>
        <div className="modal-foot">
          <button type="button" className="btn" onClick={onClose}>Bekor qilish</button>
          <button type="submit" className="btn primary">{submitLabel}</button>
        </div>
      </form>
    </Modal>
  )
}

const optVal = (o) => (o && typeof o === 'object' ? o.value : o)
const optLab = (o) => (o && typeof o === 'object' ? o.label : o)

function Input({ f, value, onChange }) {
  const t = f.type || 'text'
  if (t === 'select')
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {(f.options || []).map((o) => <option key={optVal(o)} value={optVal(o)}>{optLab(o)}</option>)}
      </select>
    )
  if (t === 'textarea') return <textarea value={value} onChange={(e) => onChange(e.target.value)} />
  if (t === 'checkbox')
    return <label style={{ display: 'flex', gap: 8, alignItems: 'center', margin: 0 }}><input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />{f.label}</label>
  if (t === 'number') return <input type="number" value={value} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} />
  const map = { datetime: 'datetime-local' }
  return <input type={map[t] || t} value={value} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} />
}

export function SearchInput({ value, onChange, placeholder = 'Qidirish...' }) {
  return <div className="grow"><Search size={16} /><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /></div>
}

export function Chips({ items, value, onChange }) {
  return (
    <div className="chips">
      {items.map(([k, label, Icon]) => (
        <button key={k} className={`chip ${value === k ? 'active' : ''}`} onClick={() => onChange(k)}>{Icon && <Icon size={14} />}{label}</button>
      ))}
    </div>
  )
}

export function Seg({ items, value, onChange }) {
  return (
    <div className="seg">
      {items.map(([k, Icon]) => <button key={k} className={value === k ? 'active' : ''} onClick={() => onChange(k)}><Icon size={17} /></button>)}
    </div>
  )
}

export function exportCSV(name, rows) {
  if (!rows.length) return
  const keys = Object.keys(rows[0])
  const esc = (x) => `"${String(x ?? '').replace(/"/g, '""')}"`
  const csv = '﻿' + [keys.join(','), ...rows.map((r) => keys.map((k) => esc(r[k])).join(','))].join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  a.download = `${name}.csv`
  a.click()
}

export function importCSV(onRows) {
  const inp = document.createElement('input')
  inp.type = 'file'
  inp.accept = '.csv'
  inp.onchange = async () => {
    const text = await inp.files[0].text()
    const [head, ...lines] = text.replace(/^﻿/, '').split(/\r?\n/).filter(Boolean)
    const keys = head.split(',').map((s) => s.replace(/"/g, '').trim())
    onRows(lines.map((l) => { const c = l.split(',').map((s) => s.replace(/^"|"$/g, '')); return Object.fromEntries(keys.map((k, i) => [k, c[i]])) }))
  }
  inp.click()
}

export const confirmDel = (what = 'Ushbu yozuvni') => window.confirm(`${what} o'chirishni tasdiqlaysizmi?`)

export const Dot = ({ color }) => <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }} />

export const initial = (name = '') => (name.trim()[0] || '?').toUpperCase()
