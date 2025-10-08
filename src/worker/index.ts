import { Hono } from "hono";
import { cors } from "hono/cors";
import { hash, compare } from 'bcryptjs';

// Define the environment bindings to resolve TypeScript errors
// Define the environment bindings to resolve TypeScript errors
interface Env {
  DB: D1Database;
  R2_BUCKET: R2Bucket;
  ASSETS: Fetcher;
}

const app = new Hono<{ Bindings: Env }>();

// Secure hashing function using bcrypt
const hashPassword = async (password: string) => {
  const saltRounds = 10;
  return await hash(password, saltRounds);
};

// Enable CORS for all routes
app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

// --- AUTHENTICATION ---
app.post("/api/login", async (c) => {
  const { email, password } = await c.req.json();

  if (!email || !password) {
    return c.json({ error: "Email and password are required" }, 400);
  }

  const staff: any = await c.env.DB.prepare(
    "SELECT * FROM staff WHERE email = ? AND is_active = 1"
  ).bind(email).first();

  if (!staff || !staff.password) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const isPasswordValid = await compare(password, staff.password);
  if (!isPasswordValid) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  // Omit password from the response
  const { password: _, ...staffInfo } = staff;

  return c.json({
    success: true,
    user: {
      email: staff.email,
      staff: staffInfo
    }
  });
});

// --- STAFF MANAGEMENT ---
app.get("/api/staff", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT id, employee_id, first_name, last_name, email, phone, role, pin, is_active, created_at FROM staff WHERE is_active = 1 ORDER BY last_name, first_name"
  ).all();
  return c.json(results);
});

app.post("/api/staff", async (c) => {
  const { employee_id, first_name, last_name, email, phone, role, pin, password } = await c.req.json();

  if (!password) {
      return c.json({ error: "Password is required for new staff members" }, 400);
  }

  const hashedPassword = await hashPassword(password);

  const result = await c.env.DB.prepare(`
    INSERT INTO staff (employee_id, first_name, last_name, email, phone, role, pin, password, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).bind(employee_id, first_name, last_name, email || null, phone || null, role, pin || null, hashedPassword).run();

  const newStaffId = result.meta.last_row_id;

  // Automatically create initial staff performance record for today
  await c.env.DB.prepare(`
    INSERT OR IGNORE INTO staff_performance 
    (staff_id, date, orders_served, total_sales, tables_served, shift_duration_minutes, customer_rating_avg, tips_earned, created_at, updated_at)
    VALUES (?, date('now'), 0, 0.00, 0, 0, 0.00, 0.00, datetime('now'), datetime('now'))
  `).bind(newStaffId).run();

  return c.json({ id: newStaffId, success: true });
});

app.put("/api/staff/:id", async (c) => {
  const staffId = c.req.param("id");
  const { employee_id, first_name, last_name, email, phone, role, pin, is_active, password } = await c.req.json();

  if (password && password.length > 0) {
    const hashedPassword = await hashPassword(password);
    await c.env.DB.prepare(
      `UPDATE staff SET employee_id = ?, first_name = ?, last_name = ?, email = ?, phone = ?, role = ?, pin = ?, is_active = ?, password = ?, updated_at = datetime('now') WHERE id = ?`
    ).bind(employee_id, first_name, last_name, email || null, phone || null, role, pin || null, is_active ? 1 : 0, hashedPassword, staffId).run();
  } else {
    await c.env.DB.prepare(
      `UPDATE staff SET employee_id = ?, first_name = ?, last_name = ?, email = ?, phone = ?, role = ?, pin = ?, is_active = ?, updated_at = datetime('now') WHERE id = ?`
    ).bind(employee_id, first_name, last_name, email || null, phone || null, role, pin || null, is_active ? 1 : 0, staffId).run();
  }

  return c.json({ success: true });
});

app.delete("/api/staff/:id", async (c) => {
  const staffId = c.req.param("id");
  await c.env.DB.prepare(`UPDATE staff SET is_active = 0, updated_at = datetime('now') WHERE id = ?`).bind(staffId).run();
  return c.json({ success: true });
});

// --- IMAGE UPLOAD ---
app.post("/api/upload", async (c) => {
    const formData = await c.req.formData();
    const file = formData.get("file") as File;

    if (!file) {
        return c.json({ error: "No file provided" }, 400);
    }

    const fileExtension = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExtension}`;

    await c.env.R2_BUCKET.put(fileName, await file.arrayBuffer(), {
        httpMetadata: { contentType: file.type },
    });

    const publicUrl = `https://pub-3ddff8a25cb240ebbbff4630494b73c3.r2.dev/${fileName}`;

    return c.json({ url: publicUrl });
});

// --- MENU & TABLES (No changes needed here) ---
app.get("/api/menu/categories", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM menu_categories WHERE is_active = 1 ORDER BY display_order, name"
  ).all();
  return c.json(results);
});

