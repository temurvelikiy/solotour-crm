import { useState } from 'react'
import { Minus, Plus, Send } from 'lucide-react'
import { useStore, fmt } from '../store'
import { PRICE_PER_USER, PLANS, PAY_WITHIN_HOURS, tgHandle, tgLink, isFree } from '../billing'

const periodLabel = (m) => (m === 12 ? '1 yil' : m === 24 ? '2 yil' : `${m} oy`)

export default function PriceCalculator() {
  const { db } = useStore()
  const paid = db.users.filter((u) => !isFree(u.role)).length
  const [count, setCount] = useState(Math.max(1, paid))
  const [months, setMonths] = useState(12)
  const n = Math.max(1, Number(count) || 1)
  const plan = PLANS.find((p) => p.months === months) || PLANS[0]
  const bonus = plan.months - plan.pay
  const monthly = PRICE_PER_USER * n
  const total = monthly * plan.pay
  const handle = tgHandle(db.settings.paymentTelegram)
  const msg = `Salom! ${db.settings.company} CRM obunasini to'lamoqchiman: ${n} ta foydalanuvchi, ${periodLabel(plan.months)}${bonus ? ` (+${bonus} oy bonus)` : ''}. Jami: ${fmt(total)} so'm.`

  return (
    <div className="calc card">
      <div className="calc-main">
        <div className="calc-title">Foydalanuvchilar soni:</div>
        <div className="calc-row">
          <span className="muted">{fmt(PRICE_PER_USER)} so'm/oy</span><span className="muted">×</span>
          <div className="stepper">
            <button type="button" className="btn" onClick={() => setCount(Math.max(1, n - 1))} aria-label="-"><Minus size={16} /></button>
            <input type="number" min={1} value={count} onChange={(e) => setCount(e.target.value === '' ? '' : Math.max(1, Math.floor(Number(e.target.value))))} onBlur={() => setCount(n)} />
            <button type="button" className="btn" onClick={() => setCount(n + 1)} aria-label="+"><Plus size={16} /></button>
          </div>
          <span className="muted">=</span><b className="calc-monthly">{fmt(monthly)} so'm/oy</b>
        </div>
        <hr />
        <div className="periods" style={{ '--cols': PLANS.length }}>
          {PLANS.map((p) => {
            const b = p.months - p.pay
            const sel = p.months === months
            return (
              <button type="button" key={p.months} className={`period ${sel ? 'sel' : ''}`} onClick={() => setMonths(p.months)}>
                <span className="p-label">{periodLabel(p.months)}</span>
                <span className="p-dot" />
                <span className="p-bonus">{b ? `${b} oy sovg'a` : ''}</span>
                <b className="p-price">{fmt(monthly * p.pay)} so'm</b>
              </button>
            )
          })}
        </div>
      </div>
      <div className="calc-side">
        <div className="calc-title">Summa:</div>
        <div className="calc-total">{fmt(total)} so'm</div>
        {bonus > 0 && <div className="calc-gift">{bonus} oy sovg'a</div>}
        <div className="muted small">{n} ta foydalanuvchi · {periodLabel(plan.months)}{bonus ? ` (${plan.pay} oy to'lov)` : ''}</div>
        {handle
          ? <a className="btn primary calc-order" href={tgLink(handle, msg)} target="_blank" rel="noreferrer"><Send size={16} /> Buyurtma berish</a>
          : <div className="muted small" style={{ marginTop: 12 }}>To'lov uchun Telegram hali sozlanmagan.</div>}
        <div className="muted small" style={{ marginTop: 8 }}>Buyurtmadan keyin {PAY_WITHIN_HOURS} soat ichida to'lov qiling.</div>
      </div>
    </div>
  )
}
