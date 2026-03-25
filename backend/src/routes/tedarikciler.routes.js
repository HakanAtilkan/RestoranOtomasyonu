const express = require('express');
const { Tedarikciler } = require('../models');
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
  if (!pool) return res.json(Tedarikciler.findAll());

  pool
    .query('SELECT * FROM tedarikciler')
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

  // Bellek ici fallback
  if (!pool) {
    const created = Tedarikciler.create(req.body);
    return res.status(201).json(created);
  }

  const { ad, urunlerText } = req.body || {};
  const supplierName = (ad || '').toString().trim();
  if (!supplierName) return res.status(400).json({ error: 'Tedarikçi adı zorunlu' });

  // Ürünleri parse et (virgül / yeni satır ayirici)
  const raw = (urunlerText || '').toString();
  const productNames = raw
    .split(/[,;\n\r]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (productNames.length === 0) {
    return res.status(400).json({ error: 'En az 1 ürün girilmeli' });
  }

  const tedarikciId = newId();

  (async () => {
    await pool.query('INSERT INTO tedarikciler (id, ad) VALUES (?,?)', [
      tedarikciId,
      supplierName
    ]);

    for (const pName of productNames) {
      // Ürün var mi?
      const [urunRows] = await pool.query(
        'SELECT id FROM urunler WHERE LOWER(ad)=LOWER(?) LIMIT 1',
        [pName]
      );
      let urunId = urunRows[0]?.id;
      if (!urunId) {
        const id = newId();
        await pool.query('INSERT INTO urunler (id, ad, fiyat) VALUES (?,?,0)', [
          id,
          pName
        ]);
        urunId = id;
      }

      // Mapping ekle
      await pool.query(
        'INSERT INTO tedarikci_urunler (tedarikciId, urunId) VALUES (?,?) ON DUPLICATE KEY UPDATE urunId=urunId',
        [tedarikciId, urunId]
      );
    }

    res.status(201).json({ id: tedarikciId, ad: supplierName });
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
    const ok = Tedarikciler.remove(req.params.id);
    if (!ok) {
      return res.status(404).json({ error: 'Kayıt bulunamadı' });
    }
    return res.status(204).send();
  }

  const id = req.params.id;
  (async () => {
    await pool.query('DELETE FROM tedarikci_urunler WHERE tedarikciId=?', [id]);
    const [result] = await pool.query('DELETE FROM tedarikciler WHERE id=?', [id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Kayıt bulunamadı' });
    res.status(204).send();
  })().catch((e) => res.status(500).json({ error: e.message }));
});

module.exports = router;

