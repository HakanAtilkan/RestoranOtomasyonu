import React, { useState, useEffect } from 'react';
import SidebarTree from './components/SidebarTree';
import EntityTable from './components/EntityTable';
import EntityForm from './components/EntityForm';

const ENTITIES = [
  {
    group: 'Yetki',
    items: [
      {
        key: 'roller',
        label: 'Roller',
        path: '/api/roller',
        fields: [{ name: 'ad', label: 'Rol Adı' }]
      },
      {
        key: 'kullanicilar',
        label: 'Kullanıcılar',
        path: '/api/kullanicilar',
        fields: [
          { name: 'kullaniciAdi', label: 'Kullanıcı Adı' },
          { name: 'sifre', label: 'Şifre', type: 'password' },
          { name: 'ad', label: 'İsim' },
          { name: 'soyad', label: 'Soyisim' },
          { name: 'rolId', label: 'Rol Id' }
        ]
      }
    ]
  },
  {
    group: 'Çalışanlar',
    items: [
      {
        key: 'calisanlar',
        label: 'Çalışanlar',
        path: '/api/calisanlar',
        hideAdd: true
      }
    ]
  },
  {
    group: 'Sipariş',
    items: [
      {
        key: 'masalar',
        label: 'Masalar',
        path: '/api/masalar',
        fields: [
          {
            name: 'ad',
            label: 'Masa Numarası',
            type: 'number',
            placeholder: '1'
          },
          { name: 'kapasite', label: 'Kapasite', type: 'number' },
          {
            name: 'rezerveDurum',
            label: 'Rezerve Durumu',
            control: 'select',
            placeholder: 'Seçiniz',
            options: [
              { value: 'hayir', label: 'Rezerve Değil' },
              { value: 'evet', label: 'Rezerve' }
            ]
          },
          {
            name: 'rezervasyonTarihi',
            label: 'Rezervasyon Tarihi',
            type: 'datetime-local',
            placeholder: 'GG/AA/YYYY SS:DD'
          }
        ]
      },
      {
        key: 'siparisler',
        label: 'Sipariş Geçmişi',
        path: '/api/siparisler',
        hideAdd: true,
        filterStatus: ['kapatildi'],
        fields: [
          { name: 'masaId', label: 'Masa Id' },
          { name: 'kullaniciId', label: 'Kullanıcı Id' },
          { name: 'durum', label: 'Durum (acik/kapatildi)' }
        ]
      }
    ]
  },
  {
    group: 'Stok',
    items: [
      {
        key: 'hammaddeler',
        label: 'Hammaddeler',
        path: '/api/hammaddeler',
        fields: [
          { name: 'ad', label: 'Hammadde Adı' },
          { name: 'miktar', label: 'Miktar', type: 'number', placeholder: 'Sayı girin' },
          {
            name: 'birim',
            label: 'Birim',
            control: 'select',
            placeholder: 'Birim seçin',
            options: [
              { value: 'kg', label: 'Kilogram (kg)' },
              { value: 'lt', label: 'Litre (lt)' },
              { value: 'gr', label: 'Gram (gr)' },
              { value: 'adet', label: 'Adet' }
            ]
          }
        ],
        hideAdd: true
      },
      {
        key: 'stok-hareketleri',
        label: 'Stok Hareketleri',
        path: '/api/stok-hareketleri',
        fields: [
          { name: 'hammaddeId', label: 'Hammadde Adı' },
          {
            name: 'tedarikciId',
            label: 'Tedarikçi Adı',
            control: 'select',
            placeholder: 'Tedarikçi seçin'
          },
          {
            name: 'birim',
            label: 'Birim',
            control: 'select',
            placeholder: 'Birim seçin',
            options: [
              { value: 'kg', label: 'Kilogram (kg)' },
              { value: 'lt', label: 'Litre (lt)' },
              { value: 'gr', label: 'Gram (gr)' },
              { value: 'adet', label: 'Adet' }
            ]
          },
          { name: 'miktar', label: 'Miktar', type: 'number', placeholder: 'Sayı girin' }
        ]
      },
      {
        key: 'tedarikciler',
        label: 'Tedarikçiler',
        path: '/api/tedarikciler',
        fields: [
          { name: 'ad', label: 'Tedarikçi Adı' },
          {
            name: 'urunlerText',
            label: 'Ürünler (virgülle)',
            placeholder: 'örn. domates, biber, soğan'
          }
        ]
      }
    ]
  },
  {
    group: 'Mutfak',
    items: [
      {
        key: 'receteler',
        label: 'Reçeteler',
        path: '/api/receteler',
        fields: [
          // Ürün adı artık serbest metin, select değil
          { name: 'urunId', label: 'Ürün Adı' },
          { name: 'hammaddeId', label: 'Hammadde', control: 'select', placeholder: 'Hammadde seçin' },
          { name: 'miktar', label: 'Gramaj (gr)', type: 'number', placeholder: 'örn. 120' }
        ]
      },
      {
        key: 'beklenen-siparisler',
        label: 'Beklenen Siparişler',
        path: '/api/siparisler',
        hideAdd: true,
        view: 'kitchen',
        filterStatus: ['bekliyor']
      },
      {
        key: 'hazirlanan-siparisler',
        label: 'Hazırlanan Siparişler',
        path: '/api/siparisler',
        hideAdd: true,
        view: 'kitchen',
        filterStatus: ['hazirlaniyor']
      },
      {
        key: 'hazir-siparisler',
        label: 'Hazır Siparişler',
        path: '/api/siparisler',
        hideAdd: true,
        view: 'kitchen',
        filterStatus: ['hazir']
      }
    ]
  }
];

