const express = require('express');
const { Receteler, Hammaddeler, Urunler } = require('../models');
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
  const urunRaw = (req.body.urunId || '').toString().trim();
  const hammaddeRaw = (req.body.hammaddeId || '').toString().trim();
  const secilenBirim = (req.body.birim || '').toString().trim(); // recete bazli birim
  const miktar = Number(req.body.miktar) || 0;

  if (!urunRaw || !hammaddeRaw) {
    return res.status(400).json({ error: 'urunId ve hammaddeId zorunlu' });
  }

  const resolveUrunId = async (pool) => {
    if (!pool) {
      const byId = Urunler.findById(urunRaw);
      if (byId) return byId.id;
      const byName =
        Urunler.findAll().find(
          (u) => u.ad && u.ad.toString().toLowerCase() === urunRaw.toLowerCase()
        ) || null;
      if (byName) return byName.id;
      const created = Urunler.create({ ad: urunRaw, fiyat: 0 });
      return created.id;
    }

    const [byId] = await pool.query('SELECT id FROM urunler WHERE id=? LIMIT 1', [urunRaw]);
    if (byId[0]?.id) return byId[0].id;

    const [byName] = await pool.query(
      'SELECT id FROM urunler WHERE LOWER(ad)=LOWER(?) LIMIT 1',
      [urunRaw]
    );
    if (byName[0]?.id) return byName[0].id;

    const id = newId();
    await pool.query('INSERT INTO urunler (id, ad, fiyat) VALUES (?,?,0)', [id, urunRaw]);
    return id;
  };

  const resolveHammaddeId = async (pool) => {
    if (!pool) {
      const byId = Hammaddeler.findById(hammaddeRaw);
      if (byId) return byId.id;
      const byName =
        Hammaddeler.findAll().find(
          (h) =>
            h.ad && h.ad.toString().toLowerCase() === hammaddeRaw.toLowerCase()
        ) || null;
      if (byName) return byName.id;
      const created = Hammaddeler.create({
        ad: hammaddeRaw,
        miktar: 0,
        birim: hammaddeBirim || null
      });
      return created.id;
    }

    const [byId] = await pool.query(
      'SELECT id FROM hammaddeler WHERE id=? LIMIT 1',
      [hammaddeRaw]
    );
    if (byId[0]?.id) return byId[0].id;

    const [byName] = await pool.query(
      'SELECT id FROM hammaddeler WHERE LOWER(ad)=LOWER(?) LIMIT 1',
      [hammaddeRaw]
    );
    if (byName[0]?.id) return byName[0].id;

    const id = newId();
    await pool.query(
      'INSERT INTO hammaddeler (id, ad, miktar, birim) VALUES (?,?,0,NULL)',
      [id, hammaddeRaw]
    );
    return id;
  };

  const run = async () => {
    const urunId = await resolveUrunId(pool);
    const hammaddeId = await resolveHammaddeId(pool);

    const createdPayload = {
      urunId,
      hammaddeId,
      miktar,
      birim: secilenBirim || null
    };

    if (!pool) {
      const ham = Hammaddeler.findById(hammaddeId);
      const hamBirim = (ham?.birim || '').toString().trim();
      if (!secilenBirim) return res.status(400).json({ error: 'Birim zorunlu' });
      if (!hamBirim) {
        Hammaddeler.update(hammaddeId, { birim: secilenBirim });
      } else if (hamBirim !== secilenBirim) {
        return res.status(400).json({ error: 'Seçilen birim hammadde birimi ile aynı olmalı' });
      }
      const created = Receteler.create(createdPayload);
      return res.status(201).json(created);
    }

    if (!secilenBirim) return res.status(400).json({ error: 'Birim zorunlu' });
    const [hamRows] = await pool.query('SELECT birim FROM hammaddeler WHERE id=? LIMIT 1', [hammaddeId]);
    const hamBirim = (hamRows?.[0]?.birim || '').toString().trim();
    if (!hamBirim) {
      await pool.query('UPDATE hammaddeler SET birim=? WHERE id=?', [secilenBirim, hammaddeId]);
    } else if (hamBirim !== secilenBirim) {
      return res.status(400).json({ error: 'Seçilen birim hammadde birimi ile aynı olmalı' });
    }

    const id = newId();
    await pool.query(
      'INSERT INTO receteler (id, urunId, hammaddeId, miktar, birim) VALUES (?,?,?,?,?)',
      [id, createdPayload.urunId, createdPayload.hammaddeId, createdPayload.miktar, createdPayload.birim]
    );
    return res.status(201).json({ id, ...createdPayload });
  };

  run().catch((e) => res.status(500).json({ error: e.message }));
});

