const { getPool } = require('../config/db');

async function initDb() {
  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS roller (
      id VARCHAR(64) PRIMARY KEY,
      ad VARCHAR(255) NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS kullanicilar (
      id VARCHAR(64) PRIMARY KEY,
      kullaniciAdi VARCHAR(64) NOT NULL UNIQUE,
      sifre VARCHAR(255) NOT NULL,
      ad VARCHAR(255),
      soyad VARCHAR(255),
      rolId VARCHAR(64),
      INDEX (rolId)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS masalar (
      id VARCHAR(64) PRIMARY KEY,
      ad VARCHAR(255) NOT NULL,
      kapasite INT,
      rezerveDurum VARCHAR(16),
      rezervasyonTarihi VARCHAR(64)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS hammaddeler (
      id VARCHAR(64) PRIMARY KEY,
      ad VARCHAR(255) NOT NULL UNIQUE,
      miktar DOUBLE DEFAULT 0,
      birim VARCHAR(16)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tedarikciler (
      id VARCHAR(64) PRIMARY KEY,
      ad VARCHAR(255) NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tedarikci_urunler (
      tedarikciId VARCHAR(64) NOT NULL,
      urunId VARCHAR(64) NOT NULL,
      PRIMARY KEY (tedarikciId, urunId)
    )
  `);

  // Tedarikçinin tedarik ettiği hammaddeler (yeni ilişki)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tedarikci_hammaddeler (
      tedarikciId VARCHAR(64) NOT NULL,
      hammaddeId VARCHAR(64) NOT NULL,
      PRIMARY KEY (tedarikciId, hammaddeId)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS stok_hareketleri (
      id VARCHAR(64) PRIMARY KEY,
      hammaddeId VARCHAR(64) NOT NULL,
      tedarikciId VARCHAR(64),
      tip VARCHAR(16) NOT NULL,
      miktar DOUBLE DEFAULT 0,
      tarih VARCHAR(64)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS urunler (
      id VARCHAR(64) PRIMARY KEY,
      ad VARCHAR(255) NOT NULL,
      fiyat DOUBLE DEFAULT 0
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS receteler (
      id VARCHAR(64) PRIMARY KEY,
      urunId VARCHAR(64) NOT NULL,
      hammaddeId VARCHAR(64) NOT NULL,
      miktar DOUBLE DEFAULT 0,
      birim VARCHAR(16)
    )
  `);

  // Eski kurulumlarda receteler.birim olmayabilir (güvenli alter)
  try {
    await pool.query(`ALTER TABLE receteler ADD COLUMN birim VARCHAR(16)`);
  } catch {
    // kolon zaten varsa hata verir, görmezden gel
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS siparisler (
      id VARCHAR(64) PRIMARY KEY,
      masaId VARCHAR(64) NOT NULL,
      kullaniciId VARCHAR(64),
      durum VARCHAR(32),
      toplamTutar DOUBLE DEFAULT 0,
      olusturmaTarihi VARCHAR(64)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS siparis_detay (
      id VARCHAR(64) PRIMARY KEY,
      siparisId VARCHAR(64) NOT NULL,
      urunId VARCHAR(64) NOT NULL,
      adet INT DEFAULT 1,
      birimFiyat DOUBLE DEFAULT 0,
      araToplam DOUBLE DEFAULT 0
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS odemeler (
      id VARCHAR(64) PRIMARY KEY,
      siparisId VARCHAR(64) NOT NULL,
      toplamTutar DOUBLE DEFAULT 0,
      odemeTarihi VARCHAR(64)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS odeme_detay (
      id VARCHAR(64) PRIMARY KEY,
      odemeId VARCHAR(64) NOT NULL,
      siparisDetayId VARCHAR(64) NOT NULL,
      adet INT DEFAULT 1,
      tutar DOUBLE DEFAULT 0,
      odemeTuru VARCHAR(32),
      INDEX (odemeId),
      INDEX (siparisDetayId)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS gorev_tanimlari (
      id VARCHAR(64) PRIMARY KEY,
      rolId VARCHAR(64) NOT NULL,
      gorevAdi VARCHAR(255) NOT NULL,
      INDEX (rolId)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS calisanlar (
      id VARCHAR(64) PRIMARY KEY,
      rolId VARCHAR(64) NOT NULL,
      ad VARCHAR(255) NOT NULL,
      soyad VARCHAR(255) NOT NULL,
      gorevAdi VARCHAR(255) NOT NULL,
      INDEX (rolId)
    )
  `);

  // temel seed (sadece tablo boşsa)
  const [[{ count: roleCount }]] = await pool.query(`SELECT COUNT(*) as count FROM roller`);
  if (Number(roleCount) === 0) {
    await pool.query(
      `INSERT INTO roller (id, ad) VALUES ?`,
      [[
        ['yonetici', 'Yönetici'],
        ['garson', 'Garson'],
        ['depocu', 'Depocu'],
        ['mutfak', 'Mutfak']
      ]]
    );
  }

  const [[{ count: userCount }]] = await pool.query(
    `SELECT COUNT(*) as count FROM kullanicilar`
  );
  if (Number(userCount) === 0) {
    await pool.query(
      `INSERT INTO kullanicilar (id, kullaniciAdi, sifre, ad, soyad, rolId) VALUES ?`,
      [[
        ['u-admin', 'admin', '123123', 'Admin', 'Kullanıcı', 'yonetici'],
        ['u-depo', 'depo', '123123', 'Depo', 'Görevlisi', 'depocu'],
        ['u-garson', 'garson', '123123', 'Garson', 'Kullanıcı', 'garson'],
        ['u-mutfak', 'mutfak', '123123', 'Mutfak', 'Personeli', 'mutfak']
      ]]
    );
  }
}

module.exports = { initDb };

