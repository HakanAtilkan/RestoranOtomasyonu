const express = require('express');
const { Calisanlar } = require('../models');
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
  if (!pool) {
    return res.json(Calisanlar.findAll());
  }

  pool
    .query('SELECT * FROM calisanlar ORDER BY rolId, ad')
    .then(([rows]) => res.json(rows))
    .catch((e) => res.status(500).json({ error: e.message }));
});

router.post('/', (req, res) => {
  const pool = tryGetPool();
  const payload = req.body || {};

  const rolId = (payload.rolId || '').toString().trim();
  const ad = (payload.ad || '').toString().trim();
  const soyad = (payload.soyad || '').toString().trim();
  const gorevAdi = (payload.gorevAdi || '').toString().trim();

  if (!rolId || !ad || !soyad || !gorevAdi) {
    return res.status(400).json({ error: 'rolId, ad, soyad, gorevAdi zorunlu' });
  }

  if (!pool) {
    const created = Calisanlar.create({ rolId, ad, soyad, gorevAdi });
    return res.status(201).json(created);
  }

  const id = newId();
  pool
    .query(
      'INSERT INTO calisanlar (id, rolId, ad, soyad, gorevAdi) VALUES (?,?,?,?,?)',
      [id, rolId, ad, soyad, gorevAdi]
    )
    .then(() => res.status(201).json({ id, rolId, ad, soyad, gorevAdi }))
    .catch((e) => res.status(500).json({ error: e.message }));
});

router.delete('/:id', (req, res) => {
  const pool = tryGetPool();
  const { id } = req.params;

  if (!pool) {
    const ok = Calisanlar.remove(id);
    if (!ok) return res.status(404).json({ error: 'Kayıt bulunamadı' });
    return res.status(204).send();
  }

  pool
    .query('DELETE FROM calisanlar WHERE id=?', [id])
    .then(([result]) => {
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Kayıt bulunamadı' });
      }
      res.status(204).send();
    })
    .catch((e) => res.status(500).json({ error: e.message }));
});

module.exports = router;

