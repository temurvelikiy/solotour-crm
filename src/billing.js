// CRM subscription pricing: per user, per month. Admin accounts are free.
export const PRICE_PER_USER = 159000
export const FREE_ROLES = ['Admin']
export const isFree = (role) => FREE_ROLES.includes(role)
export const monthlyTotal = (users) => users.filter((u) => !isFree(u.role)).length * PRICE_PER_USER

export const PAY_WITHIN_HOURS = 24
export const tgHandle = (v = '') => String(v).trim().replace(/^https?:\/\/t\.me\//i, '').replace(/^@/, '').replace(/\/.*$/, '')
export const tgLink = (handle, text) => `https://t.me/${tgHandle(handle)}?text=${encodeURIComponent(text)}`

// Payment periods. `months` = access period, `pay` = months actually charged (yearly: pay 10, get 2 bonus months).
export const PLANS = [
  { months: 1, pay: 1 },
  { months: 3, pay: 3 },
  { months: 6, pay: 6 },
  { months: 12, pay: 10 },
]
export const planTotal = (users, plan) => monthlyTotal(users) * plan.pay
