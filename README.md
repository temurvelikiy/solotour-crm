# SoloTour CRM

Turistik firma uchun CRM (React + Vite frontend, Express + SQLite backend).

## Lokal ishga tushirish

```bash
npm install
npm run server      # API: http://localhost:3001 (SQLite: server/data/crm.db)
npm run dev         # Frontend: http://localhost:5173 (/api -> :3001 proxy)
```

Birinchi ishga tushishda admin hisob yaratiladi (parol konsolga chiqadi).
Namuna ma'lumotlar bilan sinash uchun: `SEED_DEMO=1 npm run server` (bo'sh bazada).

## Muhit o'zgaruvchilari
`PORT`, `DB_FILE` (SQLite fayl yo'li; Railway'da `/data/crm.db`), `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`,
`JWT_SECRET` (bo'lmasa avtomatik yaratiladi), `CORS_ORIGIN` (frontend boshqa domenda bo'lsa), `SEED_DEMO`.

## Railway
`Dockerfile` + `railway.json`. Servisga `/data` volume ulang va yuqoridagi o'zgaruvchilarni qo'ying;
`railway up` bilan deploy qilinadi.

## Rollar
- **Admin** — hammasi (foydalanuvchilar, statuslar, custom fields, sozlamalar)
- **Manager** — mijoz, lid, bitim, to'lov, tur, buyurtma, viza, hamkor va h.k.
- **Operator** — mijoz, lid, qo'ng'iroq, vazifa, eslatma, uchrashuv, viza
- **Buxgalter** — to'lov, buyurtma, bitim

Hamma o'qiy oladi; yozish ruxsati rolga qarab server tomonda tekshiriladi.
