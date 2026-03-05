const express = require('express');
const { Islemler } = require('../models');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(Islemler.findAll());
});

router.post('/', (req, res) => {
  const created = Islemler.create(req.body);
  res.status(201).json(created);
});

router.delete('/:id', (req, res) => {
  const ok = Islemler.remove(req.params.id);
  if (!ok) {
    return res.status(404).json({ error: 'Kayıt bulunamadı' });
  }
  res.status(204).send();
});

module.exports = router;

