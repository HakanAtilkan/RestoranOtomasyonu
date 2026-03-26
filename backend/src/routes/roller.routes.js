const express = require('express');
const { Roller, Kullanicilar } = require('../models');
const { getPool } = require('../config/db');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(Roller.findAll());
});

router.post('/', (req, res) => {
  const created = Roller.create(req.body);
  res.status(201).json(created);
});

router.delete('/:id', (req, res) => {
  let pool;
  try {
    pool = getPool();
  } catch {
    pool = null;
  }

  const rolId = req.params.id;

  if (!pool) {
    const used = Kullanicilar.findAll().some((u) => u.rolId === rolId);
    if (used) {
      return res.status(409).json({
        error: 'Bu rol kullanıcılar tarafından kullanıldığı için silinemez'
      });
    }
    const ok = Roller.remove(rolId);
    if (!ok) return res.status(404).json({ error: 'Kayıt bulunamadı' });
    return res.status(204).send();
  }

  pool
    .query('SELECT COUNT(*) as c FROM kullanicilar WHERE rolId=?', [rolId])
    .then(([rows]) => {
      const count = Number(rows?.[0]?.c || 0);
      if (count > 0) {
        return res.status(409).json({
          error: 'Bu rol kullanıcılar tarafından kullanıldığı için silinemez'
        });
      }
      pool
        .query('DELETE FROM roller WHERE id=?', [rolId])
        .then(([result]) => {
          if (!result.affectedRows) return res.status(404).json({ error: 'Kayıt bulunamadı' });
          res.status(204).send();
        })
        .catch((e) => res.status(500).json({ error: e.message }));
    })
    .catch((e) => res.status(500).json({ error: e.message }));
});

module.exports = router;

