const express = require('express');
const { Masalar, Siparisler } = require('../models');
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

router.put('/:id', (req, res) => {
  let pool;
  try {
    pool = getPool();
  } catch {
    pool = null;
  }

  const id = req.params.id;
  const payload = req.body || {};
  const ad = (payload.ad || '').toString().trim();
  const kapasite =
    payload.kapasite === undefined || payload.kapasite === null
      ? null
      : Number(payload.kapasite);
  const rezerveDurum = (payload.rezerveDurum || '').toString().trim() || null;
  const rezervasyonTarihi =
    (payload.rezervasyonTarihi || '').toString().trim() || null;

  if (!id) return res.status(400).json({ error: 'id zorunlu' });
  if (!ad) return res.status(400).json({ error: 'ad zorunlu' });

  if (!pool) {
    const updated = Masalar.update(id, { ad, kapasite, rezerveDurum, rezervasyonTarihi });
    if (!updated) return res.status(404).json({ error: 'Kayıt bulunamadı' });
    return res.json(updated);
  }

  pool
    .query(
      'UPDATE masalar SET ad=?, kapasite=?, rezerveDurum=?, rezervasyonTarihi=? WHERE id=?',
      [ad, Number.isNaN(kapasite) ? null : kapasite, rezerveDurum, rezervasyonTarihi, id]
    )
    .then(([result]) => {
      if (!result.affectedRows) return res.status(404).json({ error: 'Kayıt bulunamadı' });
      return res.json({ id, ad, kapasite: Number.isNaN(kapasite) ? null : kapasite, rezerveDurum, rezervasyonTarihi });
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
    const masaId = req.params.id;
    const usedInOrders = Siparisler.findAll().some((s) => s.masaId === masaId);
    if (usedInOrders) {
      return res.status(409).json({
        error: 'Bu masa siparişlerde kullanıldığı için silinemez'
      });
    }
    const ok = Masalar.remove(req.params.id);
    if (!ok) {
      return res.status(404).json({ error: 'Kayıt bulunamadı' });
    }
    return res.status(204).send();
  }

  const masaId = req.params.id;

  pool
    .query('SELECT COUNT(*) as c FROM siparisler WHERE masaId=?', [masaId])
    .then(([rows]) => {
      const count = Number(rows?.[0]?.c || 0);
      if (count > 0) {
        return res.status(409).json({
          error: 'Bu masa siparişlerde kullanıldığı için silinemez'
        });
      }

      pool
        .query('DELETE FROM masalar WHERE id=?', [masaId])
        .then(([result]) => {
          if (!result.affectedRows) return res.status(404).json({ error: 'Kayıt bulunamadı' });
          res.status(204).send();
        })
        .catch((e) => res.status(500).json({ error: e.message }));
    })
    .catch((e) => res.status(500).json({ error: e.message }));
});

module.exports = router;

