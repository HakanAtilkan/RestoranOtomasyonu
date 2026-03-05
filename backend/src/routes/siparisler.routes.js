const express = require('express');
const { Siparisler } = require('../models');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(Siparisler.findAll());
});

router.post('/', (req, res) => {
  const created = Siparisler.create({
    masaId: req.body.masaId,
    kullaniciId: req.body.kullaniciId,
    durum: req.body.durum || 'acik',
    toplamTutar: req.body.toplamTutar || 0,
    olusturmaTarihi: new Date().toISOString()
  });
  res.status(201).json(created);
});

router.put('/:id', (req, res) => {
  const updated = Siparisler.update(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Kayıt bulunamadı' });
  }
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const ok = Siparisler.remove(req.params.id);
  if (!ok) {
    return res.status(404).json({ error: 'Kayıt bulunamadı' });
  }
  res.status(204).send();
});

module.exports = router;

