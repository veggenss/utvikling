const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'user', //db brukernavn
    password: 'pass', //bruker passord
    database: 'your_database', //navn på databasen
    socketPath: '/run/mysqld/mysqld.sock',
    waitForConnections: true,
    connectionLimit: 10,
});

async function conn(sql, params = []) {
  let conn;
  try {
    conn = await pool.getConnection();
    const [rows] = await conn.execute(sql, params);
    return rows;
  }
  catch (err) {
    throw err;
  }
  finally {
    if (conn) conn.release();
  }
}

module.exports = {
    conn
};