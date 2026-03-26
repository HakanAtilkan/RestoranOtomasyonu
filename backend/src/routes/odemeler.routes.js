const express = require('express');
const { Odemeler, OdemeDetay } = require('../models');
const { getPool } = require('../config/db');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(Odemeler.findAll());
});

router.post('/', (req, res) => {
  const created = Odemeler.create({
    siparisId: req.body.siparisId,
    toplamTutar: req.body.toplamTutar || 0,
    odemeTarihi: new Date().toISOString()
  });
  res.status(201).json(created);
});

router.delete('/:id', (req, res) => {
  let pool;
  try {
    pool = getPool();
  } catch {
    pool = null;
  }

  const odemeId = req.params.id;

  if (!pool) {
    const used = OdemeDetay.findAll().some((d) => d.odemeId === odemeId);
    if (used) {
      return res.status(409).json({
        error: 'Bu ödeme, ödeme detaylarında kullanıldığı için silinemez'
      });
    }
    const ok = Odemeler.remove(odemeId);
    if (!ok) return res.status(404).json({ error: 'Kayıt bulunamadı' });
    return res.status(204).send();
  }

  (async () => {
    try {
      const [rows] = await pool.query(
        'SELECT COUNT(*) as c FROM odeme_detay WHERE odemeId=?',
        [odemeId]
      );
      const count = Number(rows?.[0]?.c || 0);
      if (count > 0) {
        return res.status(409).json({
          error: 'Bu ödeme, ödeme detaylarında kullanıldığı için silinemez'
        });
      }
    } catch {
      // tablo yoksa devam et
    }

    pool
      .query('DELETE FROM odemeler WHERE id=?', [odemeId])
      .then(([result]) => {
        if (!result.affectedRows) return res.status(404).json({ error: 'Kayıt bulunamadı' });
        res.status(204).send();
      })
      .catch((e) => res.status(500).json({ error: e.message }));
  })().catch((e) => res.status(500).json({ error: e.message }));
});

module.exports = router;

