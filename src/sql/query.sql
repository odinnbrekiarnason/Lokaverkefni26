-- ===============================================================================================
-- SEED DATA FOR EVENT TICKETING SYSTEM
-- ===============================================================================================
--Fresh setup 
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS venues CASCADE;
DROP TABLE IF EXISTS users CASCADE;

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
);

-- ===============================================================================================
-- TICKETS TABLE
-- ===============================================================================================
CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  event_id INT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  price INT NOT NULL CHECK (price >= 0),
  quantity_available INT NOT NULL CHECK (quantity_available >= 0),
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
-- ===============================================================================================
-- INSERT CATEGORIES
-- ===============================================================================================
INSERT INTO categories (category_name) VALUES 
  ('Music'),
  ('Comedy'),
  ('Sports'),
  ('Theater'),
  ('Conference'),
  ('Festival')

-- ===============================================================================================
-- INSERT VENUES
-- ===============================================================================================
INSERT INTO venues (name, city, address, capacity) VALUES 
  ('National Concert Hall', 'Reykjavik', '123 Music Street', 1500),
  ('The Comedy Club', 'Reykjavik', '456 Laugh Avenue', 300),
  ('Laugardalsvo lur Stadium', 'Reykjavik', '789 Sports Road', 5000),
  ('Icelandic Theatre', 'Akureyri', '321 Drama Lane', 800),
  ('Tech Conference Center', 'Reykjavik', '654 Innovation Plaza', 2000),
  ('Golden Circle Festival Grounds', 'Hveragerdi', '987 Festival Way', 10000)

-- ===============================================================================================
-- INSERT USERS (Demo users)
-- ===============================================================================================
-- Password hashes are for demonstration; use actual hashed passwords in production
INSERT INTO users (user_name, email, password_hash, user_role, money) VALUES 
  ('admin_user', 'admin@example.com', '$2b$10$YWRtaW5QYXNZD3hvcmQhQWRtaW4=', 'Admin', 999999),
  ('john_doe', 'john@example.com', '$2b$10$YXJlUGxhaW50ZXh0cGFzc3dvcmQhMTIz', 'User', 50000),
  ('jane_smith', 'jane@example.com', '$2b$10$YXJlVGVzdFBhc3N3b3JkIzQ1Ng==', 'User', 30000),
  ('music_lover', 'music@example.com', '$2b$10$TXVzaWNQYXNzd29yZFBlcmZlY3Q=', 'User', 25000),
  ('comedy_fan', 'comedy@example.com', '$2b$10$Q29tZWR5UGFzc3dvcmRGdW4h', 'User', 15000)
ON CONFLICT (email) DO NOTHING;

-- ===============================================================================================
-- INSERT EVENTS (Upcoming events)
-- ===============================================================================================
INSERT INTO events (name, date, description, venue_id, category_id) VALUES 
  ('Arctic Symphony Concert', CURRENT_TIMESTAMP + INTERVAL '30 days', 'An unforgettable evening of classical and contemporary music featuring the Icelandic Symphony Orchestra.', 1, 1),
  ('Stand-up Comedy Night', CURRENT_TIMESTAMP + INTERVAL '15 days', 'Local and international comedians perform their funniest material.', 2, 2),
  ('International Football Championship', CURRENT_TIMESTAMP + INTERVAL '45 days', 'Iceland faces off against top European teams in a thrilling tournament.', 3, 3),
  ('Shakespeare''s Hamlet', CURRENT_TIMESTAMP + INTERVAL '20 days', 'A stunning theatrical production of the classic tragedy.', 4, 4),
  ('Tech Innovation Summit 2025', CURRENT_TIMESTAMP + INTERVAL '60 days', 'Join industry leaders discussing AI, blockchain, and the future of technology.', 5, 5),
  ('Summer Festival 2025', CURRENT_TIMESTAMP + INTERVAL '90 days', 'Three-day music and cultural festival featuring bands from around the world.', 6, 6),
  ('Jazz Evening Extravaganza', CURRENT_TIMESTAMP + INTERVAL '25 days', 'Live jazz performances from the best local and international artists.', 1, 1),
  ('Comedy Showcase Finals', CURRENT_TIMESTAMP + INTERVAL '35 days', 'The finalists of the national comedy competition perform for the title.', 2, 2)


-- ===============================================================================================
-- INSERT TICKETS (For each event)
-- ===============================================================================================
INSERT INTO tickets (event_id, price, quantity_available) VALUES 
  (1, 5000, 100),    -- Arctic Symphony Concert - 5000 ISK per ticket
  (2, 2000, 150),    -- Stand-up Comedy Night
  (3, 12000, 200),   -- Football Championship
  (4, 3500, 120),    -- Shakespeare Hamlet
  (5, 8000, 300),    -- Tech Summit
  (6, 4000, 500),    -- Summer Festival - Single day
  (7, 6000, 80),     -- Jazz Evening
  (8, 2500, 100)     -- Comedy Showcase Finals


-- ===============================================================================================
-- INSERT SAMPLE BOOKINGS (Optional - demonstrates booking system)
-- ===============================================================================================
INSERT INTO bookings (user_id, event_id, ticket_id, quantity) VALUES 
  (1, 1, 1, 2),      -- john_doe books 2 tickets for Arctic Symphony
  (2, 2, 3, 1),      -- jane_smith books 1 ticket for Comedy Night
  (4, 1, 2, 1),      -- music_lover books 1 premium ticket for Symphony
  (5, 2, 3, 2)       -- comedy_fan books 2 tickets for Comedy Night
ON CONFLICT DO NOTHING;


