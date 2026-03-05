## Backend (Node.js / Express)

Bu klasör restoran otomasyonu için Node.js tabanlı REST API'yi içerir.

### Calistirma

```bash
cd backend
npm install
npm run dev
```

Varsayılan olarak API `http://localhost:4000` adresinde çalışır.

### Klasor yapisi

- `src/server.js` — Express uygulamasının ana giris noktasi
- `src/config/` — ortam degiskenleri, genel ayarlar
- `src/routes/` — REST endpoint tanimlari
- `src/controllers/` — is mantigi
- `src/models/` — ER diyagramindaki tablolarin model tanimlari (simdilik bellek ici mock)
- `src/data/` — ornek seed veriler

Gerçek bir projede buradaki modeller bir veritabanı katmanına (ORM, SQL, vb.) bağlanacak şekilde genisletilebilir.
