-- Create reservations table for managing guest reservations
CREATE TABLE reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guest_name TEXT NOT NULL,
    guest_phone TEXT,
    guest_email TEXT,
    party_size INTEGER NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'seated', 'cancelled', 'no_show', 'completed')),
    table_id INTEGER,
    staff_id INTEGER, -- Staff member who made the reservation
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    seated_at TIMESTAMP,
    FOREIGN KEY (table_id) REFERENCES tables(id),
    FOREIGN KEY (staff_id) REFERENCES staff(id)
);

-- Create waiting guests table for walk-in guests
CREATE TABLE waiting_guests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guest_name TEXT NOT NULL,
    guest_phone TEXT,
    party_size INTEGER NOT NULL,
    arrived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estimated_wait_minutes INTEGER DEFAULT 15,
    status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'seated', 'left', 'no_show')),
    staff_id INTEGER, -- Staff member who added the guest
    table_id INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    seated_at TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff(id),
    FOREIGN KEY (table_id) REFERENCES tables(id)
);

-- Create guest check-ins table for tracking guest arrivals
CREATE TABLE guest_checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reservation_id INTEGER,
    waiting_guest_id INTEGER,
    table_id INTEGER NOT NULL,
    staff_id INTEGER NOT NULL, -- Staff member who checked in the guest
    guest_name TEXT NOT NULL,
    party_size INTEGER NOT NULL,
    checked_in_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id),
    FOREIGN KEY (waiting_guest_id) REFERENCES waiting_guests(id),
    FOREIGN KEY (table_id) REFERENCES tables(id),
    FOREIGN KEY (staff_id) REFERENCES staff(id)
);

-- Create indexes for better performance
CREATE INDEX idx_reservations_date ON reservations(reservation_date);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_staff_id ON reservations(staff_id);
CREATE INDEX idx_waiting_guests_status ON waiting_guests(status);
CREATE INDEX idx_waiting_guests_arrived_at ON waiting_guests(arrived_at);
CREATE INDEX idx_guest_checkins_table_id ON guest_checkins(table_id);
CREATE INDEX idx_guest_checkins_staff_id ON guest_checkins(staff_id);

-- Add sample reservations for today and tomorrow
INSERT INTO reservations (guest_name, guest_phone, guest_email, party_size, reservation_date, reservation_time, status, special_requests, staff_id) VALUES
('John Smith', '+254712345678', 'john.smith@email.com', 4, date('now'), '19:00:00', 'confirmed', 'Window seat preferred', (SELECT id FROM staff WHERE email = 'receptionist@mariahavens.com')),
('Mary Johnson', '+254798765432', 'mary.johnson@email.com', 2, date('now'), '18:30:00', 'confirmed', 'Anniversary dinner', (SELECT id FROM staff WHERE email = 'receptionist@mariahavens.com')),
('David Wilson', '+254701234567', 'david.wilson@email.com', 6, date('now'), '20:00:00', 'confirmed', 'Birthday celebration', (SELECT id FROM staff WHERE email = 'receptionist@mariahavens.com')),
('Sarah Brown', '+254723456789', 'sarah.brown@email.com', 3, date('now', '+1 day'), '19:30:00', 'confirmed', NULL, (SELECT id FROM staff WHERE email = 'receptionist@mariahavens.com')),
('Michael Davis', '+254734567890', 'michael.davis@email.com', 2, date('now', '+1 day'), '18:00:00', 'confirmed', 'Vegetarian meals required', (SELECT id FROM staff WHERE email = 'receptionist@mariahavens.com'));

-- Add sample waiting guests
INSERT INTO waiting_guests (guest_name, guest_phone, party_size, arrived_at, estimated_wait_minutes, staff_id) VALUES
('Emma Thompson', '+254756789012', 3, datetime('now', '-10 minutes'), 15, (SELECT id FROM staff WHERE email = 'receptionist@mariahavens.com')),
('Robert Garcia', '+254767890123', 2, datetime('now', '-5 minutes'), 10, (SELECT id FROM staff WHERE email = 'receptionist@mariahavens.com')),
('Lisa Anderson', NULL, 4, datetime('now', '-20 minutes'), 25, (SELECT id FROM staff WHERE email = 'receptionist@mariahavens.com'));

-- Add sample guest check-ins from earlier today
INSERT INTO guest_checkins (reservation_id, table_id, staff_id, guest_name, party_size, checked_in_at) VALUES
((SELECT id FROM reservations WHERE guest_name = 'John Smith'), 1, (SELECT id FROM staff WHERE email = 'receptionist@mariahavens.com'), 'John Smith', 4, datetime('now', '-3 hours')),
((SELECT id FROM reservations WHERE guest_name = 'Mary Johnson'), 2, (SELECT id FROM staff WHERE email = 'receptionist@mariahavens.com'), 'Mary Johnson', 2, datetime('now', '-2 hours'));