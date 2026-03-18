const express = require('express');
const { Receteler } = require('../models');
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
  if (!pool) return res.json(Receteler.findAll());

  pool
    .query('SELECT * FROM receteler')
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
  const payload = {
    urunId: req.body.urunId,
    hammaddeId: req.body.hammaddeId,
    miktar: Number(req.body.miktar) || 0
  };

  if (!pool) {
    const created = Receteler.create(payload);
    return res.status(201).json(created);
  }

  const id = newId();
  pool
    .query('INSERT INTO receteler (id, urunId, hammaddeId, miktar) VALUES (?,?,?,?)', [
      id,
      payload.urunId,
      payload.hammaddeId,
      payload.miktar
    ])
    .then(() => res.status(201).json({ id, ...payload }))
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
    const ok = Receteler.remove(req.params.id);
    if (!ok) {
      return res.status(404).json({ error: 'Kayıt bulunamadı' });
    }
    return res.status(204).send();
  }

  pool
    .query('DELETE FROM receteler WHERE id=?', [req.params.id])
    .then(([result]) => {
      if (!result.affectedRows) return res.status(404).json({ error: 'Kayıt bulunamadı' });
      res.status(204).send();
    })
    .catch((e) => res.status(500).json({ error: e.message }));
});

module.exports = router;