app.post("/api/menu/categories", async (c) => {
  const { name, description, display_order } = await c.req.json();
  const result = await c.env.DB.prepare(
    `INSERT INTO menu_categories (name, description, display_order, updated_at) VALUES (?, ?, ?, datetime('now'))`
  ).bind(name, description || null, display_order || 0).run();
  return c.json({ id: result.meta.last_row_id, success: true });
});

app.put("/api/menu/categories/:id", async (c) => {
  const categoryId = c.req.param("id");
  const { name, description, display_order, is_active } = await c.req.json();
  
  await c.env.DB.prepare(
    `UPDATE menu_categories SET name = ?, description = ?, display_order = ?, is_active = ?, updated_at = datetime('now') WHERE id = ?`
  ).bind(name, description || null, display_order || 0, is_active !== undefined ? (is_active ? 1 : 0) : 1, categoryId).run();
  
  return c.json({ success: true });
});

app.delete("/api/menu/categories/:id", async (c) => {
  const categoryId = c.req.param("id");
  await c.env.DB.prepare(`UPDATE menu_categories SET is_active = 0, updated_at = datetime('now') WHERE id = ?`).bind(categoryId).run();
  return c.json({ success: true });
});

app.get("/api/menu/items", async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT mi.*, mc.name as category_name 
    FROM menu_items mi JOIN menu_categories mc ON mi.category_id = mc.id 
    WHERE mi.is_available = 1 AND mc.is_active = 1
    ORDER BY mc.display_order, mi.name
  `).all();
  return c.json(results);
});

app.post("/api/menu/items", async (c) => {
  const { category_id, name, description, price, image_url, preparation_time } = await c.req.json();
  const result = await c.env.DB.prepare(
    `INSERT INTO menu_items (category_id, name, description, price, image_url, preparation_time, updated_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
  ).bind(category_id, name, description || null, price, image_url || null, preparation_time || 15).run();
  return c.json({ id: result.meta.last_row_id, success: true });
});

app.put("/api/menu/items/:id", async (c) => {
  const itemId = c.req.param("id");
  const { category_id, name, description, price, image_url, preparation_time, is_available } = await c.req.json();
  
  await c.env.DB.prepare(
    `UPDATE menu_items SET category_id = ?, name = ?, description = ?, price = ?, image_url = ?, preparation_time = ?, is_available = ?, updated_at = datetime('now') WHERE id = ?`
  ).bind(category_id, name, description || null, price, image_url || null, preparation_time || 15, is_available !== undefined ? (is_available ? 1 : 0) : 1, itemId).run();
  
  return c.json({ success: true });
});

app.delete("/api/menu/items/:id", async (c) => {
  const itemId = c.req.param("id");
  await c.env.DB.prepare(`UPDATE menu_items SET is_available = 0, updated_at = datetime('now') WHERE id = ?`).bind(itemId).run();
  return c.json({ success: true });
});

app.get("/api/tables", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM tables ORDER BY room_name, table_number"
  ).all();
  return c.json(results);
});

