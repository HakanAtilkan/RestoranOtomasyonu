const express = require('express');
const { Kullanicilar, Roller, Siparisler } = require('../models');
const { getPool } = require('../config/db');
const { newId } = require('../db/id');

const router = express.Router();

function tryGetPool() {
  try {
    return getPool();
  } catch {
    return null;
  }
}

router.get('/', (req, res) => {
  const pool = tryGetPool();
  if (!pool) return res.json(Kullanicilar.findAll());

  pool
    .query(
      'SELECT id, kullaniciAdi, sifre, ad, soyad, rolId FROM kullanicilar ORDER BY kullaniciAdi'
    )
    .then(([rows]) => res.json(rows))
    .catch((e) => res.status(500).json({ error: e.message }));
});

router.post('/', (req, res) => {
  const pool = tryGetPool();
  const payload = req.body || {};

  const kullaniciAdi = (payload.kullaniciAdi || '').toString().trim();
  const sifre = (payload.sifre || '').toString();
  const ad = (payload.ad || '').toString().trim();
  const soyad = (payload.soyad || '').toString().trim();
  const rolId = (payload.rolId || '').toString().trim();

  if (!kullaniciAdi || !sifre) {
    return res.status(400).json({ error: 'kullaniciAdi ve sifre zorunlu' });
  }

  if (!pool) {
    const created = Kullanicilar.create({ ...payload, kullaniciAdi, sifre, ad, soyad, rolId });
    return res.status(201).json(created);
  }

  const id = newId();
  pool
    .query(
      'INSERT INTO kullanicilar (id, kullaniciAdi, sifre, ad, soyad, rolId) VALUES (?,?,?,?,?,?)',
      [id, kullaniciAdi, sifre, ad, soyad, rolId]
    )
    .then(() => res.status(201).json({ id, kullaniciAdi, sifre, ad, soyad, rolId }))
    .catch((e) => res.status(500).json({ error: e.message }));
});

router.put('/:id', (req, res) => {
  const pool = tryGetPool();
  const payload = req.body || {};

  const id = req.params.id;
  const kullaniciAdi = (payload.kullaniciAdi || '').toString().trim();
  const sifre = (payload.sifre || '').toString();
  const ad = (payload.ad || '').toString().trim();
  const soyad = (payload.soyad || '').toString().trim();
  const rolId = (payload.rolId || '').toString().trim();

  if (!id) return res.status(400).json({ error: 'id zorunlu' });
  if (!kullaniciAdi || !sifre) {
    return res.status(400).json({ error: 'kullaniciAdi ve sifre zorunlu' });
  }

  if (!pool) {
    const updated = Kullanicilar.update(id, { kullaniciAdi, sifre, ad, soyad, rolId });
    if (!updated) return res.status(404).json({ error: 'Kayıt bulunamadı' });
    return res.status(200).json(updated);
  }

  pool
    .query(
      'UPDATE kullanicilar SET kullaniciAdi=?, sifre=?, ad=?, soyad=?, rolId=? WHERE id=?',
      [kullaniciAdi, sifre, ad, soyad, rolId, id]
    )
    .then(([result]) => {
      if (!result.affectedRows) return res.status(404).json({ error: 'Kayıt bulunamadı' });
      return res.status(200).json({ id, kullaniciAdi, sifre, ad, soyad, rolId });
    })
    .catch((e) => res.status(500).json({ error: e.message }));
});

router.post('/login', (req, res) => {
  const { kullaniciAdi, sifre } = req.body || {};
  if (!kullaniciAdi || !sifre) {
    return res.status(400).json({ error: 'Kullanıcı adı ve şifre zorunlu' });
  }

  // MySQL varsa oradan, yoksa bellek içinden
  let pool;
  try {
    pool = getPool();
  } catch {
    pool = null;
  }

  if (!pool) {
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

    return res.json({
      id: user.id,
      username: user.kullaniciAdi,
      ad: user.ad,
      soyad: user.soyad,
      rolId: user.rolId,
      rol: role ? { id: role.id, ad: role.ad } : null
    });
  }

  (async () => {
    const [users] = await pool.query(
      `SELECT id, kullaniciAdi, ad, soyad, rolId FROM kullanicilar WHERE LOWER(kullaniciAdi)=LOWER(?) AND sifre=? LIMIT 1`,
      [String(kullaniciAdi), String(sifre)]
    );

    const user = users[0];
    if (!user) {
      return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı' });
    }

    const [roles] = await pool.query(`SELECT id, ad FROM roller WHERE id=? LIMIT 1`, [
      user.rolId
    ]);
    const role = roles[0] || (user.rolId ? { id: user.rolId, ad: user.rolId } : null);

    return res.json({
      id: user.id,
      username: user.kullaniciAdi,
      ad: user.ad,
      soyad: user.soyad,
      rolId: user.rolId,
      rol: role ? { id: role.id, ad: role.ad } : null
    });
  })().catch((e) => res.status(500).json({ error: e.message }));
});

router.delete('/:id', (req, res) => {
  const pool = tryGetPool();
  const id = req.params.id;

  if (!pool) {
    const used = Siparisler.findAll().some((s) => s.kullaniciId === id);
    if (used) {
      return res.status(409).json({
        error: 'Bu kullanıcı siparişlerde kullanıldığı için silinemez'
      });
    }
    const ok = Kullanicilar.remove(id);
    if (!ok) return res.status(404).json({ error: 'Kayıt bulunamadı' });
    return res.status(204).send();
  }

  pool
    .query('SELECT COUNT(*) as c FROM siparisler WHERE kullaniciId=?', [id])
    .then(([rows]) => {
      const count = Number(rows?.[0]?.c || 0);
      if (count > 0) {
        return res.status(409).json({
          error: 'Bu kullanıcı siparişlerde kullanıldığı için silinemez'
        });
      }

      pool
        .query('DELETE FROM kullanicilar WHERE id=?', [id])
        .then(([result]) => {
          if (!result.affectedRows) return res.status(404).json({ error: 'Kayıt bulunamadı' });
          res.status(204).send();
        })
        .catch((e) => res.status(500).json({ error: e.message }));
    })
    .catch((e) => res.status(500).json({ error: e.message }));
});

module.exports = router;

