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