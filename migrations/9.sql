-- Remove all pre-populated data to allow dynamic data generation
-- Clear data in order to respect foreign key constraints
-- Use DROP TABLE IF EXISTS to safely handle missing tables

-- Clear menu items (references categories) 
DELETE FROM menu_items WHERE 1=1;

-- Clear menu categories
DELETE FROM menu_categories WHERE 1=1;

-- Clear tables data but keep the structure
DELETE FROM tables WHERE 1=1;

-- Clear shifts data
DELETE FROM shifts WHERE 1=1;

-- Clear staff performance data (table exists from migration 8)
DELETE FROM staff_performance WHERE 1=1;

-- Keep only the admin staff user for system access, remove test users
DELETE FROM staff WHERE email != 'admin@mariahavens.com';

-- Update admin user to have a clean state
UPDATE staff SET 
    employee_id = 'ADMIN001',
    first_name = 'System',
    last_name = 'Administrator',
    phone = NULL,
    pin = NULL,
    is_active = 1,
    updated_at = datetime('now')
WHERE email = 'admin@mariahavens.com';