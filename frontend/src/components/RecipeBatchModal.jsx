import React, { useMemo, useState } from 'react';

const UNIT_OPTIONS = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'gr', label: 'Gram (gr)' },
  { value: 'lt', label: 'Litre (lt)' },
  { value: 'adet', label: 'Adet' }
];

function RecipeBatchModal({ products = [], hammaddeler = [], onClose, onSaved }) {
  const [recipes, setRecipes] = useState([
    { urunAdi: '', items: [{ hammaddeId: '', birim: 'kg', miktar: '' }] }
  ]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const hamMap = useMemo(() => new Map(hammaddeler.map((h) => [h.id, h])), [hammaddeler]);

  const updateRecipe = (idx, patch) => {
    setRecipes((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const updateItem = (rIdx, iIdx, patch) => {
    setRecipes((prev) =>
      prev.map((r, ri) => {
        if (ri !== rIdx) return r;
        const items = r.items.map((it, ii) => (ii === iIdx ? { ...it, ...patch } : it));
        return { ...r, items };
      })
    );
  };

  const addRecipe = () => {
    setRecipes((prev) => [
      ...prev,
      { urunAdi: '', items: [{ hammaddeId: '', birim: 'kg', miktar: '' }] }
    ]);
  };

  const removeRecipe = (idx) => {
    setRecipes((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));
  };

  const addItem = (rIdx) => {
    setRecipes((prev) =>
      prev.map((r, ri) =>
        ri === rIdx
          ? { ...r, items: [...r.items, { hammaddeId: '', birim: 'kg', miktar: '' }] }
          : r
      )
    );
  };

  const removeItem = (rIdx, iIdx) => {
    setRecipes((prev) =>
      prev.map((r, ri) => {
        if (ri !== rIdx) return r;
        if (r.items.length <= 1) return r;
        return { ...r, items: r.items.filter((_, ii) => ii !== iIdx) };
      })
    );
  };

  const validate = () => {
    for (const r of recipes) {
      if (!String(r.urunAdi || '').trim()) return 'Ürün adını girmelisiniz.';
      for (const it of r.items) {
        if (!String(it.hammaddeId || '').trim()) return 'Hammadde seçmelisiniz.';
        if (!String(it.birim || '').trim()) return 'Birim seçmelisiniz.';
        const m = Number(it.miktar);
        if (Number.isNaN(m) || m <= 0) return 'Miktar 0’dan büyük olmalı.';
        const hamBirim = String(hamMap.get(it.hammaddeId)?.birim || '').trim();
        if (hamBirim && hamBirim !== it.birim) {
          return 'Seçilen birim, hammaddenin birimi ile aynı olmalı.';
        }
      }
    }
    return '';
  };

  const handleSave = async () => {
    const err = validate();
    if (err) {
      setMessage(err);
      return;
    }
    setMessage('');
    setSaving(true);
    try {
      const payload = {
        recipes: recipes.map((r) => ({
          urunId: r.urunAdi,
          items: r.items.map((it) => ({
            hammaddeId: it.hammaddeId,
            birim: it.birim,
            miktar: Number(it.miktar) || 0
          }))
        }))
      };
      const res = await fetch('/api/receteler/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || 'Reçete kaydedilemedi');
      }
      await res.json();
      onSaved?.();
      onClose?.();
    } catch (e) {
      setMessage(e.message || 'Reçete kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title">Reçete Girişi</div>
          <button type="button" className="ghost-btn" onClick={onClose}>
            Kapat
          </button>
        </div>

        {message && <div className="save-message">{message}</div>}

        <div className="modal-body">
          {recipes.map((r, rIdx) => (
            <div key={rIdx} className="modal-section">
              <div className="modal-section-head">
                <div style={{ flex: 1 }}>
                  <label className="add-label">Ürün Adı</label>
                  <input
                    className="add-input"
                    value={r.urunAdi}
                    onChange={(e) => updateRecipe(rIdx, { urunAdi: e.target.value })}
                    placeholder="örn. Pizza"
                    list={`products-datalist-${rIdx}`}
                  />
                  <datalist id={`products-datalist-${rIdx}`}>
                    {products.map((p) => (
                      <option key={p.id} value={p.ad} />
                    ))}
                  </datalist>
                </div>
                <button
                  type="button"
                  className="danger-btn"
                  onClick={() => removeRecipe(rIdx)}
                  disabled={recipes.length <= 1}
                >
                  Ürünü Kaldır
                </button>
              </div>

              <div className="modal-items">
                {r.items.map((it, iIdx) => (
                  <div key={iIdx} className="modal-item-row">
                    <div style={{ flex: 1 }}>
                      <label className="add-label">Hammadde</label>
                      <select
                        className="add-input"
                        value={it.hammaddeId}
                        onChange={(e) => updateItem(rIdx, iIdx, { hammaddeId: e.target.value })}
                      >
                        <option value="">Hammadde seçin</option>
                        {hammaddeler.map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.ad}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ width: 180 }}>
                      <label className="add-label">Birim</label>
                      <select
                        className="add-input"
                        value={it.birim}
                        onChange={(e) => updateItem(rIdx, iIdx, { birim: e.target.value })}
                      >
                        {UNIT_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ width: 140 }}>
                      <label className="add-label">Miktar</label>
                      <input
                        className="add-input"
                        type="number"
                        min="0"
                        value={it.miktar}
                        onChange={(e) => updateItem(rIdx, iIdx, { miktar: e.target.value })}
                        placeholder="0"
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                      <button
                        type="button"
                        className="ghost-btn"
                        onClick={() => removeItem(rIdx, iIdx)}
                        disabled={r.items.length <= 1}
                      >
                        Kaldır
                      </button>
                    </div>
                  </div>
                ))}
                <button type="button" className="ghost-btn" onClick={() => addItem(rIdx)}>
                  + Hammadde Ekle
                </button>
              </div>
            </div>
          ))}

          <button type="button" className="ghost-btn" onClick={addRecipe}>
            + Ürün Ekle
          </button>
        </div>

        <div className="modal-footer">
          <button type="button" className="primary-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecipeBatchModal;

