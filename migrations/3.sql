
INSERT INTO menu_categories (name, description, display_order) VALUES 
('Appetizers', 'Start your meal right', 1),
('Main Courses', 'Our signature dishes', 2),
('Beverages', 'Refreshing drinks', 3),
('Desserts', 'Sweet endings', 4);

INSERT INTO menu_items (category_id, name, description, price, preparation_time) VALUES 
(1, 'Caesar Salad', 'Fresh romaine lettuce with our signature Caesar dressing', 12.50, 10),
(1, 'Bruschetta', 'Toasted bread with fresh tomatoes and basil', 8.75, 8),
(1, 'Chicken Wings', 'Crispy wings with your choice of sauce', 14.25, 15),
(2, 'Grilled Salmon', 'Atlantic salmon with seasonal vegetables', 28.50, 25),
(2, 'Ribeye Steak', 'Premium cut cooked to perfection', 32.75, 30),
(2, 'Chicken Pasta', 'Creamy alfredo with grilled chicken', 19.95, 20),
(2, 'Margherita Pizza', 'Classic pizza with fresh mozzarella and basil', 16.50, 18),
(3, 'House Wine', 'Red or white wine selection', 8.00, 2),
(3, 'Craft Beer', 'Local brewery selection', 6.50, 2),
(3, 'Fresh Juice', 'Orange, apple, or cranberry', 4.25, 3),
(3, 'Coffee', 'Freshly brewed coffee', 3.50, 5),
(4, 'Chocolate Cake', 'Rich chocolate layer cake', 9.75, 5),
(4, 'Tiramisu', 'Classic Italian dessert', 8.50, 3),
(4, 'Ice Cream', 'Vanilla, chocolate, or strawberry', 5.25, 2);

INSERT INTO tables (table_number, room_name, capacity) VALUES 
('1', 'Main Dining', 4),
('2', 'Main Dining', 2),
('3', 'Main Dining', 6),
('4', 'Main Dining', 4),
('5', 'Main Dining', 2),
('6', 'Patio', 4),
('7', 'Patio', 6),
('8', 'Patio', 2),
('9', 'Private Room', 8),
('10', 'Private Room', 10),
('11', 'Bar Area', 2),
('12', 'Bar Area', 4);
