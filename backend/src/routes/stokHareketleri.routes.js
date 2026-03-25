const express = require('express');
const { StokHareketleri, Hammaddeler } = require('../models');
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
  if (!pool) return res.json(StokHareketleri.findAll());

  pool
    .query('SELECT * FROM stok_hareketleri')
    .then(([rows]) => res.json(rows))
    .catch((e) => res.status(500).json({ error: e.message }));
});

router.post('/', (req, res) => {
  const tip = req.body.tip || 'giris'; // giris / cikis
  const miktar = Number(req.body.miktar) || 0;
  const girilenHammadde = (req.body.hammaddeId || '').toString().trim();
  const birim = (req.body.birim || '').toString().trim();
  const tedarikciId = (req.body.tedarikciId || '').toString().trim();

  if (!tedarikciId) {
    return res.status(400).json({ error: 'Tedarikçi zorunlu' });
  }

  let pool;
  try {
    pool = getPool();
  } catch {
    pool = null;
  }

  // Bellek ici fallback
  if (!pool) {
    // Hammadde'yi bul: önce id, sonra ad'a göre
    let ham =
      Hammaddeler.findById(girilenHammadde) ||
      Hammaddeler.findAll().find(
        (h) =>
          h.ad &&
          girilenHammadde &&
          h.ad.toString().toLowerCase() === girilenHammadde.toLowerCase()
      );

    // Yoksa yeni hammadde oluştur
    if (!ham) {
      const ilkMiktar = tip === 'cikis' ? -miktar : miktar;
      ham = Hammaddeler.create({
        ad: girilenHammadde,
        birim,
        miktar: ilkMiktar
      });
    } else {
      // Varsa stok miktarını güncelle
      const mevcut = Number(ham.miktar) || 0;
      const yeniMiktar = tip === 'cikis' ? mevcut - miktar : mevcut + miktar;
      ham = Hammaddeler.update(ham.id, {
        miktar: yeniMiktar,
        birim: birim || ham.birim
      });
    }

    const created = StokHareketleri.create({
      hammaddeId: ham.id,
      tedarikciId,
      tip,
      miktar,
      tarih: new Date().toISOString()
    });
    return res.status(201).json(created);
  }

  (async () => {
    // Tedarikçi var mi kontrol et (yanlış/boş id gelirse join id gösterir)
    const [tedRes] = await pool.query(
      'SELECT id FROM tedarikciler WHERE id=? LIMIT 1',
      [tedarikciId]
    );
    if (!tedRes[0]) {
      return res.status(400).json({ error: 'Tedarikçi bulunamadi' });
    }

    // Hammadde'yi bul: önce id, sonra ad
    const [byId] = await pool.query('SELECT * FROM hammaddeler WHERE id=? LIMIT 1', [
      girilenHammadde
    ]);
    let ham = byId[0] || null;
    if (!ham && girilenHammadde) {
      const [byName] = await pool.query(
        'SELECT * FROM hammaddeler WHERE LOWER(ad)=LOWER(?) LIMIT 1',
        [girilenHammadde]
      );
      ham = byName[0] || null;
    }

    if (!ham) {
      const hamId = newId();
      const ilkMiktar = tip === 'cikis' ? -miktar : miktar;
      await pool.query('INSERT INTO hammaddeler (id, ad, miktar, birim) VALUES (?,?,?,?)', [
        hamId,
        girilenHammadde,
        ilkMiktar,
        birim || null
      ]);
      ham = { id: hamId, ad: girilenHammadde, miktar: ilkMiktar, birim: birim || null };
    } else {
      const mevcut = Number(ham.miktar) || 0;
      const yeniMiktar = tip === 'cikis' ? mevcut - miktar : mevcut + miktar;
      await pool.query('UPDATE hammaddeler SET miktar=?, birim=? WHERE id=?', [
        yeniMiktar,
        birim || ham.birim || null,
        ham.id
      ]);
      ham = { ...ham, miktar: yeniMiktar, birim: birim || ham.birim || null };
    }

    const id = newId();
    const tarih = new Date().toISOString();
    await pool.query(
      'INSERT INTO stok_hareketleri (id, hammaddeId, tedarikciId, tip, miktar, tarih) VALUES (?,?,?,?,?,?)',
      [id, ham.id, tedarikciId, tip, miktar, tarih]
    );

    res.status(201).json({
      id,
      hammaddeId: ham.id,
      tedarikciId: req.body.tedarikciId || null,
      tip,
      miktar,
      tarih
    });
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
    const ok = StokHareketleri.remove(req.params.id);
    if (!ok) {
      return res.status(404).json({ error: 'Kayıt bulunamadı' });
    }
    return res.status(204).send();
  }

  pool
    .query('DELETE FROM stok_hareketleri WHERE id=?', [req.params.id])
    .then(([result]) => {
      if (!result.affectedRows) return res.status(404).json({ error: 'Kayıt bulunamadı' });
      res.status(204).send();
    })
    .catch((e) => res.status(500).json({ error: e.message }));
});

module.exports = router;

