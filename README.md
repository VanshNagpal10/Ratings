# Store Ratings Platform — FullStack Intern Coding Challenge

A web application where users rate stores (1–5). A single login serves three
roles — **System Administrator**, **Normal User**, and **Store Owner** — each
with their own functionality after signing in.

## Tech Stack

| Layer     | Technology            |
| --------- | --------------------- |
| Backend   | Express.js (Node)     |
| Database  | MySQL                 |
| Frontend  | React (Vite)          |
| Auth      | JWT + bcrypt          |

```
assignment/
├── backend/     Express + MySQL API
└── frontend/    React (Vite) single-page app
```

---

## Prerequisites

- Node.js 18+ and npm
- A running MySQL server (8+)

---

## 1. Backend setup

```bash
cd backend
npm install

# Configure DB credentials
cp .env.example .env
#   edit .env → set DB_USER / DB_PASSWORD to your MySQL credentials

# Create the database + tables
npm run migrate

# (Optional) Load demo admin/users/stores/ratings
npm run seed

# Start the API on http://localhost:4000
npm start
```

### Demo accounts (after `npm run seed`)

All demo passwords are `Password@123`.

| Role                 | Email               |
| -------------------- | ------------------- |
| System Administrator | admin@example.com   |
| Normal User          | vanshuser@example.com   |
| Store Owner          | owner1@example.com  |

---

## 2. Frontend setup

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

The Vite dev server proxies `/api` to the backend on port 4000, so start the
backend first.

---

## Roles & Functionality

### System Administrator
- Dashboard: total users, total stores, total ratings.
- Add stores, normal users, admin users, and store owners.
- List stores (Name, Email, Address, Rating) and users (Name, Email, Address, Role).
- Filter every listing by Name, Email, Address, and Role.
- View a user's details; a Store Owner's rating is shown too.

### Normal User
- Sign up and log in.
- Update password after logging in.
- View and search all stores by Name and Address.
- See overall rating, own submitted rating, and submit/modify a rating (1–5).

### Store Owner
- Log in and update password.
- Dashboard: average rating of their store(s) and the list of users who rated them.

---

## Form Validations (enforced on frontend and backend)

| Field    | Rule                                                            |
| -------- | --------------------------------------------------------------- |
| Name     | 20–60 characters                                                |
| Address  | Max 400 characters                                              |
| Password | 8–16 characters, at least one uppercase and one special char    |
| Email    | Standard email format                                           |
| Rating   | Integer 1–5                                                     |

---

## Notes on design
- **Single users table** backs all roles via a `role` enum (`admin`/`user`/`owner`).
- **Ratings** have a `UNIQUE(user_id, store_id)` constraint, so a re-submitted
  rating updates the existing one (`INSERT ... ON DUPLICATE KEY UPDATE`).
- **Stores** optionally reference an owner (`owner_id`) so a Store Owner sees
  their store's ratings.
- All list endpoints support server-side filtering, and every table supports
  ascending/descending sorting on key fields (client-side).
- Passwords are hashed with bcrypt; routes are protected by JWT + role checks.

## API overview

| Method | Endpoint                     | Role   | Purpose                              |
| ------ | ---------------------------- | ------ | ------------------------------------ |
| POST   | `/api/auth/register`         | public | Normal-user sign up                  |
| POST   | `/api/auth/login`            | public | Login (all roles)                    |
| GET    | `/api/auth/me`               | any    | Current profile                      |
| PUT    | `/api/auth/password`         | any    | Update password                      |
| GET    | `/api/admin/dashboard`       | admin  | Totals                               |
| POST   | `/api/admin/users`           | admin  | Add user/admin/owner                 |
| GET    | `/api/admin/users`           | admin  | List/filter/sort users               |
| GET    | `/api/admin/users/:id`       | admin  | User detail                          |
| POST   | `/api/admin/stores`          | admin  | Add store                            |
| GET    | `/api/admin/stores`          | admin  | List/filter/sort stores              |
| GET    | `/api/admin/owners`          | admin  | Owners for the store form            |
| GET    | `/api/stores`                | user   | List/search stores + own rating      |
| POST   | `/api/stores/:id/rating`     | user   | Submit/modify rating                 |
| GET    | `/api/owner/dashboard`       | owner  | Store averages + raters              |
