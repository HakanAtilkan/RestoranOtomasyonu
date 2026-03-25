const express = require('express');
const { StokHareketleri, Hammaddeler, Tedarikciler } = require('../models');
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

router.post('/', async (req, res) => {
  const tip = req.body.tip || 'giris'; // giris / cikis
  const miktar = Number(req.body.miktar) || 0;
  const girilenHammadde = (req.body.hammaddeId || '').toString().trim();
  const birim = (req.body.birim || '').toString().trim();
  const tedarikciRaw = (req.body.tedarikciId || '').toString().trim();

  if (!tedarikciRaw) return res.status(400).json({ error: 'Tedarikçi zorunlu' });

  const resolveTedarikciId = async (pool) => {
    // Girilen değer bazen gerçek id, bazen ad olabilir.
    if (!pool) {
      const hamById = Tedarikciler.findById(tedarikciRaw);
      if (hamById) return hamById.id;
      const byName =
        Tedarikciler.findAll().find(
          (t) => t.ad && t.ad.toString().toLowerCase() === tedarikciRaw.toLowerCase()
        ) || null;
      if (byName) return byName.id;
      const created = Tedarikciler.create({ ad: tedarikciRaw });
      return created.id;
    }

    const [byId] = await pool.query(
      'SELECT id FROM tedarikciler WHERE id=? LIMIT 1',
      [tedarikciRaw]
    );
    if (byId[0]?.id) return byId[0].id;

    const [byName] = await pool.query(
      'SELECT id FROM tedarikciler WHERE LOWER(ad)=LOWER(?) LIMIT 1',
      [tedarikciRaw]
    );
    if (byName[0]?.id) return byName[0].id;

    const tedarikciId = newId();
    await pool.query('INSERT INTO tedarikciler (id, ad) VALUES (?,?)', [
      tedarikciId,
      tedarikciRaw
    ]);
    return tedarikciId;
  };

  let pool;
  try {
    pool = getPool();
  } catch {
    pool = null;
  }

  // Tedarikci id'yi hem MySQL hem de bellek fallback senaryosunda resolve et.
  const tedarikciId = await resolveTedarikciId(pool);

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

  return res.status(201).json({
    id,
    hammaddeId: ham.id,
    tedarikciId,
    tip,
    miktar,
    tarih
  });
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

