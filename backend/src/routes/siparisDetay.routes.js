const express = require('express');
const { SiparisDetay, OdemeDetay } = require('../models');
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
    // Aynı siparişte aynı ürün varsa adet/aratoplamı artır (tek satır kalsın).
    const existing = SiparisDetay.findAll().find(
      (d) => d.siparisId === payload.siparisId && d.urunId === payload.urunId
    );
    if (existing?.id) {
      const yeniAdet = (Number(existing.adet) || 0) + payload.adet;
      const yeniAraToplam =
        (Number(existing.araToplam) || 0) + (payload.araToplam || 0);
      const updated = SiparisDetay.update(existing.id, {
        adet: yeniAdet,
        birimFiyat: payload.birimFiyat,
        araToplam: yeniAraToplam
      });
      return res.status(200).json(updated);
    }

    const created = SiparisDetay.create(payload);
    return res.status(201).json(created);
  }

  (async () => {
    const [rows] = await pool.query(
      'SELECT id, adet, araToplam FROM siparis_detay WHERE siparisId=? AND urunId=? LIMIT 1',
      [payload.siparisId, payload.urunId]
    );
    const existing = rows?.[0];
    if (existing?.id) {
      const yeniAdet = (Number(existing.adet) || 0) + payload.adet;
      const yeniAraToplam =
        (Number(existing.araToplam) || 0) + (payload.araToplam || 0);
      await pool.query(
        'UPDATE siparis_detay SET adet=?, birimFiyat=?, araToplam=? WHERE id=?',
        [yeniAdet, payload.birimFiyat, yeniAraToplam, existing.id]
      );
      return res.status(200).json({
        id: existing.id,
        siparisId: payload.siparisId,
        urunId: payload.urunId,
        adet: yeniAdet,
        birimFiyat: payload.birimFiyat,
        araToplam: yeniAraToplam
      });
    }

    const id = newId();
    await pool.query(
      'INSERT INTO siparis_detay (id, siparisId, urunId, adet, birimFiyat, araToplam) VALUES (?,?,?,?,?,?)',
      [
        id,
        payload.siparisId,
        payload.urunId,
        payload.adet,
        payload.birimFiyat,
        payload.araToplam
      ]
    );
    return res.status(201).json({ id, ...payload });
  })().catch((e) => res.status(500).json({ error: e.message }));
});

router.delete('/:id', (req, res) => {
  let pool;
  try {
    pool = getPool();
  } catch {
    pool = null;
  }
  if (!pool) {
    const detId = req.params.id;
    const usedInPayDetails = OdemeDetay.findAll().some((d) => d.siparisDetayId === detId);
    if (usedInPayDetails) {
      return res.status(409).json({
        error: 'Bu sipariş detayı ödeme detaylarında kullanıldığı için silinemez'
      });
    }
    const ok = SiparisDetay.remove(req.params.id);
    if (!ok) {
      return res.status(404).json({ error: 'Kayıt bulunamadı' });
    }
    return res.status(204).send();
  }

  const detId = req.params.id;

  (async () => {
    // odeme_detay tablosu bazı kurulumlarda olmayabilir; varsa koruyalım.
    try {
      const [rows] = await pool.query(
        'SELECT COUNT(*) as c FROM odeme_detay WHERE siparisDetayId=?',
        [detId]
      );
      const count = Number(rows?.[0]?.c || 0);
      if (count > 0) {
        return res.status(409).json({
          error: 'Bu sipariş detayı ödeme detaylarında kullanıldığı için silinemez'
        });
      }
    } catch {
      // tablo yoksa devam et
    }

    pool
      .query('DELETE FROM siparis_detay WHERE id=?', [detId])
      .then(([result]) => {
        if (!result.affectedRows) return res.status(404).json({ error: 'Kayıt bulunamadı' });
        res.status(204).send();
      })
      .catch((e) => res.status(500).json({ error: e.message }));
  })().catch((e) => res.status(500).json({ error: e.message }));
});

module.exports = router;

