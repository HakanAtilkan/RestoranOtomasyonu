const express = require('express');
const { GorevTanimlari } = require('../models');
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
  if (!pool) return res.json(GorevTanimlari.findAll());

  pool
    .query('SELECT * FROM gorev_tanimlari')
    .then(([rows]) => res.json(rows))
    .catch((e) => res.status(500).json({ error: e.message }));
});

router.post('/', (req, res) => {
  const pool = tryGetPool();
  const payload = req.body || {};
  const rolId = (payload.rolId || '').toString().trim();
  const gorevAdi = (payload.gorevAdi || '').toString().trim();

  if (!rolId || !gorevAdi) {
    return res.status(400).json({ error: 'rolId ve gorevAdi zorunlu' });
  }

  if (!pool) {
    const created = GorevTanimlari.create({ rolId, gorevAdi });
    return res.status(201).json(created);
  }

  const id = newId();
  pool
    .query('INSERT INTO gorev_tanimlari (id, rolId, gorevAdi) VALUES (?,?,?)', [
      id,
      rolId,
      gorevAdi
    ])
    .then(() => res.status(201).json({ id, rolId, gorevAdi }))
    .catch((e) => res.status(500).json({ error: e.message }));
});

module.exports = router;

