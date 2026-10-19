import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { useStore, fdate, fmt } from '../store'
import { PageHead, FormModal, confirmDel } from '../components/ui'
import { PRICE_PER_USER, isFree } from '../billing'

export default function Users() {
  const { db, add, update, remove } = useStore()
  const [q, setQ] = useState('')
  const [form, setForm] = useState(null)
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
      {form && <FormModal title={form.id ? 'Foydalanuvchini tahrirlash' : 'Yangi foydalanuvchi'} fields={fields} initial={form.id ? form : { role: 'Manager' }} onClose={() => setForm(null)} onSave={(v) => { const d = { ...v }; if (!d.password) delete d.password; form.id ? update('users', form.id, d) : add('users', d) }} />}
    </>
  )
}
