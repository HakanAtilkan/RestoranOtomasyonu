const mysql = require('mysql2/promise');

let pool;

function getPool() {
  if (pool) return pool;

  const urlStr = process.env.MYSQL_URL;
  if (!urlStr) {
    throw new Error('MYSQL_URL env bulunamadı');
  }

  const url = new URL(urlStr);
  pool = mysql.createPool({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace('/', ''),
    waitForConnections: true,
    connectionLimit: 10
  });

  return pool;
}

module.exports = { getPool };

