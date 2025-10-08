-- Staff/User management with roles and PINs
CREATE TABLE staff (
id INTEGER PRIMARY KEY AUTOINCREMENT,
mocha_user_id TEXT UNIQUE,
employee_id TEXT UNIQUE,
first_name TEXT NOT NULL,
last_name TEXT NOT NULL,
email TEXT UNIQUE,
phone TEXT,
role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'waiter', 'receptionist', 'chef')),
pin TEXT,
password TEXT, -- Added for password authentication
is_active BOOLEAN DEFAULT 1,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shifts management
CREATE TABLE shifts (
id INTEGER PRIMARY KEY AUTOINCREMENT,
staff_id INTEGER NOT NULL,
start_time DATETIME NOT NULL,
end_time DATETIME,
is_active BOOLEAN DEFAULT 0,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (staff_id) REFERENCES staff(id)
);

-- Menu categories
CREATE TABLE menu_categories (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL,
description TEXT,
display_order INTEGER DEFAULT 0,
is_active BOOLEAN DEFAULT 1,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu items
CREATE TABLE menu_items (
id INTEGER PRIMARY KEY AUTOINCREMENT,
category_id INTEGER NOT NULL,
name TEXT NOT NULL,
description TEXT,
price REAL NOT NULL,
image_url TEXT,
is_available BOOLEAN DEFAULT 1,
preparation_time INTEGER DEFAULT 15,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (category_id) REFERENCES menu_categories(id)
);

-- Inventory items
CREATE TABLE inventory_items (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL,
unit TEXT NOT NULL,
current_stock REAL DEFAULT 0,
minimum_stock REAL DEFAULT 0,
cost_per_unit REAL DEFAULT 0,
supplier TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tables and rooms
CREATE TABLE tables (
id INTEGER PRIMARY KEY AUTOINCREMENT,
table_number TEXT NOT NULL,
room_name TEXT,
capacity INTEGER NOT NULL,
qr_code_url TEXT,
is_occupied BOOLEAN DEFAULT 0,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
UNIQUE(table_number, room_name)
);

-- Create indexes for performance
CREATE INDEX idx_staff_email ON staff(email);
CREATE INDEX idx_staff_role ON staff(role);
CREATE INDEX idx_shifts_staff_id ON shifts(staff_id);
CREATE INDEX idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX idx_tables_occupied ON tables(is_occupied);