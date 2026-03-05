import React, { useState } from 'react';

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Lütfen kullanıcı adı ve şifre girin.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/kullanicilar/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kullaniciAdi: username, sifre: password })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Giriş yapılamadı');
      }
      const data = await res.json();

      // rolId'den frontend rol anahtarını belirle
      let roleKey = 'admin';
      if (data.rolId === 'depocu') roleKey = 'depo';
      else if (data.rolId === 'mutfak') roleKey = 'mutfak';
      else if (data.rolId === 'garson') roleKey = 'kasa';
      else if (data.rolId === 'yonetici') roleKey = 'admin';

      onLogin({
        id: data.id,
        username: data.username,
        displayName: `${data.ad || ''} ${data.soyad || ''}`.trim() || data.username,
        role: roleKey
      });
    } catch (err) {
      setError(err.message || 'Giriş yapılamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-layout">
      <div className="login-card">
        <div className="login-logo">Restoran Otomasyonu</div>
        <h1 className="login-title">Giriş Yap</h1>
        <p className="login-subtitle">Lütfen hesabınızla sisteme giriş yapın.</p>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label htmlFor="username">Kullanıcı Adı</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="örn. garson1"
            />
          </div>
          <div className="login-field">
            <label htmlFor="password">Şifre</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="●●●●●●●●"
            />
          </div>
          {error && <div className="login-error">{error}</div>}
          <button type="submit" className="primary-btn login-button" disabled={loading}>
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;

