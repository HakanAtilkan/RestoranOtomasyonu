const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const apiRouter = require('./routes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Production: React build'i backend üzerinden servis et (tek servis)
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

app.get('/', (req, res) => {
  // public/index.html varsa SPA'yı döndür, yoksa API mesajı döndür
  const indexPath = path.join(publicDir, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) res.json({ message: 'Restoran Otomasyonu API' });
  });
});

app.use('/api', apiRouter);

// SPA fallback (API disindaki route'lar)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const indexPath = path.join(publicDir, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) next();
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint bulunamadi' });
});

app.listen(PORT, () => {
  console.log(`API http://localhost:${PORT} uzerinde calisiyor`);
});

