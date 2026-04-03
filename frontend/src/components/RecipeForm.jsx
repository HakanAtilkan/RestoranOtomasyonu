import React, { useMemo, useState } from 'react';

function RecipeForm({
  hammaddeler = [],
  products = [],
  initialUrunId = '',
  onSubmit,
  onCancel,
  errorMessage
}) {
  const [urunId, setUrunId] = useState(initialUrunId);
  const [ingredients, setIngredients] = useState([
    { hammaddeId: '', miktar: '' }
  ]);

  const hamMap = useMemo(() => new Map(hammaddeler.map((h) => [h.id, h])), [hammaddeler]);

  const canAddMore = ingredients.length < 20;

  const updateIngredient = (idx, patch) => {
    setIngredients((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, ...patch } : it))
    );
  };

  const removeIngredient = (idx) => {
    setIngredients((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));
  };

  const isValid = () => {
    const u = String(urunId || '').trim();
    if (!u) return false;
    return ingredients.every((it) => {
      const h = String(it.hammaddeId || '').trim();
      if (!h) return false;
      const m = Number(it.miktar);
      if (Number.isNaN(m) || m <= 0) return false;
      const ham = hamMap.get(h);
      const birim = (ham?.birim || '').toString().trim();
      return Boolean(birim);
    });
  };

  const handleSubmit = () => {
    if (!isValid()) return;
    const payload = {
      urunId,
      ingredients: ingredients.map((it) => ({
        hammaddeId: String(it.hammaddeId).trim(),
        miktar: Number(it.miktar) || 0
      }))
    };
    onSubmit(payload);
  };

  return (
    <div className="add-panel">
      <div className="add-panel-header">Yeni Reçete</div>
      {errorMessage && <div className="error">{errorMessage}</div>}
      <div className="add-panel-grid">
        <div className="add-field">
          <label className="add-label" htmlFor="urunId">
            Ürün
          </label>
          <select
            id="urunId"
            className="add-input"
            value={urunId}
            onChange={(e) => setUrunId(e.target.value)}
          >
            <option value="">Ürün seçin</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.ad}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="recipe-ingredients">
        {ingredients.map((it, idx) => (
          <div key={idx} className="recipe-row">
            <div className="recipe-col">
              <select
                className="add-input"
                value={it.hammaddeId}
                onChange={(e) => updateIngredient(idx, { hammaddeId: e.target.value })}
              >
                <option value="">Hammadde seçin</option>
                {hammaddeler.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.ad}
                  </option>
                ))}
              </select>
              {it.hammaddeId && (
                <div className="order-item-sub" style={{ marginTop: 4 }}>
                  Birim:{' '}
                  {String(hamMap.get(it.hammaddeId)?.birim || '').trim() || '—'}
                </div>
              )}
            </div>
            <div className="recipe-col" style={{ maxWidth: 140 }}>
              <input
                className="add-input"
                type="number"
                min="1"
                value={it.miktar}
                onChange={(e) => updateIngredient(idx, { miktar: e.target.value })}
                placeholder="Miktar"
              />
            </div>
            <div className="recipe-col recipe-actions">
              <button
                type="button"
                className="ghost-btn recipe-remove-btn"
                onClick={() => removeIngredient(idx)}
                disabled={ingredients.length <= 1}
              >
                Kaldır
              </button>
            </div>
          </div>
        ))}

        <div className="recipe-add-row">
          <button
            type="button"
            className="ghost-btn"
            onClick={() =>
              canAddMore &&
              setIngredients((prev) => [
                ...prev,
                { hammaddeId: '', miktar: '' }
              ])
            }
            disabled={!canAddMore}
          >
            + Hammadde Ekle
          </button>
        </div>
      </div>

      <div className="add-actions">
        <button
          type="button"
          className="primary-btn"
          onClick={handleSubmit}
          disabled={!isValid()}
        >
          Kaydet
        </button>
        <button type="button" onClick={onCancel} className="ghost-btn">
          İptal
        </button>
      </div>
    </div>
  );
}

export default RecipeForm;

