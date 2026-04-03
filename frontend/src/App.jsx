import React, { useState, useEffect } from 'react';
import SidebarTree from './components/SidebarTree';
import EntityTable from './components/EntityTable';
import EntityForm from './components/EntityForm';
import RecipeForm from './components/RecipeForm';

const ENTITIES = [
  {
    group: 'Yetki',
    items: [
      {
        key: 'roller',
        label: 'Roller',
        path: '/api/roller',
        fields: [{ name: 'ad', label: 'Rol Adı' }]
      }
    ]
  },
  {
    group: 'Yönetim',
    items: [
      {
        key: 'urunler',
        label: 'Ürünler',
        path: '/api/urunler',
        fields: [
          { name: 'ad', label: 'Ürün Adı' },
          { name: 'fiyat', label: 'Fiyat (₺)', type: 'number', placeholder: 'örn. 150' }
        ]
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
      },
      {
        key: 'siparis-raporu',
        label: 'Sipariş Raporu',
        path: '/api/siparisler',
        hideAdd: true
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
          {
            name: 'hammaddeId',
            label: 'Hammadde Adı',
            control: 'select',
            placeholder: 'Hammadde seçin'
          },
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
          { name: 'hammaddeId', label: 'Hammadde', placeholder: 'Hammadde adı (id değil)' },
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
  const [editRow, setEditRow] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [editRecipeRow, setEditRecipeRow] = useState(null);
  const [editRecipeValues, setEditRecipeValues] = useState({});
  const [editProductRow, setEditProductRow] = useState(null);
  const [editProductValues, setEditProductValues] = useState({});
  const [saveMessage, setSaveMessage] = useState('');
  const [allSiparisler, setAllSiparisler] = useState([]);
  const [selectedMasa, setSelectedMasa] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [payDrafts, setPayDrafts] = useState({});
  const [historyOrder, setHistoryOrder] = useState(null);
  const [historyItems, setHistoryItems] = useState([]);
  const [historyPayments, setHistoryPayments] = useState([]);
  const [hammaddeler, setHammaddeler] = useState([]);
  const [tedarikciler, setTedarikciler] = useState([]);
  const [masaAdDraft, setMasaAdDraft] = useState('');
  const [reportFrom, setReportFrom] = useState('');
  const [reportTo, setReportTo] = useState('');
  const [reportRows, setReportRows] = useState([]);

  // Masalar ekranında kartları ad (masa no) numarasina gore siralamak icin.
  // Not: Tüm ekranlarda calistigindan dolayi ad olmayan kayitlarda 0 kabul ediyoruz.
  const sortedMasalar = [...rows].sort(
    (a, b) => (Number(a.ad) || 0) - (Number(b.ad) || 0)
  );

  const [calisanlar, setCalisanlar] = useState([]);
  const [calisanDrafts, setCalisanDrafts] = useState({});

  const ROLE_BLOCKS = [
    { rolId: 'mutfak', title: 'Mutfak' },
    { rolId: 'depocu', title: 'Depo' },
    { rolId: 'garson', title: 'Karşılama' }
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
    setEditRow(null);
    setEditValues({});
    setEditRecipeRow(null);
    setEditRecipeValues({});
    setEditProductRow(null);
    setEditProductValues({});
    setPayDrafts({});
    setAllSiparisler([]);
    setSelectedMasa(null);
    setActiveOrder(null);
    setOrderItems([]);
    setHistoryOrder(null);
    setHistoryItems([]);
    setHistoryPayments([]);
    setTedarikciler([]);
    setReportRows([]);
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

          // Mutfak ekranında sipariş içeriğini göster (hangi ürünler)
          if (selected.view === 'kitchen') {
            try {
              const [detRes, urunRes] = await Promise.all([
                fetch('/api/siparis-detay'),
                fetch('/api/urunler')
              ]);
              if (detRes.ok && urunRes.ok) {
                const [detData, urunData] = await Promise.all([detRes.json(), urunRes.json()]);
                const detaylar = Array.isArray(detData) ? detData : [];
                const urunMap = new Map(
                  (Array.isArray(urunData) ? urunData : []).map((u) => [u.id, u.ad])
                );
                const bySiparis = new Map();
                for (const d of detaylar) {
                  if (!d.siparisId) continue;
                  const arr = bySiparis.get(d.siparisId) || [];
                  arr.push(d);
                  bySiparis.set(d.siparisId, arr);
                }
                rowsData = rowsData.map((r) => {
                  const det = bySiparis.get(r.id) || [];
                  const urunlerText =
                    det.length === 0
                      ? 'Ürün yok'
                      : det
                          .map(
                            (x) => `${urunMap.get(x.urunId) || x.urunId} x${x.adet || 1}`
                          )
                          .join(', ');
                  return { ...r, urunler: urunlerText };
                });
              }
            } catch {
              // opsiyonel
            }
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
                (Array.isArray(hamData) ? hamData : []).map((h) => [
                  h.id,
                  { ad: h.ad, birim: h.birim }
                ])
              );
              rowsData = rowsData.map((r) => ({
                ...r,
                urun: urunMap.get(r.urunId) || r.urunId,
                hammadde: hamMap.get(r.hammaddeId)?.ad || r.hammaddeId,
                birim: hamMap.get(r.hammaddeId)?.birim || ''
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

  // Sipariş raporu: default bugun (00:00-23:59)
  useEffect(() => {
    if (!selected || selected.key !== 'siparis-raporu') return;
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const isoLocal = (d) => {
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
        d.getHours()
      )}:${pad(d.getMinutes())}`;
    };
    setReportFrom(isoLocal(start));
    setReportTo(isoLocal(end));
  }, [selected]);

  // Rapor: tarih değişince otomatik yükle (default: bugünün raporu)
  useEffect(() => {
    if (!selected || selected.key !== 'siparis-raporu') return;
    if (!reportFrom || !reportTo) return;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const rows = await loadSiparisRaporu(reportFrom, reportTo);
        setReportRows(rows);
      } catch (e) {
        setError(e.message || 'Rapor alınamadı');
      } finally {
        setLoading(false);
      }
    })();
  }, [selected, reportFrom, reportTo]);

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
      Promise.allSettled([ensureHammaddelerLoaded(), ensureTedarikcilerLoaded()]);
    }
  }, [showAdd, selected]);

  const handleCreate = async () => {
    setSaveMessage('');
    const body = { ...formValues };

    try {
      // basit validasyonlar
      if (selected?.key === 'hammaddeler') {
        const ad = (body.ad || '').toString().trim();
        if (!ad) {
          setSaveMessage('Hammadde adı boş olamaz.');
          return;
        }
      }

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

  const handleCreateReceteler = async ({ urunId, ingredients }) => {
    setSaveMessage('');
    setError('');
    try {
      const postList = (ingredients || []).map((ing) =>
        fetch('/api/receteler', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            urunId,
            hammaddeId: ing.hammaddeId,
            miktar: ing.miktar
          })
        }).then(async (r) => {
          if (!r.ok) {
            const err = await r.json().catch(() => ({}));
            throw new Error(err.error || 'Reçete eklenemedi');
          }
          return r.json();
        })
      );

      await Promise.all(postList);

      // Listeyi yenile + urun/hammadde join
      setLoading(true);
      setShowAdd(false);
      const enriched = await refreshReceteler();
      setRows(enriched);
      setSaveMessage('Reçete eklendi.');
    } catch (e) {
      setSaveMessage(e.message || 'Reçete eklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!selected) return;
    try {
      setSaveMessage('');
      setError('');
      const res = await fetch(`${selected.path}/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 409) {
          setSaveMessage(err.error || 'Bu kayıt silinemez.');
          setError('');
          return;
        }
        throw new Error(err.error || 'Kayıt silinemedi');
      }
      // listeyi yenile
      if (selected.key === 'receteler') {
        setLoading(true);
        const enriched = await refreshReceteler();
        setRows(enriched);
      } else {
        const listRes = await fetch(selected.path);
        if (!listRes.ok) throw new Error('Liste yenilenemedi');
        const data = await listRes.json();
        setRows(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      setError(e.message || 'Silme sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (row) => {
    if (!selected || selected.key !== 'kullanicilar') return;
    setEditRow(row);
    setEditValues((prev) => ({
      ...prev,
      ...row
    }));
    setShowAdd(false);
    setSaveMessage('');
    setError('');
  };

  const handleEditRecipe = async (row) => {
    if (!selected || selected.key !== 'receteler') return;
    setShowAdd(false);
    setEditRow(null);
    setEditValues({});
    setSaveMessage('');
    setError('');
    try {
      await ensureHammaddelerLoaded();
    } catch {
      // seçenekler yüklenemezse yine de edit aç
    }
    setEditRecipeRow(row);
    setEditRecipeValues({
      id: row.id,
      urunId: row.urunId,
      hammaddeId: row.hammaddeId,
      miktar: row.miktar
    });
  };

  const handleUpdateRecipe = async () => {
    if (!selected || selected.key !== 'receteler' || !editRecipeRow) return;
    setSaveMessage('');
    setError('');
    try {
      const res = await fetch(`/api/receteler/${editRecipeRow.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urunId: editRecipeValues.urunId,
          hammaddeId: editRecipeValues.hammaddeId,
          miktar: editRecipeValues.miktar
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Reçete güncellenemedi');
      }
      await res.json();

      setSaveMessage('Reçete güncellendi.');
      setEditRecipeRow(null);
      setEditRecipeValues({});

      // Listeyi yenile (join dahil)
      setLoading(true);
      const enriched = await refreshReceteler();
      setRows(enriched);
    } catch (e) {
      setSaveMessage(e.message || 'Reçete güncellenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (row) => {
    if (!selected || selected.key !== 'urunler') return;
    setShowAdd(false);
    setEditRow(null);
    setEditValues({});
    setEditRecipeRow(null);
    setEditRecipeValues({});
    setSaveMessage('');
    setError('');
    setEditProductRow(row);
    setEditProductValues({
      id: row.id,
      ad: row.ad,
      fiyat: row.fiyat
    });
  };

  const handleUpdateProduct = async () => {
    if (!selected || selected.key !== 'urunler' || !editProductRow) return;
    setSaveMessage('');
    setError('');
    try {
      const res = await fetch(`/api/urunler/${editProductRow.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ad: editProductValues.ad,
          fiyat: editProductValues.fiyat
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Ürün güncellenemedi');
      }
      await res.json();
      setSaveMessage('Ürün güncellendi.');
      setEditProductRow(null);
      setEditProductValues({});

      // listeyi yenile
      setLoading(true);
      const listRes = await fetch('/api/urunler');
      if (!listRes.ok) throw new Error('Liste yenilenemedi');
      const data = await listRes.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setSaveMessage(e.message || 'Ürün güncellenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selected || selected.key !== 'kullanicilar' || !editRow) return;

    const fields = selected.fields || [];
    const body = {};
    for (const f of fields) body[f.name] = editValues?.[f.name];

    setSaveMessage('');
    try {
      const res = await fetch(`${selected.path}/${editRow.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Kullanıcı güncellenemedi');

      setSaveMessage('Kullanıcı güncellendi.');
      setEditRow(null);
      setEditValues({});

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

  const loadSiparisRaporu = async (fromValue, toValue) => {
    const from = fromValue ? new Date(fromValue) : null;
    const to = toValue ? new Date(toValue) : null;

    const [sipRes, detRes, urunRes, masaRes] = await Promise.all([
      fetch('/api/siparisler'),
      fetch('/api/siparis-detay'),
      fetch('/api/urunler'),
      fetch('/api/masalar')
    ]);
    if (!sipRes.ok) throw new Error('Siparişler alınamadı');
    if (!detRes.ok) throw new Error('Sipariş detayları alınamadı');

    const [siparislerData, detayData, urunlerData, masalarData] = await Promise.all([
      sipRes.json(),
      detRes.json(),
      urunRes.ok ? urunRes.json() : Promise.resolve([]),
      masaRes.ok ? masaRes.json() : Promise.resolve([])
    ]);

    const siparisler = Array.isArray(siparislerData) ? siparislerData : [];
    const detaylar = Array.isArray(detayData) ? detayData : [];

    const urunMap = new Map(
      (Array.isArray(urunlerData) ? urunlerData : []).map((u) => [u.id, u.ad])
    );
    const masaMap = new Map(
      (Array.isArray(masalarData) ? masalarData : []).map((m) => [m.id, m.ad])
    );

    const inRange = (iso) => {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return false;
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    };

    const filtered = siparisler
      .filter((s) => inRange(s.olusturmaTarihi || s.odemeTarihi || s.tarih))
      .sort((a, b) => {
        const da = new Date(a.olusturmaTarihi || a.odemeTarihi || a.tarih || 0).getTime();
        const db = new Date(b.olusturmaTarihi || b.odemeTarihi || b.tarih || 0).getTime();
        return da - db;
      });

    const formatDurumTr = (durum) => {
      const d = String(durum || '').toLowerCase();
      const map = {
        kapatildi: 'Kapatıldı',
        bekliyor: 'Bekliyor',
        hazirlaniyor: 'Hazırlanıyor',
        hazir: 'Hazır',
        rezerve: 'Rezerve',
        acik: 'Açık'
      };
      if (map[d]) return map[d];
      // bilinmeyen durumlarda ilk harfi büyüt
      return d ? d.charAt(0).toLocaleUpperCase('tr-TR') + d.slice(1) : '';
    };

    const bySiparis = new Map();
    for (const d of detaylar) {
      if (!d.siparisId) continue;
      const arr = bySiparis.get(d.siparisId) || [];
      arr.push(d);
      bySiparis.set(d.siparisId, arr);
    }

    const rows = filtered.map((s, idx) => {
      const det = bySiparis.get(s.id) || [];
      const urunList = det
        .map((x) => `${urunMap.get(x.urunId) || x.urunId} (${x.adet || 1})`)
        .join(', ');
      return {
        siparisNo: idx + 1,
        masa: masaMap.get(s.masaId) || s.masaId,
        durum: formatDurumTr(s.durum),
        toplamTutar: s.toplamTutar || 0,
        tarih: s.olusturmaTarihi || '',
        urunler: urunList
      };
    });

    return rows;
  };

  const refreshReceteler = async () => {
    const [recRes, urunRes, hamRes] = await Promise.all([
      fetch('/api/receteler'),
      fetch('/api/urunler'),
      fetch('/api/hammaddeler')
    ]);
    if (!recRes.ok) throw new Error('Reçeteler yenilenemedi');

    const [recData, urunData, hamData] = await Promise.all([
      recRes.json(),
      urunRes.ok ? urunRes.json() : Promise.resolve([]),
      hamRes.ok ? hamRes.json() : Promise.resolve([])
    ]);

    const urunMap = new Map(
      (Array.isArray(urunData) ? urunData : []).map((u) => [u.id, u.ad])
    );
    const hamMap = new Map(
      (Array.isArray(hamData) ? hamData : []).map((h) => [
        h.id,
        { ad: h.ad, birim: h.birim }
      ])
    );

    return (Array.isArray(recData) ? recData : []).map((r) => ({
      ...r,
      urun: urunMap.get(r.urunId) || r.urunId,
      hammadde: hamMap.get(r.hammaddeId)?.ad || r.hammaddeId,
      birim: hamMap.get(r.hammaddeId)?.birim || ''
    }));
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

    // odeme detaylari (urun bazli odemeler)
    let paidMap = new Map();
    try {
      const payDetRes = await fetch('/api/odeme-detay');
      if (payDetRes.ok) {
        const payDetData = await payDetRes.json();
        const list = Array.isArray(payDetData) ? payDetData : [];
        for (const p of list) {
          const key = p.siparisDetayId;
          const adet = Number(p.adet) || 0;
          if (!key) continue;
          paidMap.set(key, (paidMap.get(key) || 0) + adet);
        }
      }
    } catch {
      // opsiyonel
    }

    const map = new Map(products.map((p) => [p.id, p]));
    const enriched = items.map((it) => {
      const p = map.get(it.urunId);
      const paidAdet = paidMap.get(it.id) || 0;
      const kalanAdet = Math.max(0, (Number(it.adet) || 0) - paidAdet);
      return {
        ...it,
        urunAd: p?.ad || it.urunId,
        birimFiyat: it.birimFiyat ?? p?.fiyat ?? 0,
        araToplam: it.araToplam ?? (it.adet || 0) * (p?.fiyat ?? 0),
        paidAdet,
        kalanAdet
      };
    });
    setOrderItems(enriched);
  };

  const buildPayUnits = () => {
    // Her siparisDetay kalemi için kalanAdet kadar satır üret (tek tek ödeme).
    const units = [];
    for (const it of orderItems) {
      const kalan = Number(it.kalanAdet) || 0;
      for (let i = 0; i < kalan; i++) {
        units.push({
          unitKey: `${it.id}:${i}`,
          siparisDetayId: it.id,
          urunAd: it.urunAd,
          birimFiyat: it.birimFiyat
        });
      }
    }
    return units;
  };

  const handleSplitPay = async () => {
    if (!activeOrder) return;
    setSaveMessage('');
    setError('');

    const units = buildPayUnits();
    const picked = units.filter((u) => Boolean(payDrafts[u.unitKey]));

    const countMap = new Map();
    for (const u of picked) {
      countMap.set(u.siparisDetayId, (countMap.get(u.siparisDetayId) || 0) + 1);
    }
    const items = Array.from(countMap.entries()).map(([siparisDetayId, adet]) => ({
      siparisDetayId,
      adet
    }));

    if (items.length === 0) {
      setSaveMessage('Ödenecek ürün seçin.');
      return;
    }

    try {
      const res = await fetch('/api/odemeler/split', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siparisId: activeOrder.id,
          odemeTuru: 'nakit',
          items
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 409) {
          setSaveMessage(err.error || 'Bu ödeme yapılamadı.');
          setError('');
          return;
        }
        throw new Error(err.error || 'Ödeme alınamadı');
      }
      await res.json();

      setSaveMessage('Ödeme alındı.');
      setPayDrafts({});
      await loadOrderItems(activeOrder.id);
      await refreshSiparisler();
    } catch (e) {
      setSaveMessage(e.message || 'Ödeme alınamadı');
    }
  };

  const handleMasaClick = async (masa) => {
    // Aynı masaya tekrar tıklanırsa detay panelini kapat
    if (selectedMasa && (selectedMasa.id === masa.id || selectedMasa.ad === masa.ad)) {
      // Eğer yanlışlıkla tıklandıysa ve henüz ürün eklenmediyse siparişi iptal edebil
      if (activeOrder && (!orderItems || orderItems.length === 0)) {
        const ok = window.confirm('Siparişte ürün yok. Siparişi iptal etmek ister misiniz?');
        if (ok) {
          try {
            setSaveMessage('');
            setError('');
            const delRes = await fetch(`/api/siparisler/${activeOrder.id}`, { method: 'DELETE' });
            if (!delRes.ok) {
              const err = await delRes.json().catch(() => ({}));
              // ilişkili kayıt varsa zaten silinemez
              setSaveMessage(err.error || 'Sipariş iptal edilemedi.');
            } else {
              setAllSiparisler((prev) => prev.filter((s) => s.id !== activeOrder.id));
              setSaveMessage('Sipariş iptal edildi.');
            }
          } catch (e) {
            setSaveMessage(e.message || 'Sipariş iptal edilemedi.');
          }
        }
      }
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
      setMasaAdDraft(String(masa.ad || '').trim());
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

  const handleUpdateMasaAd = async () => {
    if (!selectedMasa) return;
    const ad = String(masaAdDraft || '').trim();
    if (!ad) {
      setSaveMessage('Masa numarası boş olamaz.');
      return;
    }
    try {
      setSaveMessage('');
      setError('');
      const res = await fetch(`/api/masalar/${selectedMasa.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ad,
          kapasite: selectedMasa.kapasite ?? null,
          rezerveDurum: selectedMasa.rezerveDurum ?? null,
          rezervasyonTarihi: selectedMasa.rezervasyonTarihi ?? null
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Masa güncellenemedi');
      }
      const updated = await res.json();
      setSelectedMasa((prev) => (prev ? { ...prev, ...updated } : prev));
      setRows((prev) => prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m)));
      setSaveMessage('Masa numarası güncellendi.');
    } catch (e) {
      setSaveMessage(e.message || 'Masa güncellenemedi');
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
      setSelectedProductId('');
      setSelectedQuantity(1);

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

  const payUnits = buildPayUnits();

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
          {showAdd && selected?.key === 'receteler' ? (
            <RecipeForm
              hammaddeler={hammaddeler}
              products={products}
              onSubmit={handleCreateReceteler}
              onCancel={() => {
                setShowAdd(false);
                setSaveMessage('');
              }}
              errorMessage={null}
            />
          ) : (
            showAdd && (
              <EntityForm
                title={`Yeni ${selected?.label} Kaydı`}
                fields={
                  selected?.key === 'receteler'
                    ? []
                    : selected?.key === 'stok-hareketleri'
                    ? (selected?.fields || []).map((f) => {
                        if (f.name === 'hammaddeId' && f.control === 'select') {
                          return {
                            ...f,
                            options: hammaddeler.map((h) => ({ value: h.id, label: h.ad }))
                          };
                        }
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
            )
          )}
          {editRow && selected?.key === 'kullanicilar' && (
            <EntityForm
              title="Kullanıcı Düzenle"
              fields={selected?.fields || []}
              values={editValues}
              onChange={(name, value) =>
                setEditValues((prev) => ({
                  ...prev,
                  [name]: value
                }))
              }
              onSubmit={handleUpdateUser}
              onCancel={() => {
                setEditRow(null);
                setEditValues({});
                setSaveMessage('');
              }}
              saveMessage={saveMessage}
            />
          )}
          {editRecipeRow && selected?.key === 'receteler' && (
            <EntityForm
              title="Reçete Düzenle"
              fields={[
                { name: 'urunId', label: 'Ürün Adı' },
                {
                  name: 'hammaddeId',
                  label: 'Hammadde',
                  control: 'select',
                  placeholder: 'Hammadde seçin',
                  options: hammaddeler.map((h) => ({ value: h.id, label: h.ad }))
                },
                { name: 'miktar', label: 'Miktar', type: 'number' }
              ]}
              values={editRecipeValues}
              onChange={(name, value) =>
                setEditRecipeValues((prev) => ({
                  ...prev,
                  [name]: value
                }))
              }
              onSubmit={handleUpdateRecipe}
              onCancel={() => {
                setEditRecipeRow(null);
                setEditRecipeValues({});
                setSaveMessage('');
              }}
              saveMessage={saveMessage}
            />
          )}
          {editProductRow && selected?.key === 'urunler' && (
            <EntityForm
              title="Ürün Düzenle"
              fields={[
                { name: 'ad', label: 'Ürün Adı' },
                { name: 'fiyat', label: 'Fiyat (₺)', type: 'number' }
              ]}
              values={editProductValues}
              onChange={(name, value) =>
                setEditProductValues((prev) => ({
                  ...prev,
                  [name]: value
                }))
              }
              onSubmit={handleUpdateProduct}
              onCancel={() => {
                setEditProductRow(null);
                setEditProductValues({});
                setSaveMessage('');
              }}
              saveMessage={saveMessage}
            />
          )}
          {loading && <div>Yükleniyor...</div>}
          {error && <div className="error">{error}</div>}
          {!loading && !error && saveMessage && selected?.key !== 'masalar' && (
            <div className="save-message">{saveMessage}</div>
          )}
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
                                    setSaveMessage('');
                                    setError('');
                                    const ok = window.confirm(
                                      'Silmek istediğinize emin misiniz?'
                                    );
                                    if (!ok) return;
                                    const delRes = await fetch(
                                      `/api/calisanlar/${t.id}`,
                                      { method: 'DELETE' }
                                    );
                                    if (!delRes.ok) {
                                      const err = await delRes.json().catch(() => ({}));
                                      if (delRes.status === 409) {
                                        setSaveMessage(
                                          err.error || 'Bu kayıt silinemez.'
                                        );
                                        setError('');
                                        return;
                                      }
                                      throw new Error(err.error || 'Silme başarısız');
                                    }
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
                        <h3>Masa Numarası</h3>
                        <div className="order-add-row">
                          <input
                            className="add-input"
                            value={masaAdDraft}
                            onChange={(e) => setMasaAdDraft(e.target.value)}
                            placeholder="örn. 1"
                            style={{ maxWidth: 160 }}
                          />
                          <button
                            type="button"
                            className="ghost-btn"
                            onClick={handleUpdateMasaAd}
                          >
                            Kaydet
                          </button>
                        </div>
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
                          {orderItems.flatMap((it) => {
                            const kalan = Number(it.kalanAdet) || 0;
                            // Kalan adet kadar satır göster (tek tek ödeme için)
                            return Array.from({ length: Math.max(0, kalan) }, (_, idx) => (
                              <div key={`${it.id}:${idx}`} className="order-item">
                                <div>
                                  <div className="order-item-name">{it.urunAd}</div>
                                  <div className="order-item-sub">₺{it.birimFiyat}</div>
                                </div>
                                <div className="order-item-total">₺{it.birimFiyat}</div>
                              </div>
                            ));
                          })}
                          {orderItems.length === 0 && (
                            <div>Bu masa için henüz ürün eklenmemiş.</div>
                          )}
                        </div>
                      </div>
                      <div className="order-products" style={{ marginTop: 12 }}>
                        <h3>Ürün Bazlı Ödeme</h3>
                        {payUnits.length === 0 ? (
                          <div>Ödeme alınacak ürün yok.</div>
                        ) : (
                          <div className="pay-list">
                            {payUnits.map((u) => (
                              <label key={u.unitKey} className="pay-row pay-row-check">
                                <input
                                  type="checkbox"
                                  checked={Boolean(payDrafts[u.unitKey])}
                                  onChange={(e) =>
                                    setPayDrafts((prev) => ({
                                      ...prev,
                                      [u.unitKey]: e.target.checked
                                    }))
                                  }
                                />
                                <div className="pay-left">
                                  <div className="order-item-name">{u.urunAd}</div>
                                  <div className="order-item-sub">₺{u.birimFiyat}</div>
                                </div>
                              </label>
                            ))}
                            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                              <button
                                type="button"
                                className="primary-btn"
                                onClick={handleSplitPay}
                              >
                                Seçilenleri Öde
                              </button>
                              <button
                                type="button"
                                className="ghost-btn"
                                onClick={() => setPayDrafts({})}
                              >
                                Temizle
                              </button>
                            </div>
                          </div>
                        )}
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
                  {selected?.key === 'siparis-raporu' ? (
                    <div className="order-panel" style={{ marginTop: 0 }}>
                      <h2>Sipariş Raporu</h2>
                      <div className="order-add-row" style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <label className="add-label">Başlangıç</label>
                          <input
                            className="add-input"
                            type="datetime-local"
                            value={reportFrom}
                            onChange={(e) => setReportFrom(e.target.value)}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <label className="add-label">Bitiş</label>
                          <input
                            className="add-input"
                            type="datetime-local"
                            value={reportTo}
                            onChange={(e) => setReportTo(e.target.value)}
                          />
                        </div>
                        <button
                          type="button"
                          className="primary-btn"
                          onClick={async () => {
                            try {
                              setLoading(true);
                              setError('');
                              const rows = await loadSiparisRaporu(reportFrom, reportTo);
                              setReportRows(rows);
                            } catch (e) {
                              setError(e.message || 'Rapor alınamadı');
                            } finally {
                              setLoading(false);
                            }
                          }}
                        >
                          Raporu Getir
                        </button>
                      </div>
                      <EntityTable rows={reportRows} />
                    </div>
                  ) : selected?.view === 'kitchen' ? (
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
                              {o.urunler != null && (
                                <div className="kitchen-sub" style={{ marginTop: 4 }}>
                                  {o.urunler}
                                </div>
                              )}
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
                      onRowClick={
                        selected?.key === 'siparisler'
                          ? handleHistoryClick
                          : selected?.key === 'kullanicilar'
                          ? handleEditUser
                          : selected?.key === 'receteler'
                          ? handleEditRecipe
                          : selected?.key === 'urunler'
                          ? handleEditProduct
                          : undefined
                      }
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

