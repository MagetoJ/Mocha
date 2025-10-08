-- Create orders table for tracking sales and performance
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT NOT NULL UNIQUE,
    table_id INTEGER,
    staff_id INTEGER NOT NULL, -- Staff member who created the order
    total_amount REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'delivered', 'cancelled')),
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
    payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'mobile')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP,
    FOREIGN KEY (table_id) REFERENCES tables(id),
    FOREIGN KEY (staff_id) REFERENCES staff(id)
);

-- Create order items table for detailed order tracking
CREATE TABLE order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    menu_item_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price REAL NOT NULL,
    total_price REAL NOT NULL,
    special_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

-- Create performance tracking table for staff performance metrics
CREATE TABLE staff_performance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_id INTEGER NOT NULL,
    date DATE NOT NULL,
    orders_served INTEGER DEFAULT 0,
    total_sales REAL DEFAULT 0,
    tables_served INTEGER DEFAULT 0,
    shift_duration_minutes INTEGER DEFAULT 0,
    customer_rating_avg REAL DEFAULT 0,
    tips_earned REAL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff(id),
    UNIQUE(staff_id, date)
);

-- Create customer feedback table
CREATE TABLE customer_feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    staff_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    feedback_type TEXT DEFAULT 'general' CHECK (feedback_type IN ('general', 'service', 'food', 'atmosphere')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (staff_id) REFERENCES staff(id)
);

-- Create daily sales summary table for quick analytics
CREATE TABLE daily_sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL UNIQUE,
    total_orders INTEGER DEFAULT 0,
    total_revenue REAL DEFAULT 0,
    total_tips REAL DEFAULT 0,
    avg_order_value REAL DEFAULT 0,
    peak_hour_start TIME,
    peak_hour_end TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_orders_staff_id ON orders(staff_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_staff_performance_staff_id ON staff_performance(staff_id);
CREATE INDEX idx_staff_performance_date ON staff_performance(date);
CREATE INDEX idx_customer_feedback_staff_id ON customer_feedback(staff_id);
CREATE INDEX idx_daily_sales_date ON daily_sales(date);

-- Add sample performance data for testing
INSERT INTO orders (order_number, table_id, staff_id, total_amount, status, payment_status, payment_method, created_at, delivered_at) VALUES
('ORD-001', 1, (SELECT id FROM staff WHERE email = 'waiter@mariahavens.com'), 1250.00, 'delivered', 'paid', 'cash', datetime('now', '-2 hours'), datetime('now', '-1 hour')),
('ORD-002', 2, (SELECT id FROM staff WHERE email = 'waiter@mariahavens.com'), 850.00, 'delivered', 'paid', 'card', datetime('now', '-1 hour'), datetime('now', '-30 minutes')),
('ORD-003', 3, (SELECT id FROM staff WHERE email = 'receptionist@mariahavens.com'), 450.00, 'preparing', 'unpaid', NULL, datetime('now', '-30 minutes'), NULL),
('ORD-004', 4, (SELECT id FROM staff WHERE email = 'waiter@mariahavens.com'), 650.00, 'ready', 'paid', 'mobile', datetime('now', '-15 minutes'), NULL);

-- Add order items for the sample orders
INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price) VALUES
(1, 1, 1, 850.00, 850.00),
(1, 2, 2, 200.00, 400.00),
(2, 1, 1, 850.00, 850.00),
(3, 3, 3, 150.00, 450.00),
(4, 2, 1, 650.00, 650.00);

-- Add sample performance data
INSERT INTO staff_performance (staff_id, date, orders_served, total_sales, tables_served, shift_duration_minutes, customer_rating_avg, tips_earned) VALUES
((SELECT id FROM staff WHERE email = 'waiter@mariahavens.com'), date('now'), 3, 2750.00, 3, 480, 4.5, 150.00),
((SELECT id FROM staff WHERE email = 'receptionist@mariahavens.com'), date('now'), 1, 450.00, 1, 480, 4.0, 25.00),
((SELECT id FROM staff WHERE email = 'chef@mariahavens.com'), date('now'), 4, 0, 0, 480, 4.8, 0.00),
((SELECT id FROM staff WHERE email = 'waiter@mariahavens.com'), date('now', '-1 day'), 5, 3200.00, 4, 480, 4.2, 180.00),
((SELECT id FROM staff WHERE email = 'receptionist@mariahavens.com'), date('now', '-1 day'), 2, 800.00, 2, 480, 3.8, 40.00);

-- Add sample customer feedback
INSERT INTO customer_feedback (order_id, staff_id, rating, comment, feedback_type) VALUES
(1, (SELECT id FROM staff WHERE email = 'waiter@mariahavens.com'), 5, 'Excellent service, very attentive', 'service'),
(2, (SELECT id FROM staff WHERE email = 'waiter@mariahavens.com'), 4, 'Good food, prompt delivery', 'general'),
(1, (SELECT id FROM staff WHERE email = 'chef@mariahavens.com'), 5, 'Food was perfectly cooked', 'food');

-- Add sample daily sales data
INSERT INTO daily_sales (date, total_orders, total_revenue, total_tips, avg_order_value, peak_hour_start, peak_hour_end) VALUES
(date('now'), 4, 3200.00, 175.00, 800.00, '18:00', '20:00'),
(date('now', '-1 day'), 7, 5000.00, 220.00, 714.29, '19:00', '21:00'),
(date('now', '-2 days'), 6, 4200.00, 180.00, 700.00, '18:30', '20:30');