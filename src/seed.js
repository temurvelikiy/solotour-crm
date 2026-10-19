export const RATE_DEFAULT = 12700

const d = (offset = 0, h = 10) => {
  const x = new Date()
  x.setDate(x.getDate() + offset)
  x.setHours(h, 0, 0, 0)
  return x.toISOString()
}
const day = (offset = 0) => d(offset).slice(0, 10)

export const STATUS_SEED = [
  { id: 's1', name: "Yangi so'rov", color: '#3B82F6', order: 1 },
  { id: 's2', name: 'Konsultatsiya', color: '#8B5CF6', order: 2 },
  { id: 's3', name: 'Hujjat tayyorlanmoqda', color: '#F59E0B', order: 3 },
  { id: 's4', name: "To'lov kutilmoqda", color: '#EF4444', order: 4 },
  { id: 's5', name: 'Tasdiqlangan', color: '#10B981', order: 5, sale: true },
  { id: 's6', name: 'Sayohatda', color: '#06B6D4', order: 6 },
  { id: 's7', name: 'Qaytgan/Yakunlandi', color: '#6B7280', order: 7 },
]

const users = [
  { id: 'u1', name: 'Aziz Nazarov', email: 'admin@solotour.uz', role: 'Admin', created: day(-60) },
  { id: 'u2', name: 'Nargiza Umarova', email: 'nargiza@solotour.uz', role: 'Manager', created: day(-50) },
  { id: 'u3', name: 'Sanjar Toshmatov', email: 'sanjar@solotour.uz', role: 'Manager', created: day(-40) },
  { id: 'u4', name: 'Malika Karimova', email: 'malika@solotour.uz', role: 'Manager', created: day(-30) },
]

const names = [
  ['Sevara Qodirova', 'Ispaniya, Dubai', 's2'], ['Mirzo Rahimov', 'Turkiya - Antalya', 's5'],
  ['Dilorom Mamatova', 'Misr - Sharm', 's1'], ['Tohir Usmonov', 'Dubai', 's6'],
  ['Farrux Temirov', 'Yevropa', 's4'], ['Saodat Karimova', 'Umra (Makka)', 's3'],
  ['Jahongir Sobirov', 'Turkiya', 's5'], ['Rustam Aliyev', 'Turkiya - Istanbul', 's7'],
  ['Laziz Eshmatov', 'Gruziya', 's2'], ['Zilola Haydarova', 'Maldiv', 's4'],
  ['Bobur Nematov', 'Tailand', 's1'], ['Nodira Iskandarova', 'Malayziya', 's3'],
]
const clients = names.map(([name, dest, st], i) => ({
  id: 'c' + i, name, phone: `+998 9${i % 5} ${100 + i}-0${i % 9}-0${i % 9}`,
  email: name.split(' ')[0].toLowerCase() + '@mail.uz', status: st,
  passport: `AB${1000000 + i * 4131}`, passportExpiry: day(200 + i * 40),
  destination: dest, groupSize: (i % 6) + 1, vip: i % 5 === 0, source: ['Instagram', 'Telegram', "Qo'ng'iroq", 'Tavsiya'][i % 4],
  notes: '', created: d(-i, 9),
}))

const leads = [
  ['Farrux Temirov', "Qo'lda", 'Yuqori', 55000000, 'Konvertatsiya', 93],
  ['Saodat Karimova', 'Instagram', "O'rta", 15000000, 'Konvertatsiya', 82],
  ['Jahongir Sobirov', 'Tavsiya', 'Shoshilinch', 120000000, 'Konvertatsiya', 98],
  ['Anvar Soliyev', 'Telegram', "O'rta", 18000000, 'Yangi', 40],
  ['Gulnora Yusupova', 'Instagram', 'Past', 9000000, 'Bog\'lanildi', 55],
  ['Oybek Raximov', 'Sayt', 'Yuqori', 32000000, 'Mos', 70],
  ['Kamola Ergasheva', 'Telegram', 'Past', 6000000, 'Mos emas', 15],
].map(([name, source, priority, value, status, score], i) => ({
  id: 'l' + i, name, source, priority, value, status, score,
  phone: `+998 90 22${i}-2${i}-2${i}`, email: name.split(' ')[0].toLowerCase() + '@gmail.com',
  manager: users[(i % 3) + 1].name, tags: ['oilaviy', 'tur'], created: d(-i), notes: '',
}))

