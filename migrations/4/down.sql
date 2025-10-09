-- This file correctly reverses the 4.sql migration by deleting its specific sample data.

-- First, delete menu items that depend on categories.
DELETE FROM menu_items WHERE name IN ('Nyama Choma', 'Pilau Rice', 'Tusker Lager', 'Fresh Passion Juice', 'Samosas');

-- Now, it is safe to delete the parent categories, staff, and tables.
DELETE FROM menu_categories WHERE name IN ('Main Courses', 'Beverages', 'Appetizers');
DELETE FROM staff WHERE employee_id IN ('ADMIN001', 'MGR001', 'WAIT001');
DELETE FROM tables WHERE table_number IN ('T1', 'T2', 'T3', 'T4', 'T5');