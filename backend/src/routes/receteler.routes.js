const express = require('express');
const { Receteler } = require('../models');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(Receteler.findAll());
});

router.post('/', (req, res) => {
  const created = Receteler.create({
    urunId: req.body.urunId,
    hammaddeId: req.body.hammaddeId,
    miktar: req.body.miktar || 0
  });
  res.status(201).json(created);
});

router.delete('/:id', (req, res) => {
  const ok = Receteler.remove(req.params.id);
  if (!ok) {
    return res.status(404).json({ error: 'Kayıt bulunamadı' });
  }
  res.status(204).send();
});

module.exports = router;

