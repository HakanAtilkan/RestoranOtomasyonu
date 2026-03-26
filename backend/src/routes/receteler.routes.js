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
        birim: null
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
      miktar
    };

    if (!pool) {
      const created = Receteler.create(createdPayload);
      return res.status(201).json(created);
    }

    const id = newId();
    await pool.query(
      'INSERT INTO receteler (id, urunId, hammaddeId, miktar) VALUES (?,?,?,?)',
      [id, createdPayload.urunId, createdPayload.hammaddeId, createdPayload.miktar]
    );
    return res.status(201).json({ id, ...createdPayload });
  };

  run().catch((e) => res.status(500).json({ error: e.message }));
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

