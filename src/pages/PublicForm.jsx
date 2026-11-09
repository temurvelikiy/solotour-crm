import { useEffect, useState } from 'react'
import LandingView from '../components/LandingView'

// Public landing page / embeddable form: /f/:slug  (add ?embed=1 for the form only)
export default function PublicForm({ slug }) {
  const sp = new URLSearchParams(window.location.search)
  const embed = sp.get('embed') === '1'
  const [cfg, setCfg] = useState(null)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    fetch(`/api/public/forms/${encodeURIComponent(slug)}${sp.get('preview') === '1' ? '?preview=1' : ''}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((c) => { setCfg(c); document.title = c.title || c.company || 'Forma' })
      .catch(() => setMissing(true))
  }, [slug])

  if (missing) return <div className="lp-center">Bu sahifa topilmadi yoki o'chirilgan.</div>
  if (!cfg) return <div className="lp-center">...</div>

  const utm = Object.fromEntries([...sp.entries()].filter(([k]) => k.startsWith('utm_')))
  const onSubmit = async (answers, hp) => {
    let r
    try {
      r = await fetch(`/api/public/forms/${encodeURIComponent(slug)}/submit`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers, utm, hp }),
      })
    } catch { throw new Error("Internet bilan aloqa yo'q. Qayta urinib ko'ring") }
    const d = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(d.error || 'Xatolik')
  }
  return <LandingView cfg={cfg} embed={embed} onSubmit={onSubmit} />
}
