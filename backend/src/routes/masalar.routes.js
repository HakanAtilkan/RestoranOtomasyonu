const express = require('express');
const { Masalar } = require('../models');
const { getPool } = require('../config/db');
const { newId } = require('../db/id');

const router = express.Router();

router.get('/', (req, res) => {
  let pool;
  try {
    pool = getPool();
  } catch {
    pool = null;
  }
  if (!pool) return res.json(Masalar.findAll());

  pool
    .query('SELECT * FROM masalar')
    .then(([rows]) => res.json(rows))
    .catch((e) => res.status(500).json({ error: e.message }));
});

router.post('/', (req, res) => {
  let pool;
  try {
    pool = getPool();
  } catch {
    pool = null;
  }
  if (!pool) {
    const created = Masalar.create(req.body);
    return res.status(201).json(created);
  }

  const id = newId();
  const { ad, kapasite, rezerveDurum, rezervasyonTarihi } = req.body || {};
  pool
    .query(
      'INSERT INTO masalar (id, ad, kapasite, rezerveDurum, rezervasyonTarihi) VALUES (?,?,?,?,?)',
      [id, ad || '', kapasite ?? null, rezerveDurum || null, rezervasyonTarihi || null]
    )
    .then(() =>
      res.status(201).json({ id, ad, kapasite, rezerveDurum, rezervasyonTarihi })
    )
    .catch((e) => res.status(500).json({ error: e.message }));
});

router.delete('/:id', (req, res) => {
  let pool;
  try {
    pool = getPool();
  } catch {
    pool = null;
  }
  if (!pool) {
    const ok = Masalar.remove(req.params.id);
    if (!ok) {
      return res.status(404).json({ error: 'Kayıt bulunamadı' });
    }
    return res.status(204).send();
  }

  pool
    .query('DELETE FROM masalar WHERE id=?', [req.params.id])
    .then(([result]) => {
      if (!result.affectedRows) return res.status(404).json({ error: 'Kayıt bulunamadı' });
      res.status(204).send();
    })
    .catch((e) => res.status(500).json({ error: e.message }));
});

module.exports = router;

