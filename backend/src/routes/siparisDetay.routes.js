const express = require('express');
const { SiparisDetay } = require('../models');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(SiparisDetay.findAll());
});

router.post('/', (req, res) => {
  const created = SiparisDetay.create({
    siparisId: req.body.siparisId,
    urunId: req.body.urunId,
    adet: req.body.adet || 1,
    birimFiyat: req.body.birimFiyat || 0,
    araToplam: req.body.araToplam || 0
  });
  res.status(201).json(created);
});

router.delete('/:id', (req, res) => {
  const ok = SiparisDetay.remove(req.params.id);
  if (!ok) {
    return res.status(404).json({ error: 'Kayıt bulunamadı' });
  }
  res.status(204).send();
});

module.exports = router;

