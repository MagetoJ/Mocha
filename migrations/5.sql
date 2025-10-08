-- Add admin user with password for testing
-- The password "admin123" hashed with SHA-256
UPDATE staff SET password = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9' 
WHERE email = 'admin@mariahavens.com';

-- If no admin exists, create one
INSERT OR IGNORE INTO staff (employee_id, first_name, last_name, email, role, password, is_active, created_at, updated_at)
VALUES ('ADMIN001', 'Admin', 'User', 'admin@mariahavens.com', 'admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 1, datetime('now'), datetime('now'));

-- Add test manager with password "manager123"
INSERT OR IGNORE INTO staff (employee_id, first_name, last_name, email, role, password, is_active, created_at, updated_at)
VALUES ('MGR001', 'Test', 'Manager', 'manager@mariahavens.com', 'manager', '866485796cfa8d7c0cf7111640205b83076433547577511d81f8030ae99ecea5', 1, datetime('now'), datetime('now'));

-- Add test waiter with password "test123"
INSERT OR IGNORE INTO staff (employee_id, first_name, last_name, email, role, password, is_active, created_at, updated_at)
VALUES ('TEST001', 'John', 'Waiter', 'waiter@mariahavens.com', 'waiter', 'ecd71870d1963316a97e3ac3408c9835ad8cf0f3c1bc703527c30265534f75ae', 1, datetime('now'), datetime('now'));

-- Add test receptionist with password "reception123"
INSERT OR IGNORE INTO staff (employee_id, first_name, last_name, email, role, password, is_active, created_at, updated_at)
VALUES ('REC001', 'Sarah', 'Reception', 'receptionist@mariahavens.com', 'receptionist', '46ca2baa8ad12b0bb57b7ec4f8c1dfa9a33e5d8b3c4adf5bfa6d7d84b0e60c1f', 1, datetime('now'), datetime('now'));

-- Add test chef with password "chef123"
INSERT OR IGNORE INTO staff (employee_id, first_name, last_name, email, role, password, is_active, created_at, updated_at)
VALUES ('CHF001', 'Mike', 'Chef', 'chef@mariahavens.com', 'chef', '7d1d8cf5e91b0ccd8b2f4b6f5eabe1cedfcc5b8bb0af2b8c25370a0e2e4f3b59', 1, datetime('now'), datetime('now'));