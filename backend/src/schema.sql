-- Schema for the Store Ratings platform (MySQL 8+)
-- Run automatically by `npm run migrate`.

-- Users of the platform. A single table backs all three roles.
CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(60)  NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,           -- bcrypt hash
  address    VARCHAR(400) NOT NULL,
  role       ENUM('admin', 'user', 'owner') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Stores registered on the platform. Optionally owned by a user (role = owner).
CREATE TABLE IF NOT EXISTS stores (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(60)  NOT NULL,
  email      VARCHAR(255) NOT NULL,
  address    VARCHAR(400) NOT NULL,
  owner_id   INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_store_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_stores_owner (owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Ratings (1-5). One rating per user per store; re-submitting updates the value.
CREATE TABLE IF NOT EXISTS ratings (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  store_id   INT NOT NULL,
  rating     TINYINT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_rating_user  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  CONSTRAINT fk_rating_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  CONSTRAINT uq_user_store UNIQUE (user_id, store_id),
  CONSTRAINT chk_rating_range CHECK (rating BETWEEN 1 AND 5),
  INDEX idx_ratings_store (store_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
