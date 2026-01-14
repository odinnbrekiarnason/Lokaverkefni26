-- ===============================================================================================
-- SEED DATA FOR EVENT TICKETING SYSTEM
-- ===============================================================================================

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

-- ===============================================================================================
-- VERIFICATION QUERIES (Run these to verify data insertion)
-- ===============================================================================================
-- SELECT COUNT(*) as total_categories FROM categories;
-- SELECT COUNT(*) as total_venues FROM venues;
-- SELECT COUNT(*) as total_users FROM users;
-- SELECT COUNT(*) as total_events FROM events;
-- SELECT COUNT(*) as total_tickets FROM tickets;
-- SELECT COUNT(*) as total_bookings FROM bookings;
