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

  (async () => {
    const siparisId = req.params.id;
    const [currentRows] = await pool.query('SELECT * FROM siparisler WHERE id=? LIMIT 1', [
      siparisId
    ]);
    const current = currentRows?.[0];
    if (!current) return res.status(404).json({ error: 'Kayıt bulunamadı' });

    const nextDurum = req.body.durum !== undefined ? String(req.body.durum) : undefined;
    const isClosing = nextDurum === 'kapatildi' && current.durum !== 'kapatildi';

    // Eğer kapanış olacaksa stok düşümünü transaction ile yap
    if (isClosing) {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();

        // Sipariş detayları
        const [detRows] = await conn.query(
          'SELECT id, urunId, adet FROM siparis_detay WHERE siparisId=?',
          [siparisId]
        );
        const detaylar = Array.isArray(detRows) ? detRows : [];

        // Reçeteler (urunId -> hammadde tüketimi)
        const urunIds = Array.from(new Set(detaylar.map((d) => d.urunId).filter(Boolean)));
        if (urunIds.length > 0) {
          const ph = urunIds.map(() => '?').join(',');
          const [recRows] = await conn.query(
            `SELECT urunId, hammaddeId, miktar FROM receteler WHERE urunId IN (${ph})`,
            urunIds
          );
          const receteler = Array.isArray(recRows) ? recRows : [];

          // tüketimi hammadde bazında topla
          const consumption = new Map(); // hammaddeId -> miktar
          for (const d of detaylar) {
            const adet = Number(d.adet) || 0;
            if (!d.urunId || adet <= 0) continue;
            const recForUrun = receteler.filter((r) => r.urunId === d.urunId);
            for (const r of recForUrun) {
              const need = (Number(r.miktar) || 0) * adet;
              if (!r.hammaddeId || need <= 0) continue;
              consumption.set(r.hammaddeId, (consumption.get(r.hammaddeId) || 0) + need);
            }
          }

          // stok yeterliliğini kontrol et + düş + stok_hareketleri yaz
          const hamIds = Array.from(consumption.keys());
          if (hamIds.length > 0) {
            const ph2 = hamIds.map(() => '?').join(',');
            const [hamRows] = await conn.query(
              `SELECT id, miktar FROM hammaddeler WHERE id IN (${ph2}) FOR UPDATE`,
              hamIds
            );
            const hamMap = new Map((hamRows || []).map((h) => [h.id, Number(h.miktar) || 0]));

            for (const [hid, need] of consumption.entries()) {
              const mevcut = hamMap.get(hid);
              if (mevcut == null) {
                await conn.rollback();
                return res.status(409).json({ error: 'Reçetedeki hammadde stokta bulunamadı' });
              }
              if (mevcut < need) {
                await conn.rollback();
                return res.status(409).json({ error: 'Stok yetersiz, sipariş kapatılamaz' });
              }
            }

            for (const [hid, need] of consumption.entries()) {
              const mevcut = hamMap.get(hid) || 0;
              const yeni = mevcut - need;
              await conn.query('UPDATE hammaddeler SET miktar=? WHERE id=?', [yeni, hid]);
              const hareketId = newId();
              await conn.query(
                'INSERT INTO stok_hareketleri (id, hammaddeId, tedarikciId, tip, miktar, tarih) VALUES (?,?,?,?,?,?)',
                [hareketId, hid, null, 'cikis', need, new Date().toISOString()]
              );
            }
          }
        }

        // siparisler update
        const fields = [];
        const values = [];
        const allowed = ['durum', 'toplamTutar', 'kullaniciId', 'masaId'];
        for (const key of allowed) {
          if (req.body[key] !== undefined) {
            fields.push(`${key}=?`);
            values.push(key === 'toplamTutar' ? Number(req.body[key]) || 0 : req.body[key]);
          }
        }
        if (fields.length === 0) {
          await conn.rollback();
          return res.status(400).json({ error: 'Güncellenecek alan yok' });
        }
        values.push(siparisId);

        await conn.query(`UPDATE siparisler SET ${fields.join(', ')} WHERE id=?`, values);
        const [afterRows] = await conn.query('SELECT * FROM siparisler WHERE id=? LIMIT 1', [
          siparisId
        ]);
        await conn.commit();
        return res.json(afterRows?.[0]);
      } catch (e) {
        try {
          await conn.rollback();
        } catch {}
        return res.status(500).json({ error: e.message });
      } finally {
        conn.release();
      }
    }

    // normal update
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
    values.push(siparisId);

    await pool.query(`UPDATE siparisler SET ${fields.join(', ')} WHERE id=?`, values);
    const [afterRows] = await pool.query('SELECT * FROM siparisler WHERE id=? LIMIT 1', [
      siparisId
    ]);
    return res.json(afterRows?.[0]);
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

