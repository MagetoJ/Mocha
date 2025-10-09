-- Clear existing sample data from tables that are guaranteed to exist at this stage.
-- This respects the migration order and prevents "no such table" errors.
DELETE FROM menu_items;
DELETE FROM menu_categories;
DELETE FROM staff;
DELETE FROM tables;
DELETE FROM shifts;

-- Add fresh sample data
INSERT INTO staff (employee_id, first_name, last_name, email, role, is_active) VALUES
('ADMIN001', 'John', 'Doe', 'admin@mariahavens.com', 'admin', 1),
('MGR001', 'Jane', 'Smith', 'manager@mariahavens.com', 'manager', 1),
('WAIT001', 'Alice', 'Johnson', 'alice@mariahavens.com', 'waiter', 1);

INSERT INTO menu_categories (name, description, display_order, is_active) VALUES
('Main Courses', 'Traditional Kenyan dishes and grilled specialties', 1, 1),
('Beverages', 'Refreshing drinks and traditional favorites', 2, 1),
('Appetizers', 'Light starters and snacks', 3, 1);

-- The category IDs created above will be used here.
INSERT INTO menu_items (category_id, name, description, price, is_available, preparation_time) VALUES
(
    (SELECT id FROM menu_categories WHERE name = 'Main Courses'),
    'Nyama Choma', 'Grilled beef served with ugali and sukuma wiki', 850.00, 1, 25
),
(
    (SELECT id FROM menu_categories WHERE name = 'Main Courses'),
    'Pilau Rice', 'Spiced rice with beef or chicken', 650.00, 1, 20
),
(
    (SELECT id FROM menu_categories WHERE name = 'Beverages'),
    'Tusker Lager', 'Cold Kenyan beer', 200.00, 1, 2
),
(
    (SELECT id FROM menu_categories WHERE name = 'Beverages'),
    'Fresh Passion Juice', 'Natural passion fruit juice', 150.00, 1, 5
),
(
    (SELECT id FROM menu_categories WHERE name = 'Appetizers'),
    'Samosas', 'Crispy pastries with meat or vegetable filling', 100.00, 1, 10
);

INSERT INTO tables (table_number, room_name, capacity, is_occupied) VALUES
('T1', 'Main Dining', 4, 0),
('T2', 'Main Dining', 4, 0),
('T3', 'Main Dining', 6, 0),
('T4', 'Patio', 2, 0),
('T5', 'VIP Room', 8, 0);