const deals = [
  ['Yevropa tur - Qodirova', 18000000, 'Yo\'qotildi', 'u2', 'c0'],
  ['Turkiya tur - Mirzo oilasi 6 kishi', 42000000, 'Yutildi', 'u3', 'c1'],
  ['Yevropa oilaviy tur - Farrux oilasi', 55000000, 'Yutildi', 'u4', 'c4'],
  ['Dubai biznes + shopping tur', 30000000, 'Muzokara', 'u3', 'c3'],
  ['Umra ziyorati - 10 kishilik guruh', 150000000, 'Taklif', 'u2', 'c5'],
  ['Maldiv asal oyi', 48000000, 'Tekshirish', 'u4', 'c9'],
  ['Tailand 2 kishi', 21000000, 'Yangi', 'u2', 'c10'],
].map(([title, amount, stage, owner, clientId], i) => ({
  id: 'd' + i, title, amount, currency: 'UZS', stage, owner, clientId, created: d(-i * 2),
}))

const tours = [
  { id: 't1', name: 'Dubai tur paketi', country: 'BAA', nights: 6, price: 12000000, currency: 'UZS', capacity: 20, booked: 14, start: day(12), transport: 'Aviachipta', hotel: 'Rove Downtown 4*', meal: 'Nonushta', description: 'Burj Khalifa, Desert Safari, Abu Dhabi ekskursiyasi.' },
  { id: 't2', name: 'Turkiya - Antalya (hammasi kiritilgan)', country: 'Turkiya', nights: 7, price: 650, currency: 'USD', capacity: 30, booked: 22, start: day(20), transport: 'Aviachipta', hotel: 'Rixos Premium 5*', meal: 'All inclusive', description: 'Antalya, Kemer, Kappadokiya ekskursiyasi.' },
  { id: 't3', name: 'Umra ziyorati', country: "Saudiya Arabistoni", nights: 10, price: 1450, currency: 'USD', capacity: 40, booked: 38, start: day(35), transport: 'Aviachipta', hotel: 'Makka 4*', meal: 'Nonushta+kechki ovqat', description: 'Makka va Madina. Guruhli.' },
  { id: 't4', name: 'Gruziya - Tbilisi/Batumi', country: 'Gruziya', nights: 5, price: 480, currency: 'USD', capacity: 16, booked: 6, start: day(45), transport: 'Avtobus+Aviachipta', hotel: 'Kopala 4*', meal: 'Nonushta', description: 'Tbilisi, Batumi, Kazbegi.' },
  { id: 't5', name: 'Maldiv asal oyi', country: 'Maldiv', nights: 8, price: 2300, currency: 'USD', capacity: 8, booked: 2, start: day(60), transport: 'Aviachipta', hotel: 'Sun Island 5*', meal: 'Ultra all inclusive', description: 'Premium plyaj dam olish.' },
]

const bookings = [
  { id: 'b1', clientId: 'c1', tourId: 't2', people: 6, total: 3900, currency: 'USD', paid: 2000, status: 'Tasdiqlangan', date: day(-5), manager: 'u3' },
  { id: 'b2', clientId: 'c3', tourId: 't1', people: 2, total: 24000000, currency: 'UZS', paid: 24000000, status: "To'langan", date: day(-9), manager: 'u3' },
  { id: 'b3', clientId: 'c5', tourId: 't3', people: 10, total: 14500, currency: 'USD', paid: 5000, status: 'Kutilmoqda', date: day(-2), manager: 'u2' },
  { id: 'b4', clientId: 'c9', tourId: 't5', people: 2, total: 4600, currency: 'USD', paid: 0, status: 'Kutilmoqda', date: day(-1), manager: 'u4' },
]

const payments = [
  { id: 'p1', bookingId: 'b1', amount: 2000, currency: 'USD', method: 'Naqd', date: day(-4), status: "To'langan" },
  { id: 'p2', bookingId: 'b2', amount: 24000000, currency: 'UZS', method: 'Karta', date: day(-8), status: "To'langan" },
  { id: 'p3', bookingId: 'b3', amount: 5000, currency: 'USD', method: 'Bank', date: day(-1), status: "Qisman to'langan" },
  { id: 'p4', bookingId: 'b3', amount: 9500, currency: 'USD', method: 'Bank', date: day(3), status: 'Kutilmoqda' },
  { id: 'p5', bookingId: 'b1', amount: 1900, currency: 'USD', method: 'Naqd', date: day(-3), status: "Muddati o'tgan" },
]

