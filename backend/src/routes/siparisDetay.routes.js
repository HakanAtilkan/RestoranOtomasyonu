const express = require('express');
const { SiparisDetay } = require('../models');
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
  if (!pool) return res.json(SiparisDetay.findAll());

  pool
    .query('SELECT * FROM siparis_detay')
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
    siparisId: req.body.siparisId,
    urunId: req.body.urunId,
    adet: Number(req.body.adet) || 1,
    birimFiyat: Number(req.body.birimFiyat) || 0,
    araToplam: Number(req.body.araToplam) || 0
  };

  if (!pool) {
    const created = SiparisDetay.create(payload);
    return res.status(201).json(created);
  }

  const id = newId();
  pool
    .query(
      'INSERT INTO siparis_detay (id, siparisId, urunId, adet, birimFiyat, araToplam) VALUES (?,?,?,?,?,?)',
      [id, payload.siparisId, payload.urunId, payload.adet, payload.birimFiyat, payload.araToplam]
    )
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
    const ok = SiparisDetay.remove(req.params.id);
    if (!ok) {
      return res.status(404).json({ error: 'Kayıt bulunamadı' });
    }
    return res.status(204).send();
  }

  pool
    .query('DELETE FROM siparis_detay WHERE id=?', [req.params.id])
    .then(([result]) => {
      if (!result.affectedRows) return res.status(404).json({ error: 'Kayıt bulunamadı' });
      res.status(204).send();
    })
    .catch((e) => res.status(500).json({ error: e.message }));
});

module.exports = router;

