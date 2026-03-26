const express = require('express');
const { Siparisler, SiparisDetay, Odemeler } = require('../models');
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
  if (!pool) return res.json(Siparisler.findAll());

  pool
    .query('SELECT * FROM siparisler')
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
    masaId: req.body.masaId,
    kullaniciId: req.body.kullaniciId || null,
    durum: req.body.durum || 'bekliyor',
    toplamTutar: Number(req.body.toplamTutar) || 0,
    olusturmaTarihi: new Date().toISOString()
  };

  if (!pool) {
    const created = Siparisler.create(payload);
    return res.status(201).json(created);
  }

  const id = newId();
  pool
    .query(
      'INSERT INTO siparisler (id, masaId, kullaniciId, durum, toplamTutar, olusturmaTarihi) VALUES (?,?,?,?,?,?)',
      [id, payload.masaId, payload.kullaniciId, payload.durum, payload.toplamTutar, payload.olusturmaTarihi]
    )
    .then(() => res.status(201).json({ id, ...payload }))
    .catch((e) => res.status(500).json({ error: e.message }));
});

router.put('/:id', (req, res) => {
  let pool;
  try {
    pool = getPool();
  } catch {
    pool = null;
  }
  if (!pool) {
    const updated = Siparisler.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Kayıt bulunamadı' });
    }
    return res.json(updated);
  }

  const fields = [];
  const values = [];
  const allowed = ['durum', 'toplamTutar', 'kullaniciId', 'masaId'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      fields.push(`${key}=?`);
      values.push(key === 'toplamTutar' ? Number(req.body[key]) || 0 : req.body[key]);
    }
  }
  if (fields.length === 0) return res.status(400).json({ error: 'Güncellenecek alan yok' });
  values.push(req.params.id);

  pool
    .query(`UPDATE siparisler SET ${fields.join(', ')} WHERE id=?`, values)
    .then(([result]) => {
      if (!result.affectedRows) return res.status(404).json({ error: 'Kayıt bulunamadı' });
      return pool.query('SELECT * FROM siparisler WHERE id=? LIMIT 1', [req.params.id]);
    })
    .then((selectRes) => {
      const rows = Array.isArray(selectRes) ? selectRes[0] : [];
      res.json(rows[0]);
    })
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
    const siparisId = req.params.id;
    const usedInDetails = SiparisDetay.findAll().some((d) => d.siparisId === siparisId);
    const usedInPayments = Odemeler.findAll().some((o) => o.siparisId === siparisId);
    if (usedInDetails || usedInPayments) {
      return res.status(409).json({
        error: 'Bu sipariş detaylar veya ödemeler nedeniyle silinemez'
      });
    }
    const ok = Siparisler.remove(req.params.id);
    if (!ok) {
      return res.status(404).json({ error: 'Kayıt bulunamadı' });
    }
    return res.status(204).send();
  }

  const siparisId = req.params.id;

  Promise.all([
    pool.query('SELECT COUNT(*) as c FROM siparis_detay WHERE siparisId=?', [siparisId]),
    pool.query('SELECT COUNT(*) as c FROM odemeler WHERE siparisId=?', [siparisId])
  ])
    .then((results) => {
      const detCount = Number(results?.[0]?.[0]?.[0]?.c || 0);
      const payCount = Number(results?.[1]?.[0]?.[0]?.c || 0);

      if (detCount > 0 || payCount > 0) {
        return res.status(409).json({
          error: 'Bu sipariş detaylar veya ödemeler nedeniyle silinemez'
        });
      }

      pool
        .query('DELETE FROM siparisler WHERE id=?', [siparisId])
        .then(([result]) => {
          if (!result.affectedRows) return res.status(404).json({ error: 'Kayıt bulunamadı' });
          res.status(204).send();
        })
        .catch((e) => res.status(500).json({ error: e.message }));
    })
    .catch((e) => res.status(500).json({ error: e.message }));
});

module.exports = router;

