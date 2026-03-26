import React from 'react';

function formatDateTimeTr(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatCell(col, value) {
  // Tarih alanları: tarih, ...Tarihi
  const c = String(col || '').toLowerCase();
  if (c === 'tarih' || c.endsWith('tarihi')) {
    const formatted = formatDateTimeTr(value);
    if (formatted) return formatted;
  }
  return value == null ? '' : String(value);
}

function EntityTable({ rows, onDelete, onRowClick }) {
  if (!rows || rows.length === 0) {
    return <div>Henüz kayıt yok. Sağ üstteki + ile yeni kayıt ekleyebilirsin.</div>;
  }

  let columns = Object.keys(rows[0] || {});
  // Kullanıcıya sadece anlamlı alanları göster
  // - "id" kolonu
  // - ...Id ile biten teknik kolonlar (masaId, urunId vb.)
  const visibleColumns = columns.filter(
    (c) => c !== 'id' && c.toLowerCase() !== 'sifre' && !c.toLowerCase().endsWith('id')
  );
  if (visibleColumns.length > 0) {
    columns = visibleColumns;
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col}>{col}</th>
            ))}
            {onDelete && <th>Aksiyonlar</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id || JSON.stringify(row)}
              className={onRowClick ? 'clickable-row' : undefined}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((col) => (
                <td key={col}>{formatCell(col, row[col])}</td>
              ))}
              {onDelete && (
                <td>
                  {row.id && (
                    <button
                      type="button"
                      className="danger-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          !window.confirm('Silmek istediğinize emin misiniz?')
                        ) {
                          return;
                        }
                        onDelete(row.id);
                      }}
                    >
                      Sil
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EntityTable;

