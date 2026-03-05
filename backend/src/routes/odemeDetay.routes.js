const express = require('express');
const { OdemeDetay } = require('../models');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(OdemeDetay.findAll());
});

router.post('/', (req, res) => {
  const created = OdemeDetay.create({
    odemeId: req.body.odemeId,
    siparisDetayId: req.body.siparisDetayId,
    tutar: req.body.tutar || 0,
    odemeTuru: req.body.odemeTuru || 'nakit'
  });
  res.status(201).json(created);
});

router.delete('/:id', (req, res) => {
  const ok = OdemeDetay.remove(req.params.id);
  if (!ok) {
    return res.status(404).json({ error: 'Kayıt bulunamadı' });
  }
  res.status(204).send();
});

module.exports = router;

