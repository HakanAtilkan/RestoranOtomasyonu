const express = require('express');
const { Kullanicilar, Roller } = require('../models');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(Kullanicilar.findAll());
});

router.post('/', (req, res) => {
  const created = Kullanicilar.create(req.body);
  res.status(201).json(created);
});

router.post('/login', (req, res) => {
  const { kullaniciAdi, sifre } = req.body || {};
  if (!kullaniciAdi || !sifre) {
    return res.status(400).json({ error: 'Kullanıcı adı ve şifre zorunlu' });
  }

  const user = Kullanicilar.findAll().find(
    (u) =>
      u.kullaniciAdi &&
      u.kullaniciAdi.toLowerCase() === String(kullaniciAdi).toLowerCase() &&
      u.sifre === String(sifre)
  );

  if (!user) {
    return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı' });
  }

  const role = user.rolId
    ? Roller.findById(user.rolId) || { id: user.rolId, ad: user.rolId }
    : null;

  res.json({
    id: user.id,
    username: user.kullaniciAdi,
    ad: user.ad,
    soyad: user.soyad,
    rolId: user.rolId,
    rol: role ? { id: role.id, ad: role.ad } : null
  });
});

router.delete('/:id', (req, res) => {
  const ok = Kullanicilar.remove(req.params.id);
  if (!ok) {
    return res.status(404).json({ error: 'Kayıt bulunamadı' });
  }
  res.status(204).send();
});

module.exports = router;

