const express = require('express');
const { Tedarikciler } = require('../models');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(Tedarikciler.findAll());
});

router.post('/', (req, res) => {
  const created = Tedarikciler.create(req.body);
  res.status(201).json(created);
});

router.delete('/:id', (req, res) => {
  const ok = Tedarikciler.remove(req.params.id);
  if (!ok) {
    return res.status(404).json({ error: 'Kayıt bulunamadı' });
  }
  res.status(204).send();
});

module.exports = router;

