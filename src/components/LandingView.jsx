import { useState } from 'react'
import { CheckCircle2, Check } from 'lucide-react'

export const FIELD_PRESETS = [
  { key: 'name', label: 'Ismingiz', type: 'text', required: true, enabled: true },
  { key: 'phone', label: 'Telefon raqamingiz', type: 'tel', required: true, enabled: true },
  { key: 'email', label: 'Email', type: 'email', required: false, enabled: false },
  { key: 'destination', label: "Qaysi yo'nalish qiziqtiradi?", type: 'text', required: false, enabled: false },
  { key: 'people', label: 'Necha kishi?', type: 'number', required: false, enabled: false },
  { key: 'date', label: 'Sayohat sanasi', type: 'date', required: false, enabled: false },
  { key: 'message', label: 'Izoh', type: 'textarea', required: false, enabled: false },
]

export const DEFAULT_FORM = {
  title: 'Orzuingizdagi sayohatni birga rejalashtiramiz',
  subtitle: "So'rov qoldiring — menejerimiz 15 daqiqa ichida siz bilan bog'lanadi.",
  benefits: ['Eng yaxshi narxlar kafolati', 'Viza va hujjatlarda yordam', '24/7 qo\'llab-quvvatlash'],
  image: '',
  buttonText: 'Bepul konsultatsiya olish',
  successMessage: "Rahmat! So'rovingiz qabul qilindi, tez orada siz bilan bog'lanamiz.",
  color: '#2563eb',
  fields: FIELD_PRESETS,
}

/**
 * The landing page + lead form. Used for the public page (/f/:slug), the embed (?embed=1) and the live preview in the editor.
 * `onSubmit(answers)` must return a promise; reject with an Error to show its message.
 */
export default function LandingView({ cfg, embed = false, preview = false, onSubmit }) {
  const [vals, setVals] = useState({})
  const [hp, setHp] = useState('')
  const [state, setState] = useState('idle') // idle | busy | done
  const [err, setErr] = useState('')
  const fields = (cfg.fields || []).filter((f) => f.enabled)
  const color = cfg.color || '#2563eb'

  const submit = async (e) => {
    e.preventDefault()
    if (preview) return setState('done')
    setState('busy'); setErr('')
    try { await onSubmit(vals, hp); setState('done') } catch (x) { setErr(x.message || 'Xatolik'); setState('idle') }
  }

  const card = (
    <form className="lp-card" onSubmit={submit}>
      {state === 'done' ? (
        <div className="lp-done">
          <CheckCircle2 size={52} color={color} />
          <p>{cfg.successMessage}</p>
          {preview && <button type="button" className="lp-link" onClick={() => { setState('idle'); setVals({}) }}>Qayta ko'rish</button>}
        </div>
      ) : (
        <>
          {embed && cfg.title && <h2 className="lp-card-title">{cfg.title}</h2>}
          {fields.map((f) => (
            <label key={f.key} className="lp-field">
              <span>{f.label}{f.required && <i> *</i>}</span>
              {f.type === 'textarea'
                ? <textarea value={vals[f.key] || ''} onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })} required={f.required} rows={3} />
                : <input type={f.type} value={vals[f.key] || ''} onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })} required={f.required} min={f.type === 'number' ? 1 : undefined} />}
            </label>
          ))}
          {/* honeypot: hidden from people, bots fill it */}
          <input className="lp-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={hp} onChange={(e) => setHp(e.target.value)} />
          {err && <div className="lp-err">{err}</div>}
          <button className="lp-btn" style={{ background: color }} disabled={state === 'busy'}>{state === 'busy' ? '...' : cfg.buttonText || 'Yuborish'}</button>
        </>
      )}
    </form>
  )

  if (embed) return <div className="lp lp-embed">{card}</div>

  return (
    <div className="lp" style={{ '--lp': color }}>
      <header className="lp-head">
        {cfg.logo ? <img src={cfg.logo} alt="" /> : <span className="lp-logo" style={{ background: color }}>{(cfg.company || 'C')[0]}</span>}
        <b>{cfg.company}</b>
      </header>
      <main className="lp-main">
        <section className="lp-hero">
          <h1>{cfg.title}</h1>
          {cfg.subtitle && <p className="lp-sub">{cfg.subtitle}</p>}
          <ul className="lp-benefits">
            {(cfg.benefits || []).filter(Boolean).map((b, i) => <li key={i}><Check size={16} color="#fff" style={{ background: color, borderRadius: '50%', padding: 3, flexShrink: 0 }} />{b}</li>)}
          </ul>
          {cfg.image && <img className="lp-image" src={cfg.image} alt="" />}
        </section>
        <section>{card}</section>
      </main>
    </div>
  )
}
