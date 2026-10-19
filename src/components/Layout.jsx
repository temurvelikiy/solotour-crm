import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, BarChart3, Users, Target, Handshake, CreditCard, CheckSquare, Bell, CalendarCheck, Calendar,
  Phone, Briefcase, Settings, UserPlus, Tags, Wrench, ChevronLeft, ChevronRight, Search, Sun, Moon, ChevronDown, Clock, X,
  Map, Ticket, FileCheck, Building2, LogOut, Send, Menu,
} from 'lucide-react'
import { useStore } from '../store'
import { LANGS } from '../i18n'

const NAV = [
  ['/', 'Boshqaruv paneli', LayoutDashboard],
  ['/analytics', 'Analitika', BarChart3],
  ['/clients', 'Mijozlar', Users],
  ['/leads', 'Lidlar', Target],
  ['/deals', 'Bitimlar', Handshake],
  ['/payments', "To'lovlar", CreditCard],
  ['/tasks', 'Vazifalar', CheckSquare],
  ['/reminders', 'Eslatmalar', Bell],
  ['/meetings', 'Uchrashuvlar', CalendarCheck],
  ['/calendar', 'Kalendar', Calendar],
  ['/calls', "Qo'ng'iroqlar", Phone],
  ['/services', 'Xizmatlar', Briefcase],
  ['/settings', 'Sozlamalar', Settings],
]
const TOUR = [
  ['/tours', 'Turlar katalogi', Map],
  ['/bookings', 'Buyurtmalar', Ticket],
  ['/visas', 'Viza va hujjatlar', FileCheck],
  ['/partners', 'Hamkorlar', Building2],
]
const ADMIN = [
  ['/admin/users', 'Foydalanuvchilar', UserPlus],
  ['/admin/statuses', 'Statuslar', Tags],
  ['/admin/fields', 'Custom Fields', Wrench],
]

const Group = ({ items }) => items.map(([to, label, Icon]) => (
  <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>
    <Icon size={20} /><span className="nav-label">{label}</span>
  </NavLink>
))

export default function Layout() {
  const { db, setSettings, logout } = useStore()
  const nav = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  const [langMenu, setLangMenu] = useState(false)
  const lang = (db.settings.lang || 'uz').toLowerCase()
  const [q, setQ] = useState('')
  const me = db.users.find((u) => u.id === db.me) || db.users[0] || { name: ' ', role: '' }
  const dark = db.settings.theme === 'dark'

  const search = (e) => {
    e.preventDefault()
    if (q.trim()) nav(`/clients?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <div className="app">
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${open ? 'open' : ''}`}>
        <div className="brand">
          <div className="logo">{db.settings.logo ? <img src={db.settings.logo} alt="" /> : db.settings.company[0]}</div>
          <span className="brand-name">{db.settings.company}</span>
          <button className="icon-btn" onClick={() => (open ? setOpen(false) : setCollapsed(!collapsed))}>
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
        <nav className="nav" onClick={() => setOpen(false)}>
          <Group items={NAV.slice(0, 12)} />
          <div className="nav-section">TURISTIK MODULLAR</div>
          <Group items={TOUR} />
          <Group items={NAV.slice(12)} />
          {me.role === 'Admin' && <><div className="nav-section">ADMIN PANEL</div><Group items={ADMIN} /></>}
        </nav>
        <div className="side-box">
          <b><span className="dot-online" /> Online</b>
          <div>{me.name}</div><div>{db.settings.company}</div>
        </div>
        <NavLink to="/settings?tab=integrations" className="side-box" style={{ color: 'var(--primary)' }}>
          <b style={{ color: 'var(--primary)' }}><Send size={14} /> Telegram bot</b>
          <div>Telegramdan boshqaring</div>
        </NavLink>
      </aside>

      <div className="main">
        <header className="topbar">
          <button className="icon-btn" style={{ display: window.innerWidth < 760 ? 'grid' : 'none' }} onClick={() => setOpen(true)}><Menu /></button>
          <form className="search-box" onSubmit={search}>
            <Search size={16} />
            <input placeholder="Qidirish..." value={q} onChange={(e) => setQ(e.target.value)} />
          </form>
          <div className="top-right">
            <button className="icon-btn" onClick={() => nav('/reminders')}><Bell size={20} /></button>
            <div style={{ position: 'relative' }}>
              <button className="icon-btn lang" style={{ fontSize: 13, fontWeight: 600, padding: '6px 8px' }} onClick={() => setLangMenu(!langMenu)}>{(LANGS.find((x) => x[0] === lang) || LANGS[0])[1]}</button>
              {langMenu && (
                <div className="menu" onMouseLeave={() => setLangMenu(false)}>
                  {LANGS.map(([code, short, name]) => (
                    <button key={code} style={{ fontWeight: code === lang ? 700 : 400, color: code === lang ? 'var(--primary)' : undefined }} onClick={() => { setSettings({ lang: code }); setLangMenu(false) }}>
                      <span style={{ width: 24, color: 'var(--muted)', fontSize: 12 }}>{short}</span>{name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="icon-btn" onClick={() => setSettings({ theme: dark ? 'light' : 'dark' })}>{dark ? <Moon size={20} /> : <Sun size={20} />}</button>
            <div className="user-chip" onClick={() => setMenu(!menu)}>
              <div className="avatar">{me.name[0]}</div>
              <div><b>{me.name}</b><small>{me.role}</small></div>
              <ChevronDown size={16} />
              {menu && (
                <div className="menu" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => { setMenu(false); nav('/settings') }}><Settings size={16} /> Sozlamalar</button>
                  <button onClick={logout}><LogOut size={16} /> Chiqish</button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="content">
          <Outlet />
          <div className="footer">
            <span>© 2026 {db.settings.company} CRM. Barcha huquqlar himoyalangan.</span>
            <span>Yordam<span>Bog'lanish</span><span>v1.0.0</span></span>
          </div>
        </main>
      </div>
    </div>
  )
}
