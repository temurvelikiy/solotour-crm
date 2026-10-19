import { useState } from 'react'
import { Send } from 'lucide-react'
import { useStore, fmt } from '../store'
import { FormModal, Modal } from './ui'
import { PRICE_PER_USER, isFree, monthlyTotal, PAY_WITHIN_HOURS, tgHandle, tgLink } from '../billing'

/**
 * Add / edit a user. `form` is null (closed), {} (new user) or an existing user row.
 * Shows the monthly cost live while filling the form, and after adding a paid user
 * sends the admin to Telegram to pay within 24 hours.
 */
export default function UserFlow({ form, onClose }) {
  const { db, add, update } = useStore()
  const [pay, setPay] = useState(null)

  const fields = form && [
    { key: 'name', label: 'Ism familiya', required: true }, { key: 'email', label: 'Email', type: 'email', required: true },
    { key: 'role', label: 'Rol', type: 'select', options: ['Admin', 'Manager', 'Operator', 'Buxgalter'] },
    { key: 'password', label: form.id ? "Yangi parol (o'zgartirmasangiz bo'sh qoldiring)" : 'Parol (kamida 6 belgi)', type: 'password', required: !form.id },
  ]

  const note = (v) => {
    if (form.id) return null
    const free = isFree(v.role)
    const now = monthlyTotal(db.users)
    return (
      <div className="info-box" style={{ marginBottom: 0 }}>
        {free
          ? <>Admin foydalanuvchi uchun to'lov yo'q (bepul).</>
          : <>Bu foydalanuvchi uchun oyiga <b>+{fmt(PRICE_PER_USER)} so'm</b> qo'shiladi. Jami oylik to'lov: {fmt(now)} → <b>{fmt(now + PRICE_PER_USER)} so'm</b>.</>}
      </div>
    )
  }

  const save = (v) => {
    const d = { ...v }
    if (!d.password) delete d.password
    if (form.id) return update('users', form.id, d)
    add('users', d)
    if (!isFree(d.role)) setPay(d)
  }

  const handle = tgHandle(db.settings.paymentTelegram)
  const msg = pay && `Salom! ${db.settings.company} CRM'ga yangi foydalanuvchi qo'shdim: ${pay.name} (${pay.email}). Obuna to'lovi: ${fmt(PRICE_PER_USER)} so'm / oy. To'lovni amalga oshiraman.`

  return (
    <>
      {form && <FormModal title={form.id ? 'Foydalanuvchini tahrirlash' : 'Yangi foydalanuvchi'} fields={fields} initial={form.id ? form : { role: 'Manager' }} note={note} onClose={onClose} onSave={save} />}
      {pay && (
        <Modal title="Foydalanuvchi qo'shildi" onClose={() => setPay(null)}
          foot={<><button className="btn" onClick={() => setPay(null)}>Keyinroq</button>
            {handle && <a className="btn primary" href={tgLink(handle, msg)} target="_blank" rel="noreferrer" onClick={() => setPay(null)}><Send size={16} /> Telegramda to'lov qilish</a>}</>}>
          <div className="modal-body" style={{ display: 'block' }}>
            <p style={{ marginTop: 0 }}><b>{pay.name}</b> tizimga qo'shildi. Bu foydalanuvchi uchun oyiga <b>{fmt(PRICE_PER_USER)} so'm</b> to'lanadi.</p>
            <div className="info-box" style={{ marginBottom: 0 }}>Iltimos, {PAY_WITHIN_HOURS} soat ichida to'lov qiling. To'lov uchun Telegram orqali bog'laning.</div>
            {!handle && <p className="muted small">To'lov uchun Telegram hali sozlanmagan. Sozlamalar → Tarif va to'lov bo'limida kiriting.</p>}
          </div>
        </Modal>
      )}
    </>
  )
}
