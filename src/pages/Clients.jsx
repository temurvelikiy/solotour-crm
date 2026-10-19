import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LayoutGrid, List, Columns, Phone, Mail, MoreVertical, Upload, Download, Plus, Trash2, Pencil, Star } from 'lucide-react'
import { useStore, fdate } from '../store'
import { PageHead, SearchInput, Seg, FormModal, HexBadge, exportCSV, importCSV, confirmDel, Empty, Modal } from '../components/ui'

const CF_TYPE = { Matn: 'text', Raqam: 'number', Sana: 'date', Belgilagich: 'checkbox', "Tanlov ro'yxati": 'select', Email: 'email', Telefon: 'tel' }

export function ClientForm({ initial, onSave, onClose }) {
  const { db } = useStore()
  const custom = db.fields.map((f) => ({
    key: 'cf_' + f.name, label: f.label || f.name, required: f.required, type: CF_TYPE[f.type] || 'text',
    options: f.type === "Tanlov ro'yxati" ? ['', ...f.options] : undefined,
  }))
  const flat = { ...initial }
  Object.entries(initial?.custom || {}).forEach(([k, v]) => (flat['cf_' + k] = v))
  const fields = [
    { key: 'name', label: 'Ism familiya', required: true },
    { key: 'phone', label: 'Telefon', type: 'tel', required: true, placeholder: '+998 90 123-45-67' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'status', label: 'Status', type: 'select', options: db.statuses.map((s) => ({ value: s.id, label: s.name })) },
    { key: 'source', label: 'Manba', type: 'select', options: ['Instagram', 'Telegram', "Qo'ng'iroq", 'Tavsiya', 'Sayt', 'Boshqa'] },
    { key: 'passport', label: 'Pasport raqami' },
    { key: 'destination', label: "Sayohat yo'nalishi" },
    ...custom,
    { key: 'notes', label: 'Izoh', type: 'textarea' },
  ]
  return (
    <FormModal
      wide title={initial?.id ? 'Mijozni tahrirlash' : 'Yangi mijoz'} fields={fields} initial={flat} onClose={onClose}
      onSave={(v) => {
        const c = {}, rest = {}
        Object.entries(v).forEach(([k, val]) => (k.startsWith('cf_') ? (c[k.slice(3)] = val) : (rest[k] = val)))
        onSave({ ...rest, custom: c })
      }}
    />
  )
}

function Detail({ c, onClose, onEdit }) {
  const { db } = useStore()
  const s = db.statuses.find((x) => x.id === c.status)
  const bookings = db.bookings.filter((b) => b.clientId === c.id)
  const visas = db.visas.filter((v) => v.clientId === c.id)
  const deals = db.deals.filter((d) => d.clientId === c.id)
  const rows = [['Telefon', c.phone], ['Email', c.email || '-'], ['Manba', c.source || '-'], ['Pasport', c.passport || '-'], ["Yo'nalish", c.destination || '-'], ["Qo'shilgan", fdate(c.created)]]
  return (
    <Modal title={c.name} onClose={onClose} wide foot={<button className="btn primary" onClick={onEdit}><Pencil size={14} /> Tahrirlash</button>}>
      <div className="modal-body">
        <div className="full">{s && <HexBadge color={s.color}>{s.name}</HexBadge>} {c.vip && <span className="badge s-yellow"><Star size={12} /> VIP</span>}</div>
        {rows.map(([k, v]) => <div key={k}><div className="muted small">{k}</div><b>{v}</b></div>)}
        {Object.entries(c.custom || {}).map(([k, v]) => <div key={k}><div className="muted small">{k}</div><b>{String(v) || '-'}</b></div>)}
        <div className="full"><div className="muted small">Buyurtmalar: {bookings.length} · Viza: {visas.length} · Bitimlar: {deals.length}</div></div>
        {c.notes && <div className="full"><div className="muted small">Izoh</div>{c.notes}</div>}
      </div>
    </Modal>
  )
}

