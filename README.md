# 📚 Maktaba Huru – Free Library System Tanzania

Mfumo wa maktaba ya bure kwa watoto wa Tanzania. Hakuna usajili, hakuna ada – ingia na ujifunze!

---

## 🏗️ Muundo wa Mradi

```
maktaba_huru_free/
├── backend/          ← Express.js + MongoDB API
└── frontend/         ← Next.js 14 (React)
```

---

## 🚀 Jinsi ya Kuanzisha

### 1. Backend (Server)

```bash
cd backend
cp .env.example .env
# Hariri .env na uweke MONGODB_URI yako
npm install
npm run dev
```

**Backend itaanza kwenye:** http://localhost:5000

#### Unda Admin wa Kwanza:
```bash
curl -X POST http://localhost:5000/api/admin/seed \
  -H "Content-Type: application/json" \
  -d '{"name":"Super Admin","email":"admin@maktaba.tz","password":"BadolaWako@2024"}'
```

---

### 2. Frontend (Tovuti)

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

**Tovuti itaanza kwenye:** http://localhost:3000

---

## 📱 Kurasa za Mfumo

| Kurasa | URL | Maelezo |
|--------|-----|---------|
| Ukurasa wa Nyumbani | `/` | Mapokezi + Masomo yote |
| Kona ya Watoto | `/kids` | Watoto chini ya miaka 6 |
| Chumba cha Somo | `/subject/[somo]` | Vitabu vya somo moja |
| Utafutaji | `/search?q=...` | Tafuta vitabu |
| Msimamizi – Ingia | `/admin/login` | Kuingia kwenye utawala |
| Msimamizi – Dashibodi | `/admin/dashboard` | Kuongeza na kusimamia nyenzo |

---

## 🎯 Vipengele Vikuu

### Kwa Wanafunzi (Bila Usajili)
- ✅ Ukurasa wa mapokezi wenye masomo yote Tanzania
- ✅ Kona maalum ya watoto wadogo (< miaka 6)
- ✅ Utafutaji wa vitabu kwa jina au mwandishi
- ✅ Chujio kwa darasa (Darasa 1–Form 4) na umri
- ✅ Vitabu, Video, Hadithi, Nyimbo
- ✅ Hakuna usajili – fungua na usome mara moja!

### Kwa Msimamizi
- ✅ Ingia kwa akaunti moja ya admin
- ✅ Ongeza nyenzo (pakia PDF, MP4, MP3, au weka URL ya YouTube)
- ✅ Weka picha ya jalada ya kitabu
- ✅ Chapisha au ficha nyenzo
- ✅ Takwimu – maoni na maudhui
- ✅ Hariri na futa nyenzo

---

## 📚 Masomo Yanayoungwa Mkono

- Hisabati, Sayansi, Kiingereza, Kiswahili
- Historia, Jiografia, Uraia na Maadili
- Biologia, Kemia, Fizikia (Kidato 1–4)
- Sanaa, Muziki, Kompyuta
- Dini ya Kiislamu, Elimu ya Dini
- Hadithi za Watoto, Nyimbo za Watoto, Michezo

---

## 🔧 Teknolojia

| Sehemu | Teknolojia |
|--------|-----------|
| Backend | Node.js, Express.js, MongoDB, Mongoose |
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS |
| Upakiaji | Multer (local file storage) |
| Uthibitisho | JWT (kwa admin tu) |

---

## 📝 Maelezo ya API

### API ya Umma (Bila Uthibitisho)
```
GET  /api/subjects              → Masomo yote na hesabu
GET  /api/materials             → Nyenzo (na filters)
GET  /api/materials/:id         → Nyenzo moja
GET  /api/materials/:id/download → Pakua / Fungua faili
```

### API ya Msimamizi (Inahitaji Token)
```
POST   /api/admin/login          → Kuingia
GET    /api/admin/materials       → Nyenzo zote (pamoja drafts)
POST   /api/admin/materials       → Ongeza nyenzo
PUT    /api/admin/materials/:id   → Hariri nyenzo
DELETE /api/admin/materials/:id   → Futa nyenzo
GET    /api/admin/stats           → Takwimu
```

---

## 🌐 Ufungaji (Production)

1. Weka `NODE_ENV=production` katika `.env`
2. Badilisha `MONGODB_URI` na database ya mbali (MongoDB Atlas)
3. Build frontend: `npm run build && npm start`
4. Tumia PM2 au Docker kwa backend
5. Weka Nginx kama reverse proxy

---

## 🇹🇿 Asante

Mfumo huu umeundwa kwa ajili ya watoto wa Tanzania kupata elimu bure.
*Elimu ni haki ya kila mtoto!*