const visas = [
  { id: 'v1', clientId: 'c0', country: 'Ispaniya (Shengen)', type: 'Turistik', status: 'Hujjat yig\'ilmoqda', submitted: '', expected: day(25), docs: { passport: true, photo: false, bank: false, insurance: false, ticket: false, hotel: false } },
  { id: 'v2', clientId: 'c1', country: 'Turkiya', type: 'Turistik', status: 'Tayyor', submitted: day(-10), expected: day(-2), docs: { passport: true, photo: true, bank: true, insurance: true, ticket: true, hotel: true } },
  { id: 'v3', clientId: 'c5', country: 'Saudiya (Umra)', type: 'Ziyorat', status: 'Topshirilgan', submitted: day(-3), expected: day(7), docs: { passport: true, photo: true, bank: false, insurance: true, ticket: true, hotel: true } },
  { id: 'v4', clientId: 'c4', country: 'Fransiya (Shengen)', type: 'Turistik', status: 'Rad etilgan', submitted: day(-20), expected: day(-6), docs: { passport: true, photo: true, bank: true, insurance: true, ticket: false, hotel: true } },
]

const partners = [
  { id: 'h1', name: 'Uzbekistan Airways', type: 'Aviakompaniya', contact: 'Direktor vakili', phone: '+998 71 140-00-00', email: 'sales@uzairways.uz', country: "O'zbekiston", note: 'Maxsus narxlar, 15% chegirma Istanbulga' },
  { id: 'h2', name: 'Rixos Premium Belek', type: 'Mehmonxona', contact: 'Ayten H.', phone: '+90 242 710-00-00', email: 'res@rixos.com', country: 'Turkiya', note: 'All inclusive kvota' },
  { id: 'h3', name: 'Desert Safari LLC', type: 'Gid / ekskursiya', contact: 'Ahmed', phone: '+971 50 123-45-67', email: 'info@desertsafari.ae', country: 'BAA', note: '' },
  { id: 'h4', name: 'Hajj Express', type: 'Operator', contact: 'Bilol', phone: '+966 55 000-11-22', email: 'ops@hajjexpress.sa', country: 'Saudiya', note: 'Umra paketlari' },
  { id: 'h5', name: 'Silk Transfer', type: 'Transfer', contact: 'Rustam', phone: '+998 90 111-22-33', email: 'rustam@silktransfer.uz', country: "O'zbekiston", note: 'Aeroportdan transfer' },
]

const tasks = [
  ['Oylik hisobot - sotuvlar', 'Bajarilmagan', "O'rta", 5, 'u1'],
  ['Turkiya tur narxini yangilash', 'Bajarilmagan', "O'rta", 1, 'u2'],
  ['Karimov Dubai biznes safari', 'Jarayonda', 'Yuqori', 2, 'u3'],
  ['Instagram yangi tur paketlari', 'Jarayonda', "O'rta", 3, 'u2'],
  ['Mirzo oilasi Turkiya hujjatlari', 'Bajarildi', 'Yuqori', -3, 'u3'],
  ['Evropa oilaviy tur tasdiqlash', 'Bajarildi', 'Yuqori', -4, 'u4'],
  ['Viza topshirish - Qodirova', 'Bajarilmagan', 'Yuqori', -1, 'u2'],
  ['Umra guruhi parvoz chiptalari', 'Bajarilmagan', 'Shoshilinch', -2, 'u2'],
].map(([title, status, priority, off, assignee], i) => ({ id: 'k' + i, title, status, priority, due: day(off), assignee, clientId: '' }))

