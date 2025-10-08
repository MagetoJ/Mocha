-- Clear existing sample data first, in the correct order to respect foreign keys.
DELETE FROM menu_items;
DELETE FROM menu_categories;
DELETE FROM staff;
DELETE FROM tables;

-- Add fresh sample data
INSERT INTO staff (employee_id, first_name, last_name, email, role, is_active) VALUES
('ADMIN001', 'John', 'Doe', 'admin@mariahavens.com', 'admin', 1),
('MGR001', 'Jane', 'Smith', 'manager@mariahavens.com', 'manager', 1),
('WAIT001', 'Alice', 'Johnson', 'alice@mariahavens.com', 'waiter', 1);

INSERT INTO menu_categories (name, description, display_order, is_active) VALUES
('Main Courses', 'Traditional Kenyan dishes and grilled specialties', 1, 1),
('Beverages', 'Refreshing drinks and traditional favorites', 2, 1),
('Appetizers', 'Light starters and snacks', 3, 1);

-- Note: The IDs for the categories above will be 1, 2, and 3 respectively.
INSERT INTO menu_items (category_id, name, description, price, is_available, preparation_time) VALUES
(1, 'Nyama Choma', 'Grilled beef served with ugali and sukuma wiki', 850.00, 1, 25),
(1, 'Pilau Rice', 'Spiced rice with beef or chicken', 650.00, 1, 20),
(2, 'Tusker Lager', 'Cold Kenyan beer', 200.00, 1, 2),
(2, 'Fresh Passion Juice', 'Natural passion fruit juice', 150.00, 1, 5),
(3, 'Samosas', 'Crispy pastries with meat or vegetable filling', 100.00, 1, 10);

INSERT INTO tables (table_number, room_name, capacity, is_occupied) VALUES
('T1', 'Main Dining', 4, 0),
('T2', 'Main Dining', 4, 0),
('T3', 'Main Dining', 6, 0),
('T4', 'Patio', 2, 0),
('T5', 'VIP Room', 8, 0);
