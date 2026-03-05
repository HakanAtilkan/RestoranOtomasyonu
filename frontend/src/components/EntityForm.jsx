import React from 'react';

function EntityForm({ fields, values, onChange, onSubmit, onCancel, saveMessage, title }) {
  return (
    <div className="add-panel">
      <div className="add-panel-header">{title}</div>
      <div className="add-panel-grid">
        {fields.map((field) => (
          <div key={field.name} className="add-field">
            <label className="add-label" htmlFor={field.name}>
              {field.label}
            </label>
            {field.control === 'select' ? (
              <select
                id={field.name}
                className="add-input"
                value={values[field.name] ?? ''}
                onChange={(e) => onChange(field.name, e.target.value)}
              >
                <option value="">{field.placeholder || 'Seçiniz'}</option>
                {(field.options || []).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={field.name}
                type={field.type || 'text'}
                className="add-input"
                value={values[field.name] ?? ''}
                onChange={(e) => onChange(field.name, e.target.value)}
                placeholder={field.placeholder || ''}
              />
            )}
          </div>
        ))}
      </div>
      <div className="add-actions">
        <button type="button" onClick={onSubmit} className="primary-btn">
          Kaydet
        </button>
        <button type="button" onClick={onCancel} className="ghost-btn">
          İptal
        </button>
      </div>
      {saveMessage && <div className="save-message">{saveMessage}</div>}
    </div>
  );
}

export default EntityForm;