export default function Clients() {
  const { db, add, update, remove, setCol } = useStore()
  const [sp] = useSearchParams()
  const [q, setQ] = useState(sp.get('q') || '')
  const [status, setStatus] = useState('all')
  const [view, setView] = useState('grid')
  const [form, setForm] = useState(null)
  const [detail, setDetail] = useState(null)
  const [menu, setMenu] = useState(null)
  const [drag, setDrag] = useState(null)

  const list = useMemo(() => db.clients.filter((c) => {
    const t = q.toLowerCase()
    return (status === 'all' || c.status === status) && (!t || [c.name, c.phone, c.email, c.destination].some((x) => (x || '').toLowerCase().includes(t)))
  }), [db.clients, q, status])
  const st = (id) => db.statuses.find((s) => s.id === id)
  const sorted = [...db.statuses].sort((a, b) => a.order - b.order)

  const del = (c) => confirmDel(`"${c.name}" mijozini`) && remove('clients', c.id)
  const Extra = ({ c }) => (
    <div className="extra">
      {c.passportExpiry && <span>passport_expiry: <b style={{ color: 'var(--text)' }}>{fdate(c.passportExpiry)}</b></span>}
      {c.destination && <span>destination: <b style={{ color: 'var(--text)' }}>{c.destination}</b></span>}
      {c.groupSize ? <span>group_size: <b style={{ color: 'var(--text)' }}>{c.groupSize}</b></span> : null}
      {Object.entries(c.custom || {}).map(([k, v]) => v !== '' && v !== false && <span key={k}>{k}: <b style={{ color: 'var(--text)' }}>{String(v)}</b></span>)}
    </div>
  )

  const Card = ({ c }) => {
    const s = st(c.status)
    return (
      <div className="card ccard">
        <div className="top">
          <div className="avatar soft" style={{ width: 52, height: 52, fontSize: 18 }}>{c.name[0]}</div>
          <div style={{ flex: 1 }}><div className="name">{c.name} {c.vip && <Star size={14} color="#eab308" fill="#eab308" />}</div>
            {s && (
              <select className="status-select" value={c.status} style={{ background: s.color + '22', color: s.color, border: `1px solid ${s.color}44` }} onChange={(e) => update('clients', c.id, { status: e.target.value })}>
                {sorted.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            )}</div>
          <div style={{ position: 'relative' }}>
            <button className="icon-btn" onClick={() => setMenu(menu === c.id ? null : c.id)}><MoreVertical size={18} /></button>
            {menu === c.id && (
              <div className="menu" onMouseLeave={() => setMenu(null)}>
                <button onClick={() => { setMenu(null); setForm(c) }}><Pencil size={14} /> Tahrirlash</button>
                <button onClick={() => { setMenu(null); del(c) }} style={{ color: '#dc2626' }}><Trash2 size={14} /> O'chirish</button>
              </div>
            )}
          </div>
        </div>
        <div className="line"><Phone size={16} />{c.phone}</div>
        {c.email && <div className="line"><Mail size={16} />{c.email}</div>}
        <Extra c={c} />
        <div className="foot"><span>{fdate(c.created)}</span><button className="btn sm" onClick={() => setDetail(c)}>Batafsil</button></div>
      </div>
    )
  }

  return (
    <>
      <PageHead title="Mijozlar" sub="Barcha mijozlaringizni bir joyda boshqaring">
        <button className="btn" onClick={() => importCSV((rows) => rows.forEach((r) => add('clients', { status: 's1', ...r })))}><Upload size={16} /> Import</button>
        <button className="btn" onClick={() => exportCSV('mijozlar', list.map(({ custom, ...r }) => r))}><Download size={16} /> Eksport</button>
        <button className="btn primary" onClick={() => setForm({})}><Plus size={16} /> Yangi mijoz</button>
      </PageHead>
      <div className="card toolbar">
        <SearchInput value={q} onChange={setQ} placeholder="Mijozlarni qidirish..." />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">Barchasi</option>
          {sorted.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <Seg value={view} onChange={setView} items={[['grid', LayoutGrid], ['list', List], ['kanban', Columns]]} />
      </div>
      <div className="found">{list.length} ta mijoz topildi</div>
      {!list.length && <Empty text="Mijozlar topilmadi" />}
      {view === 'grid' && <div className="grid g2">{list.map((c) => <Card key={c.id} c={c} />)}</div>}
      {view === 'list' && list.length > 0 && (
        <div className="card table-wrap" style={{ padding: 0 }}>
          <table>
            <thead><tr><th>Ism</th><th>Telefon</th><th>Email</th><th>Status</th><th>Yo'nalish</th><th>Sana</th><th /></tr></thead>
            <tbody>{list.map((c) => { const s = st(c.status); return (
              <tr key={c.id}>
                <td><b>{c.name}</b></td><td>{c.phone}</td><td>{c.email}</td><td>{s && <HexBadge color={s.color}>{s.name}</HexBadge>}</td>
                <td>{c.destination}</td><td>{fdate(c.created)}</td>
                <td><button className="icon-btn" onClick={() => setDetail(c)}><List size={16} /></button><button className="icon-btn" onClick={() => setForm(c)}><Pencil size={16} /></button><button className="icon-btn" onClick={() => del(c)}><Trash2 size={16} /></button></td>
              </tr>) })}</tbody>
          </table>
        </div>
      )}
      {view === 'kanban' && (
        <div className="kanban">
          {sorted.map((s) => (
            <div key={s.id} className="col" onDragOver={(e) => e.preventDefault()} onDrop={() => drag && update('clients', drag, { status: s.id })}>
              <div className="col-head"><span style={{ width: 10, height: 10, borderRadius: '50%', background: s.color }} />{s.name}<span className="cnt">{list.filter((c) => c.status === s.id).length}</span></div>
              {list.filter((c) => c.status === s.id).map((c) => (
                <div key={c.id} className="kcard" draggable onDragStart={() => setDrag(c.id)} onClick={() => setDetail(c)}>
                  <div className="t">{c.name}</div><div className="m"><Phone size={12} />{c.phone}</div><div className="m">{c.destination}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      {form && <ClientForm initial={form.id ? form : undefined} onClose={() => setForm(null)} onSave={(v) => (form.id ? update('clients', form.id, v) : add('clients', { status: 's1', ...v }))} />}
      {detail && <Detail c={db.clients.find((x) => x.id === detail.id) || detail} onClose={() => setDetail(null)} onEdit={() => { setForm(detail); setDetail(null) }} />}
    </>
  )
}