function getEntitiesForRole(role) {
  if (role === 'kasa') {
    // sadece masalar
    return ENTITIES.map((group) => {
      if (group.group !== 'Sipariş') return { ...group, items: [] };
      return {
        ...group,
        items: group.items.filter((item) => item.key === 'masalar')
      };
    }).filter((g) => g.items.length > 0);
  }

  if (role === 'depo') {
    // sadece stok grubu
    return ENTITIES.filter((group) => group.group === 'Stok');
  }

  if (role === 'mutfak') {
    // sadece mutfak grubu
    return ENTITIES.filter((group) => group.group === 'Mutfak');
  }

  // admin: hepsi
  return ENTITIES;
}

function App({ currentUser }) {
  const role = currentUser?.role || 'admin';
  const visibleEntities = getEntitiesForRole(role);
  const initialSelected = visibleEntities[0]?.items[0] || null;

  const [selected, setSelected] = useState(initialSelected);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [saveMessage, setSaveMessage] = useState('');
  const [allSiparisler, setAllSiparisler] = useState([]);
  const [selectedMasa, setSelectedMasa] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [historyOrder, setHistoryOrder] = useState(null);
  const [historyItems, setHistoryItems] = useState([]);
  const [historyPayments, setHistoryPayments] = useState([]);
  const [hammaddeler, setHammaddeler] = useState([]);
  const [tedarikciler, setTedarikciler] = useState([]);

  // Masalar ekranında kartları ad (masa no) numarasina gore siralamak icin.
  // Not: Tüm ekranlarda calistigindan dolayi ad olmayan kayitlarda 0 kabul ediyoruz.
  const sortedMasalar = [...rows].sort(
    (a, b) => (Number(a.ad) || 0) - (Number(b.ad) || 0)
  );

  const [calisanlar, setCalisanlar] = useState([]);
  const [calisanDrafts, setCalisanDrafts] = useState({});

  const ROLE_BLOCKS = [
    { rolId: 'garson', title: 'Garson' },
    { rolId: 'depocu', title: 'Depocu' },
    { rolId: 'mutfak', title: 'Mutfak' }
  ];

  useEffect(() => {
    // rol değiştiğinde uygun ilk menü öğesine geç
    const first = visibleEntities[0]?.items[0] || null;
    setSelected(first);
  }, [role]);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    setError('');
    setSaveMessage('');
    setFormValues({});
    setAllSiparisler([]);
    setSelectedMasa(null);
    setActiveOrder(null);
    setOrderItems([]);
    setHistoryOrder(null);
    setHistoryItems([]);
    setHistoryPayments([]);
    setTedarikciler([]);
    fetch(selected.path)
      .then(async (res) => {
        if (!res.ok) throw new Error('Sunucudan veri alınamadı');
        return res.json();
      })
      .then(async (data) => {
        let rowsData = Array.isArray(data) ? data : [];

        // filter (örn: sipariş geçmişi / mutfak listeleri)
        if (selected.filterStatus && Array.isArray(selected.filterStatus)) {
          rowsData = rowsData.filter((r) => selected.filterStatus.includes(r.durum));
        }

        // Depo ekranlarında ID yerine isim ve birim göstermek için join
        if (selected.key === 'stok-hareketleri') {
          try {
            const [hamRes, tedRes] = await Promise.all([
              fetch('/api/hammaddeler'),
              fetch('/api/tedarikciler')
            ]);
            if (hamRes.ok && tedRes.ok) {
              const [hamData, tedData] = await Promise.all([
                hamRes.json(),
                tedRes.json()
              ]);
              const hamMap = new Map(
                (Array.isArray(hamData) ? hamData : []).map((h) => [h.id, h])
              );
              const tedMap = new Map(
                (Array.isArray(tedData) ? tedData : []).map((t) => [t.id, t.ad])
              );
              rowsData = rowsData.map((r) => ({
                ...r,
                hammadde: hamMap.get(r.hammaddeId)?.ad || r.hammaddeId,
                birim: hamMap.get(r.hammaddeId)?.birim || '',
                tedarikci: r.tedarikciId ? tedMap.get(r.tedarikciId) || r.tedarikciId : ''
              }));
            }
          } catch {
            // join başarısız olursa ham ID'lerle devam et
          }
        } else if (selected.view === 'kitchen' || selected.key === 'siparisler') {
          // sipariş ekranlarında masaId/kullaniciId yerine ad göster
          try {
            const [masRes, kulRes] = await Promise.all([
              fetch('/api/masalar'),
              fetch('/api/kullanicilar')
            ]);
            if (masRes.ok && kulRes.ok) {
              const [masData, kulData] = await Promise.all([masRes.json(), kulRes.json()]);
              const masMap = new Map(
                (Array.isArray(masData) ? masData : []).map((m) => [m.id, m.ad])
              );
              const kulMap = new Map(
                (Array.isArray(kulData) ? kulData : []).map((k) => [
                  k.id,
                  `${k.ad || ''} ${k.soyad || ''}`.trim()
                ])
              );
              rowsData = rowsData.map((r) => ({
                ...r,
                masa: masMap.get(r.masaId) || r.masaId,
                kullanici: kulMap.get(r.kullaniciId) || r.kullaniciId
              }));
            }
          } catch {
            // join opsiyonel
          }
        } else if (selected.key === 'receteler') {
          try {
            const [urunRes, hamRes] = await Promise.all([
              fetch('/api/urunler'),
              fetch('/api/hammaddeler')
            ]);
            if (urunRes.ok && hamRes.ok) {
              const [urunData, hamData] = await Promise.all([
                urunRes.json(),
                hamRes.json()
              ]);
              const urunMap = new Map(
                (Array.isArray(urunData) ? urunData : []).map((u) => [u.id, u.ad])
              );
              const hamMap = new Map(
                (Array.isArray(hamData) ? hamData : []).map((h) => [h.id, h.ad])
              );
              rowsData = rowsData.map((r) => ({
                ...r,
                urun: urunMap.get(r.urunId) || r.urunId,
                hammadde: hamMap.get(r.hammaddeId) || r.hammaddeId
              }));
            }
          } catch {
            // görsel join zorunlu değil
          }
        }

        setRows(rowsData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    if (selected.key === 'masalar') {
      // masalar ekranında tüm siparişleri da çek
      fetch('/api/siparisler')
        .then(async (res) => {
          if (!res.ok) throw new Error('Siparişler alınamadı');
          return res.json();
        })
        .then((data) => setAllSiparisler(Array.isArray(data) ? data : []))
        .catch(() => {
          // hata olursa sessiz geç
          setAllSiparisler([]);
        });
    }
  }, [selected]);

  // Çalışanlar / görev tanımları için ayrı yükleme
  useEffect(() => {
    if (!selected || selected.key !== 'calisanlar') return;
    (async () => {
      setLoading(true);
      setError('');
      setSaveMessage('');
      try {
        const res = await fetch('/api/calisanlar');
        if (!res.ok) throw new Error('Çalışanlar alınamadı');
        const data = await res.json();
        setCalisanlar(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message || 'Çalışanlar yüklenemedi');
      } finally {
        setLoading(false);
      }
    })();
  }, [selected]);

  useEffect(() => {
    if (!showAdd || !selected) return;
    if (selected.key === 'receteler') {
      // reçete eklerken dropdown seçenekleri hazır olsun
      Promise.allSettled([ensureProductsLoaded(), ensureHammaddelerLoaded()]);
    }
    if (selected.key === 'stok-hareketleri') {
      // stok hareketi eklerken tedarikçi seçenekleri hazır olsun
      Promise.allSettled([ensureTedarikcilerLoaded()]);
    }
  }, [showAdd, selected]);

  const handleCreate = async () => {
    setSaveMessage('');
    const body = { ...formValues };

    try {
      const res = await fetch(selected.path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        throw new Error('Kayıt oluşturulamadı');
      }
      await res.json();
      setSaveMessage('Kayıt eklendi.');
      setShowAdd(false);
      // listeyi yenile
      setLoading(true);
      setError('');
      const listRes = await fetch(selected.path);
      if (!listRes.ok) throw new Error('Liste yenilenemedi');
      const data = await listRes.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setSaveMessage(e.message || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!selected) return;
    try {
      const res = await fetch(`${selected.path}/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('Kayıt silinemedi');
      }
      // listeyi yenile
      const listRes = await fetch(selected.path);
      if (!listRes.ok) throw new Error('Liste yenilenemedi');
      const data = await listRes.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || 'Silme sırasında hata oluştu');
    }
  };

  const ensureProductsLoaded = async () => {
    if (products.length > 0) return;
    const res = await fetch('/api/urunler');
    if (!res.ok) throw new Error('Ürünler alınamadı');
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
  };

  const ensureHammaddelerLoaded = async () => {
    if (hammaddeler.length > 0) return;
    const res = await fetch('/api/hammaddeler');
    if (!res.ok) throw new Error('Hammaddeler alınamadı');
    const data = await res.json();
    setHammaddeler(Array.isArray(data) ? data : []);
  };

  const ensureTedarikcilerLoaded = async () => {
    if (tedarikciler.length > 0) return;
    const res = await fetch('/api/tedarikciler');
    if (!res.ok) throw new Error('Tedarikçiler alınamadı');
    const data = await res.json();
    setTedarikciler(Array.isArray(data) ? data : []);
  };

  const updateOrder = async (orderId, patch) => {
    const upd = await fetch(`/api/siparisler/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    });
    if (!upd.ok) throw new Error('Sipariş güncellenemedi');
    return await upd.json();
  };

  const refreshSiparisler = async () => {
    const res = await fetch('/api/siparisler');
    if (!res.ok) throw new Error('Siparişler alınamadı');
    const data = await res.json();
    setAllSiparisler(Array.isArray(data) ? data : []);
    return Array.isArray(data) ? data : [];
  };

  const loadOrderItems = async (siparisId) => {
    const detRes = await fetch('/api/siparis-detay');
    if (!detRes.ok) throw new Error('Sipariş detayları alınamadı');
    const detData = await detRes.json();
    const items = (Array.isArray(detData) ? detData : []).filter(
      (d) => d.siparisId === siparisId
    );
    const map = new Map(products.map((p) => [p.id, p]));
    const enriched = items.map((it) => {
      const p = map.get(it.urunId);
      return {
        ...it,
        urunAd: p?.ad || it.urunId,
        birimFiyat: it.birimFiyat ?? p?.fiyat ?? 0,
        araToplam: it.araToplam ?? (it.adet || 0) * (p?.fiyat ?? 0)
      };
    });
    setOrderItems(enriched);
  };

  const handleMasaClick = async (masa) => {
    // Aynı masaya tekrar tıklanırsa detay panelini kapat
    if (selectedMasa && (selectedMasa.id === masa.id || selectedMasa.ad === masa.ad)) {
      setSelectedMasa(null);
      setActiveOrder(null);
      setOrderItems([]);
      setPaymentAmount('');
      setPaymentNote('');
      setSaveMessage('');
      return;
    }

    try {
      await ensureProductsLoaded();
      setSelectedMasa(masa);
      // mevcut açık sipariş var mı?
      let order =
        allSiparisler.find((s) => s.masaId === masa.id && s.durum !== 'kapatildi') || null;
      if (!order) {
        const res = await fetch('/api/siparisler', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            masaId: masa.id,
            kullaniciId: currentUser?.username || 'kasa',
            durum: 'bekliyor'
          })
        });
        if (!res.ok) throw new Error('Sipariş oluşturulamadı');
        order = await res.json();
        setAllSiparisler((prev) => [...prev, order]);
      }
      setActiveOrder(order);
      await loadOrderItems(order.id);
    } catch (e) {
      setError(e.message || 'Masa için sipariş alınırken hata oluştu');
    }
  };

  const handleAddItem = async () => {
    if (!activeOrder) return;
    const qty = Number(selectedQuantity) || 1;
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) {
      setSaveMessage('Lütfen ürün seçin.');
      return;
    }
    try {
      setSaveMessage('');
      const birimFiyat = Number(product.fiyat) || 0;
      const araToplam = birimFiyat * qty;
      const res = await fetch('/api/siparis-detay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siparisId: activeOrder.id,
          urunId: product.id,
          adet: qty,
          birimFiyat,
          araToplam
        })
      });
      if (!res.ok) throw new Error('Ürün eklenemedi');
      await res.json();
      await loadOrderItems(activeOrder.id);

      // sipariş toplamını güncelle
      const detRes = await fetch('/api/siparis-detay');
      if (detRes.ok) {
        const detData = await detRes.json();
        const items = (Array.isArray(detData) ? detData : []).filter(
          (d) => d.siparisId === activeOrder.id
        );
        const total = items.reduce((sum, it) => sum + (Number(it.araToplam) || 0), 0);
        const updated = await updateOrder(activeOrder.id, { toplamTutar: total });
        setAllSiparisler((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      }
    } catch (e) {
      setSaveMessage(e.message || 'Ürün eklenirken hata oluştu');
    }
  };

  const handleKitchenAdvance = async (order, nextStatus) => {
    try {
      const updated = await updateOrder(order.id, { durum: nextStatus });
      // sidebar listesi yenilensin
      setRows((prev) => prev.filter((r) => r.id !== updated.id));
      // masalar ekranı için de güncel tut
      setAllSiparisler((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } catch (e) {
      setError(e.message || 'Sipariş güncellenemedi');
    }
  };

  const orderTotal = orderItems.reduce(
    (sum, it) => sum + (Number(it.araToplam) || 0),
    0
  );

  const handleHistoryClick = async (order) => {
    try {
      await ensureProductsLoaded();
      setHistoryOrder(order);

      // sipariş detayları
      const detRes = await fetch('/api/siparis-detay');
      if (detRes.ok) {
        const detData = await detRes.json();
        const items = (Array.isArray(detData) ? detData : []).filter(
          (d) => d.siparisId === order.id
        );
        const map = new Map(products.map((p) => [p.id, p]));
        const enriched = items.map((it) => {
          const p = map.get(it.urunId);
          const birimFiyat = it.birimFiyat ?? p?.fiyat ?? 0;
          const araToplam = it.araToplam ?? (it.adet || 0) * birimFiyat;
          return {
            ...it,
            urunAd: p?.ad || it.urunId,
            birimFiyat,
            araToplam
          };
        });
        setHistoryItems(enriched);
      } else {
        setHistoryItems([]);
      }

      // ödemeler
      const payRes = await fetch('/api/odemeler');
      if (payRes.ok) {
        const payData = await payRes.json();
        setHistoryPayments(
          (Array.isArray(payData) ? payData : []).filter(
            (o) => o.siparisId === order.id
          )
        );
      } else {
        setHistoryPayments([]);
      }
    } catch (e) {
      setError(e.message || 'Sipariş detayları yüklenemedi');
    }
  };

  const addCalisan = async (rolId) => {
    const draft = calisanDrafts[rolId] || {};
    const ad = (draft.ad || '').toString().trim();
    const soyad = (draft.soyad || '').toString().trim();
    const gorevAdi = (draft.gorevAdi || '').toString().trim();

    if (!ad || !soyad || !gorevAdi) {
      setSaveMessage('İsim, soyisim ve görev tanımı zorunlu.');
      return;
    }
    setSaveMessage('');
    try {
      const res = await fetch('/api/calisanlar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rolId, ad, soyad, gorevAdi })
      });
      if (!res.ok) throw new Error('Çalışan eklenemedi');
      const listRes = await fetch('/api/calisanlar');
      if (!listRes.ok) throw new Error('Çalışanlar yenilenemedi');
      const data = await listRes.json();
      setCalisanlar(Array.isArray(data) ? data : []);
      setCalisanDrafts((prev) => ({
        ...prev,
        [rolId]: { ad: '', soyad: '', gorevAdi: '' }
      }));
      setSaveMessage('Çalışan eklendi.');
    } catch (e) {
      setError(e.message || 'Çalışan eklenirken hata oluştu');
    }
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <SidebarTree entities={visibleEntities} selectedKey={selected?.key} onSelect={setSelected} />
      </aside>
      <main className="content">
        <header className="content-header">
          <div>
            {selected?.key === 'masalar' ? <h1>Masa Yönetimi</h1> : <h1>{selected?.label}</h1>}
            {selected?.key === 'masalar' && (
              <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: 2 }}>
                Restoran masa durumları
              </div>
            )}
          </div>
          {selected?.key === 'masalar' ? (
            <button
              type="button"
              className="primary-btn"
              onClick={() => {
                setShowAdd((prev) => !prev);
                setSaveMessage('');
                // Varsayılan: rezerve değil ve tarih olarak şu an
                const now = new Date();
                const pad = (n) => String(n).padStart(2, '0');
                const value = `${now.getFullYear()}-${pad(
                  now.getMonth() + 1
                )}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(
                  now.getMinutes()
                )}`;
                setFormValues({
                  rezerveDurum: 'hayir',
                  rezervasyonTarihi: value
                });
              }}
            >
              + Yeni Masa
            </button>
          ) : !selected?.hideAdd ? (
            <button
              type="button"
              className="primary-btn"
              onClick={() => {
                setShowAdd((prev) => !prev);
                setSaveMessage('');
                setFormValues({});
              }}
            >
              + Yeni Kayıt
            </button>
          ) : null}
        </header>
        <section className="content-body">
          {showAdd && (
            <EntityForm
              title={`Yeni ${selected?.label} Kaydı`}
              fields={
                selected?.key === 'receteler'
                  ? (selected?.fields || []).map((f) => {
                      if (f.name === 'urunId' && f.control === 'select') {
                        return {
                          ...f,
                          options: products.map((p) => ({ value: p.id, label: p.ad }))
                        };
                      }
                      if (f.name === 'hammaddeId' && f.control === 'select') {
                        return {
                          ...f,
                          options: hammaddeler.map((h) => ({ value: h.id, label: h.ad }))
                        };
                      }
                      return f;
                    })
                  : selected?.key === 'stok-hareketleri'
                  ? (selected?.fields || []).map((f) => {
                      if (f.name === 'tedarikciId' && f.control === 'select') {
                        return {
                          ...f,
                          options: tedarikciler.map((t) => ({
                            value: t.id,
                            label: t.ad
                          }))
                        };
                      }
                      return f;
                    })
                  : selected?.fields || []
              }
              values={formValues}
              onChange={(name, value) =>
                setFormValues((prev) => ({
                  ...prev,
                  [name]: value
                }))
              }
              onSubmit={handleCreate}
              onCancel={() => {
                setShowAdd(false);
                setSaveMessage('');
              }}
              saveMessage={saveMessage}
            />
          )}
          {loading && <div>Yükleniyor...</div>}
          {error && <div className="error">{error}</div>}
          {!loading && !error && (
            <>
              {selected?.key === 'calisanlar' ? (
                <div className="staff-page">
                  {ROLE_BLOCKS.map((r) => {
                    const list = calisanlar.filter((t) => t.rolId === r.rolId);
                    return (
                      <div key={r.rolId} className="staff-role-card">
                        <div className="staff-role-title">{r.title}</div>
                        <div className="staff-task-list">
                          {list.length === 0 && (
                            <div className="staff-task-empty">Henüz çalışan yok.</div>
                          )}
                          {list.map((t) => (
                            <div key={t.id} className="staff-task-row">
                              <span>
                                {t.ad} {t.soyad} - {t.gorevAdi}
                              </span>
                              <button
                                type="button"
                                className="danger-btn staff-delete-btn"
                                onClick={async () => {
                                  try {
                                    const delRes = await fetch(
                                      `/api/calisanlar/${t.id}`,
                                      { method: 'DELETE' }
                                    );
                                    if (!delRes.ok) throw new Error('Silme başarısız');
                                    const listRes = await fetch('/api/calisanlar');
                                    const data = await listRes.json();
                                    setCalisanlar(Array.isArray(data) ? data : []);
                                  } catch (e) {
                                    setError(e.message || 'Silme sırasında hata oluştu');
                                  }
                                }}
                              >
                                Sil
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="staff-add-row">
                          <input
                            className="add-input"
                            value={calisanDrafts[r.rolId]?.ad ?? ''}
                            onChange={(e) =>
                              setCalisanDrafts((prev) => ({
                                ...prev,
                                [r.rolId]: {
                                  ...(prev[r.rolId] || {}),
                                  ad: e.target.value
                                }
                              }))
                            }
                            placeholder="İsim"
                          />
                          <input
                            className="add-input"
                            value={calisanDrafts[r.rolId]?.soyad ?? ''}
                            onChange={(e) =>
                              setCalisanDrafts((prev) => ({
                                ...prev,
                                [r.rolId]: {
                                  ...(prev[r.rolId] || {}),
                                  soyad: e.target.value
                                }
                              }))
                            }
                            placeholder="Soyisim"
                          />
                          <input
                            className="add-input"
                            value={calisanDrafts[r.rolId]?.gorevAdi ?? ''}
                            onChange={(e) =>
                              setCalisanDrafts((prev) => ({
                                ...prev,
                                [r.rolId]: {
                                  ...(prev[r.rolId] || {}),
                                  gorevAdi: e.target.value
                                }
                              }))
                            }
                            placeholder="Görev tanımı"
                          />
                          <button
                            type="button"
                            className="primary-btn"
                            onClick={() => addCalisan(r.rolId)}
                          >
                            Ekle
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : selected?.key === 'masalar' ? (
                <>
                  <div className="masa-summary">
                    {(() => {
                      const statuses = rows.map((masa) => {
                        const sipForMasa = allSiparisler.filter((s) => s.masaId === masa.id);
                        const hasActive = sipForMasa.some((s) =>
                          ['bekliyor', 'hazirlaniyor', 'hazir'].includes(s.durum)
                        );
                        const reservedBySiparis = sipForMasa.some((s) => s.durum === 'rezerve');
                        const reservedByMasa = masa.rezerveDurum === 'evet';
                        const hasReserved = reservedBySiparis || reservedByMasa;
                        let status = 'bos';
                        if (hasActive) status = 'dolu';
                        else if (hasReserved) status = 'rezerve';
                        return status;
                      });
                      const emptyCount = statuses.filter((s) => s === 'bos').length;
                      const fullCount = statuses.filter((s) => s === 'dolu').length;
                      const reservedCount = statuses.filter((s) => s === 'rezerve').length;
                      return (
                        <>
                          <div className="masa-summary-card masa-summary-empty">
                            <div>Boş Masalar</div>
                            <div className="masa-summary-value">{emptyCount}</div>
                          </div>
                          <div className="masa-summary-card masa-summary-full">
                            <div>Dolu Masalar</div>
                            <div className="masa-summary-value">{fullCount}</div>
                          </div>
                          <div className="masa-summary-card masa-summary-reserved">
                            <div>Rezerve Masalar</div>
                            <div className="masa-summary-value">{reservedCount}</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <div className="masa-grid">
                    {sortedMasalar.length === 0 && <div>Henüz masa yok.</div>}
                    {sortedMasalar.map((masa) => {
                      const sipForMasa = allSiparisler.filter((s) => s.masaId === masa.id);
                      const aktifSiparisler = sipForMasa.filter((s) =>
                        ['bekliyor', 'hazirlaniyor', 'hazir'].includes(s.durum)
                      );
                      const reservedBySiparis = sipForMasa.some((s) => s.durum === 'rezerve');
                      const reservedByMasa = masa.rezerveDurum === 'evet';
                      const hasReserved = reservedBySiparis || reservedByMasa;
                      let status = 'bos';
                      let statusLabel = 'Boş';
                      let cardModifier = 'empty';
                      if (aktifSiparisler.length > 0) {
                        status = 'dolu';
                        statusLabel = 'Dolu';
                        cardModifier = 'full';
                      } else if (hasReserved) {
                        status = 'rezerve';
                        statusLabel = 'Rezerve';
                        cardModifier = 'reserved';
                      }

                      const toplamTutar = aktifSiparisler.reduce(
                        (sum, s) => sum + (s.toplamTutar || 0),
                        0
                      );

                      const urunAdedi = aktifSiparisler.length;

                      return (
                        <div
                          key={masa.id || masa.ad}
                          className={`masa-card masa-card--${cardModifier}`}
                          onClick={() => handleMasaClick(masa)}
                        >
                          <div className="masa-icon-circle">👥</div>
                          <div className="masa-name">{masa.ad || masa.id}</div>
                          {masa.kapasite != null && (
                            <div className="masa-capacity">{masa.kapasite} kişi</div>
                          )}
                          <div className="masa-status-row">
                            <span
                              className={`status-badge ${
                                status === 'dolu'
                                  ? 'status-error'
                                  : status === 'bos'
                                  ? 'status-success'
                                  : 'status-warning'
                              }`}
                            >
                              {statusLabel}
                            </span>
                          </div>
                          <div className="masa-total">
                            {toplamTutar > 0 ? `₺${toplamTutar}` : '₺0'}
                            <span className="masa-total-sub">
                              {urunAdedi > 0
                                ? `${urunAdedi} sipariş`
                                : masa.rezervasyonTarihi
                                ? new Date(masa.rezervasyonTarihi).toLocaleString()
                                : 'Sipariş yok'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {selectedMasa && activeOrder && (
                    <div className="order-panel">
                      <h2>Sipariş Detayları</h2>
                      <div className="order-products">
                        <h3>Ürün Ekle</h3>
                        <div className="order-add-row">
                          <select
                            className="add-input"
                            value={selectedProductId}
                            onChange={(e) => setSelectedProductId(e.target.value)}
                          >
                            <option value="">Ürün seçin</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.ad} – ₺{p.fiyat}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            min="1"
                            className="add-input"
                            style={{ maxWidth: 80 }}
                            value={selectedQuantity}
                            onChange={(e) => setSelectedQuantity(e.target.value)}
                          />
                          <button
                            type="button"
                            className="primary-btn"
                            onClick={handleAddItem}
                          >
                            Ekle
                          </button>
                        </div>
                        <div className="order-items">
                          {orderItems.map((it) => (
                            <div key={it.id} className="order-item">
                              <div>
                                <div className="order-item-name">{it.urunAd}</div>
                                <div className="order-item-sub">
                                  {it.adet} x ₺{it.birimFiyat}
                                </div>
                              </div>
                              <div className="order-item-total">₺{it.araToplam}</div>
                            </div>
                          ))}
                          {orderItems.length === 0 && (
                            <div>Bu masa için henüz ürün eklenmemiş.</div>
                          )}
                        </div>
                      </div>
                      <div className="order-summary">
                        <div className="order-summary-line">
                          <span>Seçilen Ürünler:</span>
                          <span>{orderItems.length}</span>
                        </div>
                        <div className="order-summary-line">
                          <span>Seçilen Tutar:</span>
                          <span className="order-summary-total">₺{orderTotal}</span>
                        </div>
                      </div>
                      {saveMessage && <div className="save-message">{saveMessage}</div>}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {selected?.view === 'kitchen' ? (
                    <div className="kitchen-list">
                      {rows.length === 0 && <div>Gösterilecek sipariş yok.</div>}
                      {rows.map((o) => (
                        <div key={o.id} className="kitchen-card">
                          <div className="kitchen-card-main">
                            <div className="kitchen-title">
                              <strong>{o.masa || o.masaId}</strong>
                              <span className="kitchen-sub">
                                #{String(o.id).slice(0, 6)} • {o.kullanici || o.kullaniciId || '-'}
                              </span>
                            </div>
                            <div className="kitchen-right">
                              <div className="kitchen-total">₺{o.toplamTutar || 0}</div>
                              <span className="status-badge status-info">{o.durum}</span>
                            </div>
                          </div>
                          <div className="kitchen-actions">
                            {selected.key === 'beklenen-siparisler' && (
                              <button
                                type="button"
                                className="primary-btn"
                                onClick={() => handleKitchenAdvance(o, 'hazirlaniyor')}
                              >
                                Hazırlamaya Başla
                              </button>
                            )}
                            {selected.key === 'hazirlanan-siparisler' && (
                              <button
                                type="button"
                                className="primary-btn"
                                onClick={() => handleKitchenAdvance(o, 'hazir')}
                              >
                                Hazır
                              </button>
                            )}
                            {selected.key === 'hazir-siparisler' && (
                              <button
                                type="button"
                                className="primary-btn"
                                onClick={() => handleKitchenAdvance(o, 'kapatildi')}
                              >
                                Teslim Edildi
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EntityTable
                      rows={rows}
                      onDelete={handleDelete}
                      onRowClick={selected?.key === 'siparisler' ? handleHistoryClick : undefined}
                    />
                  )}
                  {selected?.key === 'siparisler' && historyOrder && (
                    <div className="order-panel" style={{ marginTop: 12 }}>
                      <h2>Sipariş Detayları</h2>
                      <div className="order-products">
                        <div className="order-items">
                          {historyItems.map((it) => (
                            <div key={it.id} className="order-item">
                              <div>
                                <div className="order-item-name">{it.urunAd}</div>
                                <div className="order-item-sub">
                                  {it.adet} x ₺{it.birimFiyat}
                                </div>
                              </div>
                              <div className="order-item-total">₺{it.araToplam}</div>
                            </div>
                          ))}
                          {historyItems.length === 0 && (
                            <div>Bu sipariş için ürün bulunamadı.</div>
                          )}
                        </div>
                      </div>
                      <div className="order-summary">
                        <div className="order-summary-line">
                          <span>Toplam Ürün:</span>
                          <span>{historyItems.length}</span>
                        </div>
                        <div className="order-summary-line">
                          <span>Toplam Tutar:</span>
                          <span className="order-summary-total">
                            ₺
                            {historyItems.reduce(
                              (sum, it) => sum + (Number(it.araToplam) || 0),
                              0
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="order-payment">
                        <h3>Ödeme Kayıtları</h3>
                        {historyPayments.length === 0 && (
                          <div>Bu sipariş için ödeme kaydı yok.</div>
                        )}
                        {historyPayments.map((p) => (
                          <div key={p.id} className="order-item">
                            <div>
                              <div className="order-item-name">Ödeme</div>
                              <div className="order-item-sub">
                                {new Date(p.odemeTarihi).toLocaleString()}
                              </div>
                            </div>
                            <div className="order-item-total">₺{p.toplamTutar}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;

