const express = require('express');

const router = express.Router();

router.use('/roller', require('./roller.routes'));
router.use('/kullanicilar', require('./kullanicilar.routes'));
router.use('/islemler', require('./islemler.routes'));
router.use('/rol-islem', require('./rolIslem.routes'));

router.use('/masalar', require('./masalar.routes'));
router.use('/siparisler', require('./siparisler.routes'));
router.use('/siparis-detay', require('./siparisDetay.routes'));
router.use('/urunler', require('./urunler.routes'));

router.use('/odemeler', require('./odemeler.routes'));
router.use('/odeme-detay', require('./odemeDetay.routes'));

router.use('/hammaddeler', require('./hammaddeler.routes'));
router.use('/receteler', require('./receteler.routes'));
router.use('/stok-hareketleri', require('./stokHareketleri.routes'));
router.use('/tedarikciler', require('./tedarikciler.routes'));

router.use('/gorev-tanimlari', require('./gorevTanimlari.routes'));

module.exports = router;

