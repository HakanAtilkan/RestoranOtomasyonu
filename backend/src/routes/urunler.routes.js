const express = require('express');
const { Urunler, Receteler, SiparisDetay } = require('../models');
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
  if (!pool) return res.json(Urunler.findAll());

  pool
    .query('SELECT * FROM urunler')
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
    const created = Urunler.create(req.body);
    return res.status(201).json(created);
  }

  const id = newId();
  const { ad, fiyat } = req.body || {};
  pool
    .query('INSERT INTO urunler (id, ad, fiyat) VALUES (?,?,?)', [id, ad || '', Number(fiyat) || 0])
    .then(() => res.status(201).json({ id, ad, fiyat: Number(fiyat) || 0 }))
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
    const urunId = req.params.id;
    const usedInRecipes = Receteler.findAll().some((r) => r.urunId === urunId);
    const usedInOrderDetails = SiparisDetay.findAll().some((d) => d.urunId === urunId);
    if (usedInRecipes || usedInOrderDetails) {
      return res.status(409).json({
        error: 'Bu ürün başka kayıtlarda kullanıldığı için silinemez'
      });
    }
    const ok = Urunler.remove(req.params.id);
    if (!ok) {
      return res.status(404).json({ error: 'Kayıt bulunamadı' });
    }
    return res.status(204).send();
  }

  const urunId = req.params.id;

  Promise.all([
    pool.query('SELECT COUNT(*) as c FROM receteler WHERE urunId=?', [urunId]),
    pool.query('SELECT COUNT(*) as c FROM siparis_detay WHERE urunId=?', [urunId]),
    pool.query('SELECT COUNT(*) as c FROM tedarikci_urunler WHERE urunId=?', [urunId])
  ])
    .then((results) => {
      const recCount = Number(results[0]?.[0]?.[0]?.c || 0);
      const detCount = Number(results[1]?.[0]?.[0]?.c || 0);
      const mapCount = Number(results[2]?.[0]?.[0]?.c || 0);

      if (recCount > 0 || detCount > 0 || mapCount > 0) {
        return res.status(409).json({
          error: 'Bu ürün başka kayıtlarda kullanıldığı için silinemez'
        });
      }

      pool
        .query('DELETE FROM urunler WHERE id=?', [urunId])
        .then(([result]) => {
          if (!result.affectedRows) return res.status(404).json({ error: 'Kayıt bulunamadı' });
          res.status(204).send();
        })
        .catch((e) => res.status(500).json({ error: e.message }));
    })
    .catch((e) => res.status(500).json({ error: e.message }));
});

module.exports = router;

