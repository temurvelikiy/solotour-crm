import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import './styles.css'
import { StoreProvider, useStore } from './store'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import Clients from './pages/Clients'
import Leads from './pages/Leads'
import Deals from './pages/Deals'
import Payments from './pages/Payments'
import Tasks from './pages/Tasks'
import Reminders from './pages/Reminders'
import Meetings from './pages/Meetings'
import CalendarPage from './pages/CalendarPage'
import Calls from './pages/Calls'
import Services from './pages/Services'
import SettingsPage from './pages/SettingsPage'
import Users from './pages/Users'
import Statuses from './pages/Statuses'
import Fields from './pages/Fields'
import Tours from './pages/Tours'
import Bookings from './pages/Bookings'
import Visas from './pages/Visas'
import Partners from './pages/Partners'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import { setLanguage } from './i18n'

function I18n() {
  const { db } = useStore()
  const lang = (db.settings.lang || 'uz').toLowerCase()
  useEffect(() => { setLanguage(['uz', 'ru', 'en', 'kk', 'tg'].includes(lang) ? lang : 'uz') }, [lang])
  return null
}

function Guard({ children }) {
  const { auth, booting, bootError, retry } = useStore()
  if (booting) return <div style={{ padding: 40, color: 'var(--muted)' }}>...</div>
  if (bootError) return <div style={{ padding: 40 }}><p>{bootError}</p><button className="btn primary" onClick={retry}>Qayta urinish</button></div>
  return auth ? children : <Navigate to="/login" replace />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StoreProvider>
      <I18n />
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/reset" element={<ResetPassword />} />
          <Route element={<Guard><Layout /></Guard>}>
            <Route index element={<Dashboard />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="clients" element={<Clients />} />
            <Route path="leads" element={<Leads />} />
            <Route path="deals" element={<Deals />} />
            <Route path="payments" element={<Payments />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="reminders" element={<Reminders />} />
            <Route path="meetings" element={<Meetings />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="calls" element={<Calls />} />
            <Route path="services" element={<Services />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="tours" element={<Tours />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="visas" element={<Visas />} />
            <Route path="partners" element={<Partners />} />
            <Route path="admin/users" element={<Users />} />
            <Route path="admin/statuses" element={<Statuses />} />
            <Route path="admin/fields" element={<Fields />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </StoreProvider>
  </StrictMode>
)
