const express = require('express');
const { Odemeler, OdemeDetay, SiparisDetay } = require('../models');
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

  if (!pool) return res.json(Odemeler.findAll());

  pool
    .query('SELECT * FROM odemeler')
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

  const siparisId = (req.body.siparisId || '').toString().trim();
  const toplamTutar = Number(req.body.toplamTutar) || 0;
  const odemeTarihi = new Date().toISOString();
  if (!siparisId) return res.status(400).json({ error: 'siparisId zorunlu' });

  if (!pool) {
    const created = Odemeler.create({ siparisId, toplamTutar, odemeTarihi });
    return res.status(201).json(created);
  }

  const id = newId();
  pool
    .query('INSERT INTO odemeler (id, siparisId, toplamTutar, odemeTarihi) VALUES (?,?,?,?)', [
      id,
      siparisId,
      toplamTutar,
      odemeTarihi
    ])
    .then(() => res.status(201).json({ id, siparisId, toplamTutar, odemeTarihi }))
    .catch((e) => res.status(500).json({ error: e.message }));
});

// Alman usulü: seçilen sipariş kalemlerini öde
router.post('/split', async (req, res) => {
  let pool;
  try {
    pool = getPool();
  } catch {
    pool = null;
  }

  const siparisId = (req.body.siparisId || '').toString().trim();
  const odemeTuru = (req.body.odemeTuru || 'nakit').toString();
  const items = Array.isArray(req.body.items) ? req.body.items : [];

  if (!siparisId) return res.status(400).json({ error: 'siparisId zorunlu' });
  if (items.length === 0) return res.status(400).json({ error: 'items zorunlu' });

  // { siparisDetayId, adet }
  const normalized = items
    .map((it) => ({
      siparisDetayId: (it.siparisDetayId || '').toString().trim(),
      adet: Number(it.adet) || 0
    }))
    .filter((it) => it.siparisDetayId && it.adet > 0);

  if (normalized.length === 0) return res.status(400).json({ error: 'Geçerli items yok' });

  // Memory fallback
  if (!pool) {
    const odemeId = newId();
    const odemeTarihi = new Date().toISOString();

    // hesap
    let toplamTutar = 0;
    for (const it of normalized) {
      const det = SiparisDetay.findById(it.siparisDetayId);
      if (!det || det.siparisId !== siparisId) {
        return res.status(400).json({ error: 'Geçersiz siparisDetayId' });
      }
      const birimFiyat = Number(det.birimFiyat) || 0;
      toplamTutar += birimFiyat * it.adet;
    }

    Odemeler.create({ id: odemeId, siparisId, toplamTutar, odemeTarihi });
    normalized.forEach((it) => {
      const det = SiparisDetay.findById(it.siparisDetayId);
      const birimFiyat = Number(det?.birimFiyat) || 0;
      OdemeDetay.create({
        odemeId,
        siparisDetayId: it.siparisDetayId,
        adet: it.adet,
        tutar: birimFiyat * it.adet,
        odemeTuru
      });
    });

    return res.status(201).json({ id: odemeId, siparisId, toplamTutar, odemeTarihi });
  }

  // MySQL transaction
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // siparis_detay satırlarını çek
    const ids = normalized.map((x) => x.siparisDetayId);
    const placeholders = ids.map(() => '?').join(',');
    const [detRows] = await conn.query(
      `SELECT id, siparisId, adet, birimFiyat FROM siparis_detay WHERE id IN (${placeholders})`,
      ids
    );

    const detMap = new Map((detRows || []).map((d) => [d.id, d]));

    // ödenmiş adetleri hesapla
    const [paidRows] = await conn.query(
      `SELECT siparisDetayId, SUM(adet) as paidAdet FROM odeme_detay WHERE siparisDetayId IN (${placeholders}) GROUP BY siparisDetayId`,
      ids
    );
    const paidMap = new Map((paidRows || []).map((r) => [r.siparisDetayId, Number(r.paidAdet) || 0]));

    let toplamTutar = 0;
    for (const it of normalized) {
      const det = detMap.get(it.siparisDetayId);
      if (!det || det.siparisId !== siparisId) {
        await conn.rollback();
        return res.status(400).json({ error: 'Geçersiz siparisDetayId' });
      }
      const kalan = (Number(det.adet) || 0) - (paidMap.get(it.siparisDetayId) || 0);
      if (it.adet > kalan) {
        await conn.rollback();
        return res.status(409).json({ error: 'Seçilen adet kalan adetten fazla' });
      }
      toplamTutar += (Number(det.birimFiyat) || 0) * it.adet;
    }

    const odemeId = newId();
    const odemeTarihi = new Date().toISOString();
    await conn.query('INSERT INTO odemeler (id, siparisId, toplamTutar, odemeTarihi) VALUES (?,?,?,?)', [
      odemeId,
      siparisId,
      toplamTutar,
      odemeTarihi
    ]);

    for (const it of normalized) {
      const det = detMap.get(it.siparisDetayId);
      const birimFiyat = Number(det?.birimFiyat) || 0;
      const detId = newId();
      await conn.query(
        'INSERT INTO odeme_detay (id, odemeId, siparisDetayId, adet, tutar, odemeTuru) VALUES (?,?,?,?,?,?)',
        [detId, odemeId, it.siparisDetayId, it.adet, birimFiyat * it.adet, odemeTuru]
      );
    }

    // Tümü ödendiyse siparişi kapat
    const [allDet] = await conn.query('SELECT id, adet FROM siparis_detay WHERE siparisId=?', [siparisId]);
    if ((allDet || []).length > 0) {
      const allIds = allDet.map((d) => d.id);
      const ph2 = allIds.map(() => '?').join(',');
      const [allPaid] = await conn.query(
        `SELECT siparisDetayId, SUM(adet) as paidAdet FROM odeme_detay WHERE siparisDetayId IN (${ph2}) GROUP BY siparisDetayId`,
        allIds
      );
      const allPaidMap = new Map((allPaid || []).map((r) => [r.siparisDetayId, Number(r.paidAdet) || 0]));
      const allDone = allDet.every((d) => (allPaidMap.get(d.id) || 0) >= (Number(d.adet) || 0));
      if (allDone) {
        await conn.query('UPDATE siparisler SET durum=? WHERE id=?', ['kapatildi', siparisId]);
      }
    }

    await conn.commit();
    return res.status(201).json({ id: odemeId, siparisId, toplamTutar, odemeTarihi });
  } catch (e) {
    try {
      await conn.rollback();
    } catch {}
    return res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
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

