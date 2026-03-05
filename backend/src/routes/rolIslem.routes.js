const express = require('express');
const { RolIslem } = require('../models');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(RolIslem.findAll());
});

router.post('/', (req, res) => {
  const created = RolIslem.create(req.body);
  res.status(201).json(created);
});

router.delete('/:id', (req, res) => {
  const ok = RolIslem.remove(req.params.id);
  if (!ok) {
    return res.status(404).json({ error: 'Kayıt bulunamadı' });
  }
  res.status(204).send();
});

module.exports = router;

