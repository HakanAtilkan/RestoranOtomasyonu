const express = require('express');
const { Hammaddeler } = require('../models');
const { getPool } = require('../config/db');

const router = express.Router();

router.get('/', (req, res) => {
  let pool;
  try {
    pool = getPool();
  } catch {
    pool = null;
  }
  if (!pool) return res.json(Hammaddeler.findAll());

  pool
    .query('SELECT * FROM hammaddeler')
    .then(([rows]) => res.json(rows))
    .catch((e) => res.status(500).json({ error: e.message }));
});

router.post('/', (req, res) => {
  // UI tarafinda bu kapali ama geriye donuk uyumluluk icin birakiyoruz
  let pool;
  try {
    pool = getPool();
  } catch {
    pool = null;
  }
  if (!pool) {
    const created = Hammaddeler.create(req.body);
    return res.status(201).json(created);
  }

  const { v4: uuid } = require('uuid');
  const id = uuid();
  const { ad, miktar, birim } = req.body || {};
  pool
    .query('INSERT INTO hammaddeler (id, ad, miktar, birim) VALUES (?,?,?,?)', [
      id,
      ad || '',
      Number(miktar) || 0,
      birim || null
    ])
    .then(() => res.status(201).json({ id, ad, miktar: Number(miktar) || 0, birim }))
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
    const ok = Hammaddeler.remove(req.params.id);
    if (!ok) {
      return res.status(404).json({ error: 'Kayıt bulunamadı' });
    }
    return res.status(204).send();
  }

  pool
    .query('DELETE FROM hammaddeler WHERE id=?', [req.params.id])
    .then(([result]) => {
      if (!result.affectedRows) return res.status(404).json({ error: 'Kayıt bulunamadı' });
      res.status(204).send();
    })
    .catch((e) => res.status(500).json({ error: e.message }));
});

module.exports = router;

