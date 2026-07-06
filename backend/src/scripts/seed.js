// Seeds an admin plus sample users, stores, and ratings for demo/testing.
import bcrypt from 'bcryptjs';
import { pool, query } from '../db.js';

// All demo passwords satisfy: 8-16 chars, 1 uppercase, 1 special char.
const PASSWORD = 'Password@123';

const users = [
  { name: 'System Administrator Root', email: 'admin@example.com',  address: '1 Admin Plaza, Central City',        role: 'admin' },
  { name: 'Jonathan Michael Anderson', email: 'john@example.com',   address: '221B Baker Street, London',           role: 'user' },
  { name: 'Elizabeth Catherine Moore', email: 'liz@example.com',    address: '742 Evergreen Terrace, Springfield',  role: 'user' },
  { name: 'Priya Sundaram Krishnan Ai', email: 'priya@example.com', address: '12 MG Road, Bengaluru, India',        role: 'user' },
  { name: 'Robert Downey Storeowner Jr', email: 'owner1@example.com', address: '10880 Malibu Point, California',    role: 'owner' },
  { name: 'Margaret Alice Store Keeper', email: 'owner2@example.com', address: '5th Avenue, New York, NY',          role: 'owner' },
];

const stores = [
  { name: 'The Corner Grocery And More', email: 'contact@cornergrocery.com', address: '15 Market Street, Downtown',   ownerEmail: 'owner1@example.com' },
  { name: 'Sunrise Electronics Emporium', email: 'hello@sunriseelectronics.com', address: '88 Tech Park, Silicon Ave', ownerEmail: 'owner2@example.com' },
  { name: 'Green Valley Organic Foods Co', email: 'info@greenvalley.com', address: '3 Orchard Lane, Hill District', ownerEmail: null },
];

async function seed() {
  const hash = await bcrypt.hash(PASSWORD, 10);

  // Users
  const userIds = {};
  for (const u of users) {
    const existing = await query('SELECT id FROM users WHERE email = ?', [u.email]);
    if (existing.length) {
      userIds[u.email] = existing[0].id;
      continue;
    }
    const r = await query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [u.name, u.email, hash, u.address, u.role]
    );
    userIds[u.email] = r.insertId;
  }

  // Stores
  const storeIds = [];
  for (const s of stores) {
    const existing = await query('SELECT id FROM stores WHERE name = ?', [s.name]);
    if (existing.length) {
      storeIds.push(existing[0].id);
      continue;
    }
    const ownerId = s.ownerEmail ? userIds[s.ownerEmail] : null;
    const r = await query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [s.name, s.email, s.address, ownerId]
    );
    storeIds.push(r.insertId);
  }

  // Ratings (a few, so averages are non-trivial)
  const ratings = [
    { email: 'john@example.com',  store: 0, rating: 4 },
    { email: 'liz@example.com',   store: 0, rating: 5 },
    { email: 'priya@example.com', store: 0, rating: 3 },
    { email: 'john@example.com',  store: 1, rating: 5 },
    { email: 'liz@example.com',   store: 1, rating: 4 },
    { email: 'priya@example.com', store: 2, rating: 2 },
  ];
  for (const rt of ratings) {
    await query(
      `INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating)`,
      [userIds[rt.email], storeIds[rt.store], rt.rating]
    );
  }

  console.log('✔ Seed complete.');
  console.log('  Login with any of these (password for all: %s):', PASSWORD);
  console.log('    admin@example.com   (System Administrator)');
  console.log('    john@example.com    (Normal User)');
  console.log('    owner1@example.com  (Store Owner)');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
