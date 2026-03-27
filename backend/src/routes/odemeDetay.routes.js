const express = require('express');
const { OdemeDetay } = require('../models');
const { getPool } = require('../config/db');
const { newId } = require('../db/id');

const router = express.Router();

function tryGetPool() {
  try {
    return getPool();
  } catch {
    return null;
  }
}

router.get('/', (req, res) => {
  const pool = tryGetPool();
  if (!pool) return res.json(OdemeDetay.findAll());

  pool
    .query('SELECT * FROM odeme_detay')
    .then(([rows]) => res.json(rows))
    .catch((e) => res.status(500).json({ error: e.message }));
});

router.post('/', (req, res) => {
  const pool = tryGetPool();
  const payload = req.body || {};
  const odemeId = (payload.odemeId || '').toString().trim();
  const siparisDetayId = (payload.siparisDetayId || '').toString().trim();
  const adet = Number(payload.adet) || 1;
  const tutar = Number(payload.tutar) || 0;
  const odemeTuru = (payload.odemeTuru || 'nakit').toString();

  if (!odemeId || !siparisDetayId) {
    return res.status(400).json({ error: 'odemeId ve siparisDetayId zorunlu' });
  }

  if (!pool) {
    const created = OdemeDetay.create({ odemeId, siparisDetayId, adet, tutar, odemeTuru });
    return res.status(201).json(created);
  }

  const id = newId();
  pool
    .query(
      'INSERT INTO odeme_detay (id, odemeId, siparisDetayId, adet, tutar, odemeTuru) VALUES (?,?,?,?,?,?)',
      [id, odemeId, siparisDetayId, adet, tutar, odemeTuru]
    )
    .then(() => res.status(201).json({ id, odemeId, siparisDetayId, adet, tutar, odemeTuru }))
    .catch((e) => res.status(500).json({ error: e.message }));
});

router.delete('/:id', (req, res) => {
  const pool = tryGetPool();
  const id = req.params.id;

  if (!pool) {
    const ok = OdemeDetay.remove(id);
    if (!ok) return res.status(404).json({ error: 'Kayıt bulunamadı' });
    return res.status(204).send();
  }

  pool
    .query('DELETE FROM odeme_detay WHERE id=?', [id])
    .then(([result]) => {
      if (!result.affectedRows) return res.status(404).json({ error: 'Kayıt bulunamadı' });
      res.status(204).send();
    })
    .catch((e) => res.status(500).json({ error: e.message }));
});

module.exports = router;

