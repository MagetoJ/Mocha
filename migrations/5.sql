-- Add admin user with password for testing
-- The password is "admin123"
UPDATE staff SET password = '$2a$10$YourGeneratedHashForAdmin123' 
WHERE email = 'admin@mariahavens.com';

-- If no admin exists, create one
INSERT OR IGNORE INTO staff (employee_id, first_name, last_name, email, role, password, is_active, created_at, updated_at)
VALUES ('ADMIN001', 'Admin', 'User', 'admin@mariahavens.com', 'admin', '$2b$10$taLx4nRdhYUC.cJ1hncW2OUBKbTZZ98dMeGcpqFxZp9IrDCips0le', 1, datetime('now'), datetime('now'));

-- Add test manager with password "manager123"
INSERT OR IGNORE INTO staff (employee_id, first_name, last_name, email, role, password, is_active, created_at, updated_at)
VALUES ('MGR001', 'Test', 'Manager', 'manager@mariahavens.com', 'manager', '$$2b$10$HTmAn3TqjURFFw3j.UH1dOjokk.hOf3b/SxeYyzm1fQiVaKOltvI2', 1, datetime('now'), datetime('now'));

-- Add test waiter with password "test123"
INSERT OR IGNORE INTO staff (employee_id, first_name, last_name, email, role, password, is_active, created_at, updated_at)
VALUES ('TEST001', 'John', 'Waiter', 'waiter@mariahavens.com', 'waiter', '$$2b$10$ubQ7Nv9Cfc9UBhfsLtbIuecpTMhquKhIx0vp497kqwvO8TjIdSaGu', 1, datetime('now'), datetime('now'));

-- Add test receptionist with password "reception123"
INSERT OR IGNORE INTO staff (employee_id, first_name, last_name, email, role, password, is_active, created_at, updated_at)
VALUES ('REC001', 'Sarah', 'Reception', 'receptionist@mariahavens.com', 'receptionist', '$2b$10$pyz8wCwLPVd1jplKZrrz9.152BIM2oc55GDTlTvHkOo6/3yJ.VgJa', 1, datetime('now'), datetime('now'));

-- Add test chef with password "chef123"
INSERT OR IGNORE INTO staff (employee_id, first_name, last_name, email, role, password, is_active, created_at, updated_at)
VALUES ('CHF001', 'Mike', 'Chef', 'chef@mariahavens.com', 'chef', '$2b$10$.yVZMUXoiQsIrlGszuATWeVHVgul2C6x9I8gqwALnEDxbuxYAnJy2', 1, datetime('now'), datetime('now'));