const reminders = [
  { id: 'r1', title: 'Aliyev oilasi qaytish chiptasini tasdiqlash', type: "Qo'ng'iroq", status: 'Kutilmoqda', at: d(1, 11), clientId: 'c7', note: 'Turkiyadan qaytish chiptasini reconfirm qilish' },
  { id: 'r2', title: 'Umra guruhi parvoz chiptalarini tekshirish', type: 'Vazifa', status: 'Kutilmoqda', at: d(2, 15), clientId: 'c5', note: '10 kishilik guruh uchun Jidda chiptalari' },
  { id: 'r3', title: "Viza natijasini so'rash - Qodirova", type: 'Email', status: 'Kutilmoqda', at: d(4, 10), clientId: 'c0', note: '' },
  { id: 'r4', title: "Dubai tur to'lov eslatmasi", type: "Qo'ng'iroq", status: 'Bajarilgan', at: d(-3, 12), clientId: 'c3', note: '' },
]

const meetings = [
  { id: 'm1', title: 'Aviakompaniya vakili bilan uchrashuv', status: 'Yakunlangan', at: d(-2, 10), end: '12:00', kind: 'Yuzma-yuz', place: 'Agentlik, meeting room', people: 'Direktor, UzAirways vakili', result: "Istanbul yo'nalishi uchun 15% chegirma" },
  { id: 'm2', title: 'Tur natijalarini muhokama', status: 'Yakunlangan', at: d(-5, 14), end: '15:00', kind: 'Yuzma-yuz', place: 'Agentlik, ofis', people: 'Barcha menejerlar', result: "Yangi yo'nalish - Gruziya qo'shildi" },
  { id: 'm3', title: 'Farrux oilasi bilan konsultatsiya', status: 'Rejalashtirilgan', at: d(1, 16), end: '17:00', kind: 'Onlayn', place: 'Zoom', people: 'Farrux Temirov', result: '' },
  { id: 'm4', title: 'Mehmonxona hamkorlari bilan', status: 'Rejalashtirilgan', at: d(3, 11), end: '12:00', kind: 'Yuzma-yuz', place: 'Rixos ofisi', people: 'Sanjar Toshmatov', result: '' },
]

const calls = [
  { id: 'q1', dir: 'Chiquvchi', result: 'Javob yoq', phone: '+998905001012', note: 'Chek qilish eslatmasi, javob bermadi', at: d(-1, 14), duration: 0, user: 'Laziz Eshmatov' },
  { id: 'q2', dir: 'Chiquvchi', result: 'Javob berildi', phone: '+998905001010', note: 'Turkiya turi haqida batafsil maʼlumot berildi, 4 kishilik', at: d(-1, 11), duration: 360, user: 'Rustam Aliyev' },
  { id: 'q3', dir: 'Kiruvchi', result: 'Javob berildi', phone: '+998905001014', note: "Dubai turi narxini so'radi", at: d(-2, 12), duration: 270, user: 'Nargiza Umarova' },
  { id: 'q4', dir: 'Chiquvchi', result: 'Band', phone: '+998905001016', note: '', at: d(-2, 15), duration: 0, user: 'Sanjar Toshmatov' },
]

const fields = [
  { id: 'f1', name: 'passport_expiry', label: 'Pasport muddati', type: 'Sana', required: false, options: [] },
  { id: 'f2', name: 'visa_status', label: 'Viza holati', type: "Tanlov ro'yxati", required: false, options: ["Yo'q", 'Tayyorlanmoqda', 'Tayyor'] },
  { id: 'f3', name: 'travel_destination', label: 'Sayohat yo\'nalishi', type: 'Matn', required: false, options: [] },
  { id: 'f4', name: 'group_size', label: 'Guruh hajmi', type: 'Raqam', required: false, options: [] },
  { id: 'f5', name: 'vip_client', label: 'VIP mijoz', type: 'Belgilagich', required: false, options: [] },
]

export const seed = () => ({
  clients, leads, deals, tours, bookings, payments, visas, partners, tasks, reminders, meetings, calls,
  statuses: STATUS_SEED, users, fields,
  services: tours.map((t) => ({ id: 'sv' + t.id, name: t.name, price: t.price, currency: t.currency, description: t.description, created: day(0) })),
  settings: {
    company: 'Solo Tour', phone: '+998 71 200-00-00', email: 'info@solotour.uz', address: 'Toshkent sh.', rate: RATE_DEFAULT,
    theme: 'light', lang: 'UZ', logo: '', colorMode: 'default', brand: '#2563eb', telegramToken: '', telegramOn: false, plan: 'Demo',
  },
  me: 'u1',
})
