import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// A shared connection pool used across the app.
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'store_ratings',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true,
});

// Small helper so callers can `const rows = await query(sql, params)`.
export async function query(sql, params) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}
