const express = require('express');
const { Hammaddeler, Receteler, StokHareketleri } = require('../models');
const { getPool } = require('../config/db');

const router = express.Router();

router.get('/', (req, res) => {
  let pool;
  try {
    pool = getPool();
  } catch {
    pool = null;
  }
  if (!pool) return res.json(Hammaddeler.findAll());

  pool
    .query('SELECT * FROM hammaddeler')
    .then(([rows]) => res.json(rows))
    .catch((e) => res.status(500).json({ error: e.message }));
});

router.post('/', (req, res) => {
  // UI tarafinda bu kapali ama geriye donuk uyumluluk icin birakiyoruz
  let pool;
  try {
    pool = getPool();
  } catch {
    pool = null;
  }
  const { ad, miktar, birim } = req.body || {};
  const name = (ad || '').toString().trim();
  if (!name) {
    return res.status(400).json({ error: 'Hammadde adı zorunlu' });
  }
  if (!pool) {
    const created = Hammaddeler.create({ ...req.body, ad: name });
    return res.status(201).json(created);
  }

  const { v4: uuid } = require('uuid');
  const id = uuid();
  pool
    .query('INSERT INTO hammaddeler (id, ad, miktar, birim) VALUES (?,?,?,?)', [
      id,
      name,
      Number(miktar) || 0,
      birim || null
    ])
    .then(() => res.status(201).json({ id, ad: name, miktar: Number(miktar) || 0, birim }))
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
    const hamId = req.params.id;
    const usedInRecipes = Receteler.findAll().some((r) => r.hammaddeId === hamId);
    const usedInStock = StokHareketleri.findAll().some((s) => s.hammaddeId === hamId);
    if (usedInRecipes || usedInStock) {
      return res.status(409).json({
        error: 'Bu hammadde başka kayıtlarda kullanıldığı için silinemez'
      });
    }
    const ok = Hammaddeler.remove(req.params.id);
    if (!ok) {
      return res.status(404).json({ error: 'Kayıt bulunamadı' });
    }
    return res.status(204).send();
  }

  const hamId = req.params.id;

  Promise.all([
    pool.query('SELECT COUNT(*) as c FROM receteler WHERE hammaddeId=?', [hamId]),
    pool.query('SELECT COUNT(*) as c FROM stok_hareketleri WHERE hammaddeId=?', [hamId])
  ])
    .then((results) => {
      const recCount = Number(results[0]?.[0]?.[0]?.c || 0);
      const stCount = Number(results[1]?.[0]?.[0]?.c || 0);

      if (recCount > 0 || stCount > 0) {
        return res.status(409).json({
          error: 'Bu hammadde başka kayıtlarda kullanıldığı için silinemez'
        });
      }

      pool
        .query('DELETE FROM hammaddeler WHERE id=?', [hamId])
        .then(([result]) => {
          if (!result.affectedRows) return res.status(404).json({ error: 'Kayıt bulunamadı' });
          res.status(204).send();
        })
        .catch((e) => res.status(500).json({ error: e.message }));
    })
    .catch((e) => res.status(500).json({ error: e.message }));
});

module.exports = router;

