const express = require('express');
const { Tedarikciler, StokHareketleri } = require('../models');
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
    .query(
      `
      SELECT 
        t.*,
        COALESCE(GROUP_CONCAT(h.ad ORDER BY h.ad SEPARATOR ', '), '') as urunlerText
      FROM tedarikciler t
      LEFT JOIN tedarikci_hammaddeler th ON th.tedarikciId = t.id
      LEFT JOIN hammaddeler h ON h.id = th.hammaddeId
      GROUP BY t.id
      `
    )
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

  // Hammaddeleri parse et (virgül / yeni satır ayirici)
  const raw = (urunlerText || '').toString();
  const materialNames = raw
    .split(/[,;\n\r]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (materialNames.length === 0) {
    return res.status(400).json({ error: 'En az 1 hammadde girilmeli' });
  }

  const tedarikciId = newId();

  (async () => {
    await pool.query('INSERT INTO tedarikciler (id, ad) VALUES (?,?)', [
      tedarikciId,
      supplierName
    ]);

    for (const mName of materialNames) {
      // Hammadde var mi?
      const [hamRows] = await pool.query(
        'SELECT id FROM hammaddeler WHERE LOWER(ad)=LOWER(?) LIMIT 1',
        [mName]
      );
      let hammaddeId = hamRows[0]?.id;
      if (!hammaddeId) {
        const id = newId();
        await pool.query(
          'INSERT INTO hammaddeler (id, ad, miktar, birim) VALUES (?,?,0,NULL)',
          [id, mName]
        );
        hammaddeId = id;
      }

      // Mapping ekle
      await pool.query(
        'INSERT INTO tedarikci_hammaddeler (tedarikciId, hammaddeId) VALUES (?,?) ON DUPLICATE KEY UPDATE hammaddeId=hammaddeId',
        [tedarikciId, hammaddeId]
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
    const id = req.params.id;
    const usedInStock = StokHareketleri.findAll().some((h) => h.tedarikciId === id);
    if (usedInStock) {
      return res.status(409).json({
        error: 'Bu tedarikçi stok hareketlerinde kullanıldığı için silinemez'
      });
    }
    const ok = Tedarikciler.remove(req.params.id);
    if (!ok) {
      return res.status(404).json({ error: 'Kayıt bulunamadı' });
    }
    return res.status(204).send();
  }

  const id = req.params.id;
  (async () => {
    const [stokRows] = await pool.query('SELECT COUNT(*) as c FROM stok_hareketleri WHERE tedarikciId=?', [
      id
    ]);
    const [mapRows] = await pool.query(
      'SELECT COUNT(*) as c FROM tedarikci_hammaddeler WHERE tedarikciId=?',
      [id]
    );

    const stokCount = Number(stokRows?.[0]?.c || 0);
    const mapCount = Number(mapRows?.[0]?.c || 0);

    if (stokCount > 0 || mapCount > 0) {
      return res.status(409).json({
        error: 'Bu tedarikçi başka kayıtlarda kullanıldığı için silinemez'
      });
    }

    const [result] = await pool.query('DELETE FROM tedarikciler WHERE id=?', [id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Kayıt bulunamadı' });
    res.status(204).send();
  })().catch((e) => res.status(500).json({ error: e.message }));
});

module.exports = router;

