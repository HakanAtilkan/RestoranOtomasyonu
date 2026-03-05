const express = require('express');
const { StokHareketleri, Hammaddeler } = require('../models');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(StokHareketleri.findAll());
});

router.post('/', (req, res) => {
  const tip = req.body.tip || 'giris'; // giris / cikis
  const miktar = Number(req.body.miktar) || 0;
  const girilenHammadde = (req.body.hammaddeId || '').toString().trim();
  const birim = (req.body.birim || '').toString().trim();

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
    tedarikciId: req.body.tedarikciId || null,
    tip,
    miktar,
    tarih: new Date().toISOString()
  });

  res.status(201).json(created);
});

router.delete('/:id', (req, res) => {
  const ok = StokHareketleri.remove(req.params.id);
  if (!ok) {
    return res.status(404).json({ error: 'Kayıt bulunamadı' });
  }
  res.status(204).send();
});

module.exports = router;

