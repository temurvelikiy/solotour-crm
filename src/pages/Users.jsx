import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { useStore, fdate, fmt } from '../store'
import { PageHead, FormModal, confirmDel, Modal } from '../components/ui'
import { Send } from 'lucide-react'
import { PRICE_PER_USER, isFree, PAY_WITHIN_HOURS, tgHandle, tgLink } from '../billing'

export default function Users() {
  const { db, add, update, remove } = useStore()
  const [q, setQ] = useState('')
  const [form, setForm] = useState(null)
  const [pay, setPay] = useState(null)
  const list = db.users.filter((u) => !q || (u.name + u.email).toLowerCase().includes(q.toLowerCase()))
  const fields = [
    { key: 'name', label: 'Ism familiya', required: true }, { key: 'email', label: 'Email', type: 'email', required: true },
    { key: 'role', label: 'Rol', type: 'select', options: ['Admin', 'Manager', 'Operator', 'Buxgalter'] },
    { key: 'password', label: form?.id ? "Yangi parol (o'zgartirmasangiz bo'sh qoldiring)" : 'Parol (kamida 6 belgi)', type: 'password', required: !form?.id },
  ]
  return (
    <>
      <PageHead title="Foydalanuvchilar" sub="Tizim foydalanuvchilari ro'yxati"><button className="btn primary" onClick={() => setForm({})}>Yangi foydalanuvchi</button></PageHead>
      <div className="info-box">Admin uchun to'lov yo'q. Boshqa rollardagi har bir foydalanuvchi uchun oyiga {fmt(PRICE_PER_USER)} so'm hisoblanadi.</div>
      <input style={{ maxWidth: 480, marginBottom: 20 }} placeholder="Foydalanuvchini qidirish..." value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="card table-wrap" style={{ padding: 0 }}><table>
        <thead><tr><th>Ism</th><th>Email</th><th>Rol</th><th>Qo'shilgan sana</th><th>Amallar</th></tr></thead>
        <tbody>{list.map((u) => (
          <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.role} {isFree(u.role) && <span className="badge s-green">Bepul</span>}</td><td>{fdate(u.created)}</td>
            <td><button className="icon-btn" onClick={() => setForm(u)}><Pencil size={16} /></button>
              <button className="icon-btn" style={{ color: '#dc2626' }} disabled={u.id === db.me} onClick={() => confirmDel('Foydalanuvchini') && remove('users', u.id)}><Trash2 size={16} /></button></td></tr>))}</tbody></table></div>
      {form && <FormModal title={form.id ? 'Foydalanuvchini tahrirlash' : 'Yangi foydalanuvchi'} fields={fields} initial={form.id ? form : { role: 'Manager' }} onClose={() => setForm(null)} onSave={(v) => { const d = { ...v }; if (!d.password) delete d.password; if (form.id) return update('users', form.id, d); add('users', d); if (!isFree(d.role)) setPay(d) }} />}
      {pay && (() => {
        const handle = tgHandle(db.settings.paymentTelegram)
        const msg = `Salom! ${db.settings.company} CRM'ga yangi foydalanuvchi qo'shdim: ${pay.name} (${pay.email}). Obuna to'lovi: ${fmt(PRICE_PER_USER)} so'm / oy. To'lovni amalga oshiraman.`
        return (
          <Modal title="Foydalanuvchi qo'shildi" onClose={() => setPay(null)}
            foot={<><button className="btn" onClick={() => setPay(null)}>Keyinroq</button>
              {handle && <a className="btn primary" href={tgLink(handle, msg)} target="_blank" rel="noreferrer" onClick={() => setPay(null)}><Send size={16} /> Telegramda to'lov qilish</a>}</>}>
            <div className="modal-body" style={{ display: 'block' }}>
              <p style={{ marginTop: 0 }}><b>{pay.name}</b> tizimga qo'shildi. Bu foydalanuvchi uchun oyiga <b>{fmt(PRICE_PER_USER)} so'm</b> to'lanadi.</p>
              <div className="info-box" style={{ marginBottom: 0 }}>Iltimos, {PAY_WITHIN_HOURS} soat ichida to'lov qiling. To'lov uchun Telegram orqali bog'laning.</div>
              {!handle && <p className="muted small">To'lov uchun Telegram hali sozlanmagan. Sozlamalar → Tarif va to'lov bo'limida kiriting.</p>}
            </div>
          </Modal>
        )
      })()}
    </>
  )
}
