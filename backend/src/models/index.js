const { createCollection } = require('./core');

// Roller, kullanıcılar, işlemler, rol_islem
const Roller = createCollection([
  { id: 'yonetici', ad: 'Yönetici' },
  { id: 'garson', ad: 'Garson' },
  { id: 'depocu', ad: 'Depocu' },
  { id: 'mutfak', ad: 'Mutfak' }
]);

const Kullanicilar = createCollection([
  { id: 'u-admin', kullaniciAdi: 'admin', sifre: '123123', ad: 'Admin', soyad: 'Kullanıcı', rolId: 'yonetici' },
  { id: 'u-depo', kullaniciAdi: 'depo', sifre: '123123', ad: 'Depo', soyad: 'Görevlisi', rolId: 'depocu' },
  { id: 'u-garson', kullaniciAdi: 'garson', sifre: '123123', ad: 'Garson', soyad: 'Kullanıcı', rolId: 'garson' },
  { id: 'u-mutfak', kullaniciAdi: 'mutfak', sifre: '123123', ad: 'Mutfak', soyad: 'Personeli', rolId: 'mutfak' }
]);

const Islemler = createCollection([]);

const RolIslem = createCollection([]);

// Masalar, siparisler, siparis_detay, urunler
const Masalar = createCollection([]);

const Urunler = createCollection([]);

const Siparisler = createCollection([]);
const SiparisDetay = createCollection([]);

// Odemeler, odeme_detay
const Odemeler = createCollection([]);
const OdemeDetay = createCollection([]);

// Hammaddeler, receteler, stok_hareketleri, tedarikciler
const Hammaddeler = createCollection([]);

const Receteler = createCollection([]);

const StokHareketleri = createCollection([]);

const Tedarikciler = createCollection([]);

// Gorev tanimlari (rol bazli)
const GorevTanimlari = createCollection([]);

// Calisanlar (isim/soyisim/gorev tanimi)
const Calisanlar = createCollection([]);

module.exports = {
  Roller,
  Kullanicilar,
  Islemler,
  RolIslem,
  Masalar,
  Urunler,
  Siparisler,
  SiparisDetay,
  Odemeler,
  OdemeDetay,
  Hammaddeler,
  Receteler,
  StokHareketleri,
  Tedarikciler
  ,
  GorevTanimlari,
  Calisanlar
};

