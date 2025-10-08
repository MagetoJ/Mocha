-- Create staff_performance table to track daily performance metrics
CREATE TABLE staff_performance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_id INTEGER NOT NULL,
    date DATE NOT NULL,
    orders_served INTEGER DEFAULT 0,
    total_sales REAL DEFAULT 0.0,
    tables_served INTEGER DEFAULT 0,
    shift_duration_minutes INTEGER DEFAULT 0,
    customer_rating_avg REAL DEFAULT 0.0,
    tips_earned REAL DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff(id),
    UNIQUE(staff_id, date)
);

-- Create indexes for better query performance
CREATE INDEX idx_staff_performance_staff_id ON staff_performance(staff_id);
CREATE INDEX idx_staff_performance_date ON staff_performance(date);
CREATE INDEX idx_staff_performance_total_sales ON staff_performance(total_sales);

-- Performance data will be populated automatically by the application
-- based on actual staff activities and dashboard interactions