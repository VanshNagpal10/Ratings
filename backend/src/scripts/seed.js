// Seeds an admin plus sample users, stores, and ratings for demo/testing.
import bcrypt from 'bcryptjs';
import { pool, query } from '../db.js';

// Password meets constraints: 8-16 chars, >= 1 uppercase, >= 1 special char
const PASSWORD = 'Password@123';

const users = [
  // Names are between 20 and 60 characters
  { name: 'System Administrator Root', email: 'admin@example.com',  address: 'Block A, Connaught Place, New Delhi, 110001', role: 'admin' },
  { name: 'Vansh Nagpal, Executive Admin',     email: 'vansh@example.com',  address: 'Phase 1, Vivek Vihar, New Delhi',     role: 'admin' },
  { name: 'Vansh Nagpal, User Role',     email: 'vanshuser@example.com',  address: 'Phase 1, Vivek Vihar, New Delhi',     role: 'user' },
  { name: 'Rahul Verma, Frequent Shopper',     email: 'rahul@example.com',  address: 'Lokhandwala Complex, Andheri West, Mumbai',   role: 'user' },
  { name: 'Anjali Desai, Premium Member',      email: 'anjali@example.com', address: 'Lane 7, Koregaon Park, Pune, Maharashtra',    role: 'user' },
  { name: 'Priya Krishnan, Local Resident',    email: 'priya@example.com',  address: 'Brigade Road, Near MG Road, Bengaluru',       role: 'user' },
  { name: 'Rajesh Gupta, Store Proprietor',    email: 'owner1@example.com', address: 'Cyber Towers, Hitec City, Hyderabad',         role: 'owner' },
  { name: 'Vikram Singh, Store Proprietor',    email: 'owner2@example.com', address: 'Sector 3, Salt Lake City, Kolkata',           role: 'owner' },
];

const stores = [
  // Store names also padded to be > 20 chars just in case the validation applies universally
  { name: 'Gupta General Store & Supermart', email: 'contact@guptastore.in', address: '15 Main Market, Karol Bagh, Delhi', ownerEmail: 'owner1@example.com' },
  { name: 'Tech Park Electronics Emporium',  email: 'hello@techparkelec.in', address: 'Sector V, Salt Lake, Kolkata', ownerEmail: 'owner2@example.com' },
  { name: 'Fresh Valley Organics Pvt Ltd',   email: 'info@freshvalley.in',   address: '3 Orchard Lane, Banjara Hills, Hyderabad', ownerEmail: null },
];

async function seed() {
  const hash = await bcrypt.hash(PASSWORD, 10);

  await query('SET FOREIGN_KEY_CHECKS = 0');
  await query('TRUNCATE TABLE ratings');
  await query('TRUNCATE TABLE stores');
  await query('TRUNCATE TABLE users');
  await query('SET FOREIGN_KEY_CHECKS = 1');

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
    { email: 'rahul@example.com', store: 0, rating: 4 },
    { email: 'anjali@example.com', store: 0, rating: 5 },
    { email: 'priya@example.com', store: 0, rating: 3 },
    { email: 'rahul@example.com', store: 1, rating: 5 },
    { email: 'vansh@example.com', store: 1, rating: 5 }, 
    { email: 'priya@example.com', store: 2, rating: 2 },
  ];
  
  for (const rt of ratings) {
    await query(
      `INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating)`,
      [userIds[rt.email], storeIds[rt.store], rt.rating]
    );
  }

  console.log('  Seed complete.');
  console.log('  Login with any of these (password for all: %s):', PASSWORD);
  console.log('    admin@example.com   (System Administrator)');
  console.log('    vansh@example.com   (Admin / Your Login)');
  console.log('    vanshuser@example.com   (Normal User)');
  console.log('    owner1@example.com  (Store Owner)');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});