// --- PERFORMANCE ANALYTICS ---
app.get("/api/performance/staff", async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT 
      s.id,
      s.employee_id,
      s.first_name,
      s.last_name,
      s.role,
      sp.date,
      sp.orders_served,
      sp.total_sales,
      sp.tables_served,
      sp.shift_duration_minutes,
      sp.customer_rating_avg,
      sp.tips_earned,
      -- Calculate productivity metrics
      ROUND(sp.total_sales / NULLIF(sp.shift_duration_minutes, 0) * 60, 2) as sales_per_hour,
      ROUND(sp.orders_served / NULLIF(sp.shift_duration_minutes, 0) * 60, 2) as orders_per_hour
    FROM staff s
    LEFT JOIN staff_performance sp ON s.id = sp.staff_id
    WHERE s.is_active = 1 AND (sp.date IS NULL OR sp.date >= date('now', '-7 days'))
    ORDER BY s.role, sp.date DESC, sp.total_sales DESC
  `).all();
  return c.json(results);
});

app.get("/api/performance/staff/:id", async (c) => {
  const staffId = c.req.param("id");
  const { results } = await c.env.DB.prepare(`
    SELECT 
      s.id,
      s.employee_id,
      s.first_name,
      s.last_name,
      s.role,
      sp.date,
      sp.orders_served,
      sp.total_sales,
      sp.tables_served,
      sp.shift_duration_minutes,
      sp.customer_rating_avg,
      sp.tips_earned
    FROM staff s
    LEFT JOIN staff_performance sp ON s.id = sp.staff_id
    WHERE s.id = ? AND s.is_active = 1 AND sp.date >= date('now', '-30 days')
    ORDER BY sp.date DESC
  `).bind(staffId).all();
  return c.json(results);
});

app.get("/api/performance/summary", async (c) => {
  // Get overall performance summary
  const todayResults = await c.env.DB.prepare(`
    SELECT 
      COUNT(DISTINCT s.id) as active_staff,
      COALESCE(SUM(sp.orders_served), 0) as total_orders_today,
      COALESCE(SUM(sp.total_sales), 0) as total_sales_today,
      COALESCE(AVG(sp.customer_rating_avg), 0) as avg_rating_today
    FROM staff s
    LEFT JOIN staff_performance sp ON s.id = sp.staff_id AND sp.date = date('now')
    WHERE s.is_active = 1
  `).first();

  const yesterdayResults = await c.env.DB.prepare(`
    SELECT 
      COALESCE(SUM(sp.orders_served), 0) as total_orders_yesterday,
      COALESCE(SUM(sp.total_sales), 0) as total_sales_yesterday
    FROM staff s
    LEFT JOIN staff_performance sp ON s.id = sp.staff_id AND sp.date = date('now', '-1 day')
    WHERE s.is_active = 1
  `).first();

  const topPerformers = await c.env.DB.prepare(`
    SELECT 
      s.first_name,
      s.last_name,
      s.role,
      sp.total_sales,
      sp.orders_served,
      sp.customer_rating_avg
    FROM staff s
    JOIN staff_performance sp ON s.id = sp.staff_id
    WHERE sp.date = date('now') AND s.is_active = 1
    ORDER BY sp.total_sales DESC
    LIMIT 5
  `).all();

  return c.json({
    today: todayResults,
    yesterday: yesterdayResults,
    topPerformers: topPerformers.results
  });
});

app.get("/api/performance/trends", async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT 
      sp.date,
      SUM(sp.orders_served) as total_orders,
      SUM(sp.total_sales) as total_sales,
      AVG(sp.customer_rating_avg) as avg_rating,
      COUNT(DISTINCT sp.staff_id) as active_staff
    FROM staff_performance sp
    WHERE sp.date >= date('now', '-30 days')
    GROUP BY sp.date
    ORDER BY sp.date ASC
  `).all();
  return c.json(results);
});