router.put('/:id', (req, res) => {
  let pool;
  try {
    pool = getPool();
  } catch {
    pool = null;
  }

  const id = req.params.id;
  const urunRaw = (req.body.urunId || '').toString().trim();
  const hammaddeRaw = (req.body.hammaddeId || '').toString().trim();
  const secilenBirim = (req.body.birim || '').toString().trim();
  const miktar = Number(req.body.miktar) || 0;

  if (!id) return res.status(400).json({ error: 'id zorunlu' });
  if (!urunRaw || !hammaddeRaw) {
    return res.status(400).json({ error: 'urunId ve hammaddeId zorunlu' });
  }

  const resolveUrunId = async (pool) => {
    if (!pool) {
      const byId = Urunler.findById(urunRaw);
      if (byId) return byId.id;
      const byName =
        Urunler.findAll().find(
          (u) => u.ad && u.ad.toString().toLowerCase() === urunRaw.toLowerCase()
        ) || null;
      if (byName) return byName.id;
      const created = Urunler.create({ ad: urunRaw, fiyat: 0 });
      return created.id;
    }

    const [byId] = await pool.query('SELECT id FROM urunler WHERE id=? LIMIT 1', [urunRaw]);
    if (byId[0]?.id) return byId[0].id;

    const [byName] = await pool.query(
      'SELECT id FROM urunler WHERE LOWER(ad)=LOWER(?) LIMIT 1',
      [urunRaw]
    );
    if (byName[0]?.id) return byName[0].id;

    const id = newId();
    await pool.query('INSERT INTO urunler (id, ad, fiyat) VALUES (?,?,0)', [id, urunRaw]);
    return id;
  };

  const resolveHammaddeId = async (pool) => {
    if (!pool) {
      const byId = Hammaddeler.findById(hammaddeRaw);
      if (byId) return byId.id;
      const byName =
        Hammaddeler.findAll().find(
          (h) => h.ad && h.ad.toString().toLowerCase() === hammaddeRaw.toLowerCase()
        ) || null;
      if (byName) return byName.id;
      const created = Hammaddeler.create({ ad: hammaddeRaw, miktar: 0, birim: null });
      return created.id;
    }

    const [byId] = await pool.query('SELECT id FROM hammaddeler WHERE id=? LIMIT 1', [
      hammaddeRaw
    ]);
    if (byId[0]?.id) return byId[0].id;

    const [byName] = await pool.query(
      'SELECT id FROM hammaddeler WHERE LOWER(ad)=LOWER(?) LIMIT 1',
      [hammaddeRaw]
    );
    if (byName[0]?.id) return byName[0].id;

    const id = newId();
    await pool.query(
      'INSERT INTO hammaddeler (id, ad, miktar, birim) VALUES (?,?,0,NULL)',
      [id, hammaddeRaw]
    );
    return id;
  };

  const run = async () => {
    const urunId = await resolveUrunId(pool);
    const hammaddeId = await resolveHammaddeId(pool);

    if (!pool) {
      if (!secilenBirim) return res.status(400).json({ error: 'Birim zorunlu' });
      const ham = Hammaddeler.findById(hammaddeId);
      const hamBirim = (ham?.birim || '').toString().trim();
      if (!hamBirim) {
        Hammaddeler.update(hammaddeId, { birim: secilenBirim });
      } else if (hamBirim !== secilenBirim) {
        return res.status(400).json({ error: 'Seçilen birim hammadde birimi ile aynı olmalı' });
      }
      const updated = Receteler.update(id, { urunId, hammaddeId, miktar, birim: secilenBirim });
      if (!updated) return res.status(404).json({ error: 'Kayıt bulunamadı' });
      return res.json(updated);
    }

    if (!secilenBirim) return res.status(400).json({ error: 'Birim zorunlu' });
    const [hamRows] = await pool.query('SELECT birim FROM hammaddeler WHERE id=? LIMIT 1', [hammaddeId]);
    const hamBirim = (hamRows?.[0]?.birim || '').toString().trim();
    if (!hamBirim) {
      await pool.query('UPDATE hammaddeler SET birim=? WHERE id=?', [secilenBirim, hammaddeId]);
    } else if (hamBirim !== secilenBirim) {
      return res.status(400).json({ error: 'Seçilen birim hammadde birimi ile aynı olmalı' });
    }

    const [result] = await pool.query(
      'UPDATE receteler SET urunId=?, hammaddeId=?, miktar=?, birim=? WHERE id=?',
      [urunId, hammaddeId, miktar, secilenBirim, id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Kayıt bulunamadı' });
    return res.json({ id, urunId, hammaddeId, miktar, birim: secilenBirim });
  };

  run().catch((e) => res.status(500).json({ error: e.message }));
});

// Çoklu ürün + çoklu hammadde: tek seferde reçete tanımla
router.post('/batch', (req, res) => {
  let pool;
  try {
    pool = getPool();
  } catch {
    pool = null;
  }

  const recipes = Array.isArray(req.body?.recipes) ? req.body.recipes : [];
  if (recipes.length === 0) return res.status(400).json({ error: 'recipes zorunlu' });

  if (!pool) {
    const created = [];
    for (const r of recipes) {
      const urunId = (r.urunId || '').toString().trim();
      const items = Array.isArray(r.items) ? r.items : [];
      if (!urunId || items.length === 0) continue;
      for (const it of items) {
        const hammaddeId = (it.hammaddeId || '').toString().trim();
        const miktar = Number(it.miktar) || 0;
        const birim = (it.birim || '').toString().trim();
        if (!hammaddeId || !birim || miktar <= 0) continue;
        const ham = Hammaddeler.findById(hammaddeId);
        const hamBirim = (ham?.birim || '').toString().trim();
        if (!hamBirim) Hammaddeler.update(hammaddeId, { birim });
        if (hamBirim && hamBirim !== birim) continue;
        created.push(Receteler.create({ urunId, hammaddeId, miktar, birim }));
      }
    }
    return res.status(201).json(created);
  }

  (async () => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const created = [];
      for (const r of recipes) {
        const urunId = (r.urunId || '').toString().trim();
        const items = Array.isArray(r.items) ? r.items : [];
        if (!urunId || items.length === 0) continue;

        for (const it of items) {
          const hammaddeId = (it.hammaddeId || '').toString().trim();
          const miktar = Number(it.miktar) || 0;
          const birim = (it.birim || '').toString().trim();
          if (!hammaddeId || !birim || miktar <= 0) {
            await conn.rollback();
            return res.status(400).json({ error: 'Hammadde, birim ve miktar zorunlu' });
          }

          const [hamRows] = await conn.query('SELECT birim FROM hammaddeler WHERE id=? LIMIT 1', [
            hammaddeId
          ]);
          const hamBirim = (hamRows?.[0]?.birim || '').toString().trim();
          if (!hamBirim) {
            await conn.query('UPDATE hammaddeler SET birim=? WHERE id=?', [birim, hammaddeId]);
          } else if (hamBirim !== birim) {
            await conn.rollback();
            return res.status(400).json({ error: 'Seçilen birim hammadde birimi ile aynı olmalı' });
          }

          const id = newId();
          await conn.query(
            'INSERT INTO receteler (id, urunId, hammaddeId, miktar, birim) VALUES (?,?,?,?,?)',
            [id, urunId, hammaddeId, miktar, birim]
          );
          created.push({ id, urunId, hammaddeId, miktar, birim });
        }
      }
      await conn.commit();
      return res.status(201).json(created);
    } catch (e) {
      try {
        await conn.rollback();
      } catch {}
      return res.status(500).json({ error: e.message });
    } finally {
      conn.release();
    }
  })();
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

