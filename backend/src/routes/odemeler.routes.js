const express = require('express');
const { Odemeler } = require('../models');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(Odemeler.findAll());
});

router.post('/', (req, res) => {
  const created = Odemeler.create({
    siparisId: req.body.siparisId,
    toplamTutar: req.body.toplamTutar || 0,
    odemeTarihi: new Date().toISOString()
  });
  res.status(201).json(created);
});

router.delete('/:id', (req, res) => {
  const ok = Odemeler.remove(req.params.id);
  if (!ok) {
    return res.status(404).json({ error: 'Kayıt bulunamadı' });
  }
  res.status(204).send();
});

module.exports = router;

