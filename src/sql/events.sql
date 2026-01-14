-- ===============================================================================================
-- TICKETFOR SALE DATABASE SCHEMA
-- ===============================================================================================

-- DROP existing tables (if needed for fresh setup)
-- DROP TABLE IF EXISTS bookings CASCADE;
-- DROP TABLE IF EXISTS tickets CASCADE;
-- DROP TABLE IF EXISTS events CASCADE;
-- DROP TABLE IF EXISTS categories CASCADE;
-- DROP TABLE IF EXISTS venues CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ===============================================================================================
-- USERS TABLE
-- ===============================================================================================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  user_name VARCHAR(30) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  user_role VARCHAR(20) NOT NULL DEFAULT 'User' CHECK (user_role IN ('Admin', 'User', 'Guest')),
  wallet INT NOT NULL DEFAULT 10000,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ===============================================================================================
-- CATEGORIES TABLE
-- ===============================================================================================
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ===============================================================================================
-- VENUES TABLE
-- ===============================================================================================
CREATE TABLE IF NOT EXISTS venues (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  city VARCHAR(100) NOT NULL,
  address VARCHAR(255) NOT NULL,
  capacity INT NOT NULL CHECK (capacity > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ===============================================================================================
-- EVENTS TABLE
-- ===============================================================================================
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT,
  venue_id INT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ===============================================================================================
-- TICKETS TABLE
-- ===============================================================================================
CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  event_id INT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  price INT NOT NULL CHECK (price >= 0),
  quantity_available INT NOT NULL CHECK (quantity_available >= 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ===============================================================================================
-- BOOKINGS TABLE
-- ===============================================================================================
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id INT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  ticket_id INT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  quantity INT NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