app.get("/api/performance/by-role", async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT 
      s.role,
      COUNT(DISTINCT s.id) as staff_count,
      COALESCE(SUM(sp.orders_served), 0) as total_orders,
      COALESCE(SUM(sp.total_sales), 0) as total_sales,
      COALESCE(AVG(sp.customer_rating_avg), 0) as avg_rating,
      COALESCE(SUM(sp.tips_earned), 0) as total_tips
    FROM staff s
    LEFT JOIN staff_performance sp ON s.id = sp.staff_id AND sp.date >= date('now', '-7 days')
    WHERE s.is_active = 1
    GROUP BY s.role
    ORDER BY total_sales DESC
  `).all();
  return c.json(results);
});

// Initialize performance records for existing staff (admin utility endpoint)
app.post("/api/performance/initialize", async (c) => {
  // Get all active staff members
  const { results: allStaff } = await c.env.DB.prepare(`
    SELECT id FROM staff WHERE is_active = 1
  `).all();

  let initializedCount = 0;
  
  // Create performance records for each staff member for today if they don't exist
  for (const staff of allStaff) {
    const result = await c.env.DB.prepare(`
      INSERT OR IGNORE INTO staff_performance 
      (staff_id, date, orders_served, total_sales, tables_served, shift_duration_minutes, customer_rating_avg, tips_earned, created_at, updated_at)
      VALUES (?, date('now'), 0, 0.00, 0, 0, 0.00, 0.00, datetime('now'), datetime('now'))
    `).bind(staff.id).run();
    
    if (result.meta.changes > 0) {
      initializedCount++;
    }
  }

  return c.json({ 
    success: true, 
    message: `Initialized performance records for ${initializedCount} staff members`,
    totalStaff: allStaff.length
  });
});

// --- RECEPTIONIST DASHBOARD ---
app.get("/api/receptionist/dashboard", async (c) => {
  // Get statistics for today
  const todayStats = await c.env.DB.prepare(`
    SELECT 
      COUNT(DISTINCT gc.id) as today_checkins,
      COALESCE(AVG(wg.estimated_wait_minutes), 0) as avg_wait_time
    FROM guest_checkins gc
    LEFT JOIN waiting_guests wg ON wg.status = 'waiting'
    WHERE date(gc.checked_in_at) = date('now')
  `).first();

  // Get current waiting guests
  const waitingGuests = await c.env.DB.prepare(`
    SELECT 
      id,
      guest_name,
      guest_phone as phone,
      party_size,
      arrived_at,
      estimated_wait_minutes as estimated_wait
    FROM waiting_guests 
    WHERE status = 'waiting'
    ORDER BY arrived_at ASC
  `).all();

  // Get upcoming reservations for today
  const reservations = await c.env.DB.prepare(`
    SELECT 
      id,
      guest_name,
      guest_phone,
      guest_email,
      party_size,
      datetime(reservation_date || ' ' || reservation_time) as reservation_time,
      status,
      table_id,
      special_requests
    FROM reservations 
    WHERE reservation_date = date('now') 
    AND status IN ('confirmed', 'seated')
    ORDER BY reservation_time ASC
  `).all();

  // Get current table occupancy
  const tableStats = await c.env.DB.prepare(`
    SELECT 
      COUNT(*) as total_tables,
      SUM(CASE WHEN is_occupied = 1 THEN 1 ELSE 0 END) as occupied_tables
    FROM tables
  `).first();

  return c.json({
    stats: {
      totalTables: tableStats?.total_tables ?? 0,
      occupiedTables: tableStats?.occupied_tables ?? 0,
      waitingGuests: waitingGuests.results.length,
      todayCheckIns: todayStats?.today_checkins ?? 0,
      averageWaitTime: Math.round((todayStats?.avg_wait_time ?? 0) as number)
    },
    waitingGuests: waitingGuests.results,
    reservations: reservations.results
  });
});

// Add new reservation
app.post("/api/receptionist/reservation", async (c) => {
  const { guest_name, guest_phone, guest_email, party_size, reservation_date, reservation_time, special_requests } = await c.req.json();
  
  if (!guest_name || !party_size || !reservation_date || !reservation_time) {
    return c.json({ error: "Guest name, party size, date and time are required" }, 400);
  }

  const result = await c.env.DB.prepare(`
    INSERT INTO reservations (guest_name, guest_phone, guest_email, party_size, reservation_date, reservation_time, special_requests, staff_id, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, (SELECT id FROM staff WHERE role = 'receptionist' LIMIT 1), datetime('now'))
  `).bind(guest_name, guest_phone, guest_email, party_size, reservation_date, reservation_time, special_requests).run();

  return c.json({ 
    success: true, 
    reservation_id: result.meta.last_row_id 
  });
});

// Add waiting guest
app.post("/api/receptionist/waiting-guest", async (c) => {
  const { guest_name, guest_phone, party_size, estimated_wait_minutes = 15, notes } = await c.req.json();
  
  if (!guest_name || !party_size) {
    return c.json({ error: "Guest name and party size are required" }, 400);
  }

  const result = await c.env.DB.prepare(`
    INSERT INTO waiting_guests (guest_name, guest_phone, party_size, estimated_wait_minutes, notes, staff_id, updated_at)
    VALUES (?, ?, ?, ?, ?, (SELECT id FROM staff WHERE role = 'receptionist' LIMIT 1), datetime('now'))
  `).bind(guest_name, guest_phone, party_size, estimated_wait_minutes, notes).run();

  return c.json({ 
    success: true, 
    waiting_guest_id: result.meta.last_row_id 
  });
});

// Check in guest (from reservation or waiting list)
app.post("/api/receptionist/checkin", async (c) => {
  const { guest_name, party_size, table_id, reservation_id, waiting_guest_id, notes } = await c.req.json();
  
  if (!guest_name || !party_size || !table_id) {
    return c.json({ error: "Guest name, party size, and table are required" }, 400);
  }

  // Check if table is available
  const table = await c.env.DB.prepare(`
    SELECT id, is_occupied FROM tables WHERE id = ?
  `).bind(table_id).first();

  if (!table) {
    return c.json({ error: "Table not found" }, 404);
  }

  if (table.is_occupied) {
    return c.json({ error: "Table is already occupied" }, 400);
  }

  // Start a transaction-like operation
  try {
    // Mark table as occupied
    await c.env.DB.prepare(`
      UPDATE tables SET is_occupied = 1, updated_at = datetime('now') WHERE id = ?
    `).bind(table_id).run();

    // Create check-in record
    const checkinResult = await c.env.DB.prepare(`
      INSERT INTO guest_checkins (reservation_id, waiting_guest_id, table_id, staff_id, guest_name, party_size, notes)
      VALUES (?, ?, ?, (SELECT id FROM staff WHERE role = 'receptionist' LIMIT 1), ?, ?, ?)
    `).bind(reservation_id || null, waiting_guest_id || null, table_id, guest_name, party_size, notes || null).run();

    // Update reservation status if applicable
    if (reservation_id) {
      await c.env.DB.prepare(`
        UPDATE reservations 
        SET status = 'seated', table_id = ?, seated_at = datetime('now'), updated_at = datetime('now')
        WHERE id = ?
      `).bind(table_id, reservation_id).run();
    }

    // Update waiting guest status if applicable
    if (waiting_guest_id) {
      await c.env.DB.prepare(`
        UPDATE waiting_guests 
        SET status = 'seated', table_id = ?, seated_at = datetime('now'), updated_at = datetime('now')
        WHERE id = ?
      `).bind(table_id, waiting_guest_id).run();
    }

    return c.json({ 
      success: true, 
      checkin_id: checkinResult.meta.last_row_id 
    });
  } catch (error) {
    // Rollback table occupation if something went wrong
    await c.env.DB.prepare(`
      UPDATE tables SET is_occupied = 0, updated_at = datetime('now') WHERE id = ?
    `).bind(table_id).run();
    
    return c.json({ error: "Failed to check in guest" }, 500);
  }
});

// Seat waiting guest
app.post("/api/receptionist/seat-guest", async (c) => {
  const { guestId, tableNumber } = await c.req.json();
  
  if (!guestId || !tableNumber) {
    return c.json({ error: "Guest ID and table number are required" }, 400);
  }

  // Find the table by table_number
  const table = await c.env.DB.prepare(`
    SELECT id, is_occupied FROM tables WHERE table_number = ?
  `).bind(tableNumber).first();

  if (!table) {
    return c.json({ error: "Table not found" }, 404);
  }

  if (table.is_occupied) {
    return c.json({ error: "Table is already occupied" }, 400);
  }

  // Get waiting guest details
  const waitingGuest = await c.env.DB.prepare(`
    SELECT id, guest_name, party_size FROM waiting_guests WHERE id = ? AND status = 'waiting'
  `).bind(guestId).first();

  if (!waitingGuest) {
    return c.json({ error: "Waiting guest not found or already seated" }, 404);
  }

  try {
    // Mark table as occupied
    await c.env.DB.prepare(`
      UPDATE tables SET is_occupied = 1, updated_at = datetime('now') WHERE id = ?
    `).bind(table.id).run();

    // Create check-in record
    await c.env.DB.prepare(`
      INSERT INTO guest_checkins (waiting_guest_id, table_id, staff_id, guest_name, party_size)
      VALUES (?, ?, (SELECT id FROM staff WHERE role = 'receptionist' LIMIT 1), ?, ?)
    `).bind(guestId, table.id, waitingGuest.guest_name, waitingGuest.party_size).run();

    // Update waiting guest status
    await c.env.DB.prepare(`
      UPDATE waiting_guests 
      SET status = 'seated', table_id = ?, seated_at = datetime('now'), updated_at = datetime('now')
      WHERE id = ?
    `).bind(table.id, guestId).run();

    return c.json({ success: true });
  } catch (error) {
    // Rollback table occupation if something went wrong
    await c.env.DB.prepare(`
      UPDATE tables SET is_occupied = 0, updated_at = datetime('now') WHERE id = ?
    `).bind(table.id).run();
    
    return c.json({ error: "Failed to seat guest" }, 500);
  }
});

// Get available tables for seating
app.get("/api/receptionist/available-tables", async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT 
      id,
      table_number,
      room_name,
      capacity,
      is_occupied
    FROM tables 
    WHERE is_occupied = 0
    ORDER BY room_name, table_number
  `).all();
  
  return c.json(results);
});
// --- STATIC ASSET SERVING ---
// This must be the last route in your file.
// It proxies all non-API requests to the static assets service.
app.get('*', (c) => {
  return c.env.ASSETS.fetch(c.req.raw)
})
export default app;