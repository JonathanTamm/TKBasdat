const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/tkbasdat',
  // SSL dimatikan untuk koneksi lokal
  ssl: {
    rejectUnauthorized: false,
  }
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Successfully connected to PostgreSQL database');
  release();
});

module.exports = {
  // Expose a query function to execute raw SQL
  query: (text, params) => pool.query(text, params),
  // Expose connect to get a client for transactions
  connect: () => pool.connect(),
};
