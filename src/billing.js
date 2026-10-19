// CRM subscription pricing: per user, per month. Admin accounts are free.
export const PRICE_PER_USER = 159000
export const FREE_ROLES = ['Admin']
export const isFree = (role) => FREE_ROLES.includes(role)
export const monthlyTotal = (users) => users.filter((u) => !isFree(u.role)).length * PRICE_PER_USER
