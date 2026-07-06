// Creates the database (if missing) and applies schema.sql.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbName = process.env.DB_NAME || 'store_ratings';

async function run() {
  // Connect without a database selected so we can create it.
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await conn.changeUser({ database: dbName });

  const schema = fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf8');
  await conn.query(schema);

  console.log(`✔ Database "${dbName}" ready and schema applied.`);
  await conn.end();
}

run().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
