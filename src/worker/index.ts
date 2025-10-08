import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono<{ Bindings: Env }>();

// Enable CORS for all routes
app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

// Simple authentication routes
app.post("/api/login", async (c) => {
  const body = await c.req.json();
  const { email, password } = body;

  // Check credentials against staff table
  const staff = await c.env.DB.prepare(
    "SELECT * FROM staff WHERE email = ? AND is_active = 1"
  ).bind(email).first();

  if (!staff) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  // For now, we'll use employee_id as password (can be enhanced later)
  if (password !== staff.employee_id) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  return c.json({ 
    success: true,
    user: {
      email: staff.email,
      staff: staff
    }
  });
});

app.post("/api/logout", async (c) => {
  return c.json({ success: true });
});

// Staff management routes (simplified without auth middleware)
app.get("/api/staff", async (c) => {
  const staff = await c.env.DB.prepare(
    "SELECT * FROM staff WHERE is_active = 1 ORDER BY last_name, first_name"
  ).all();

  return c.json(staff.results);
});

app.post("/api/staff", async (c) => {
  const body = await c.req.json();
  const { employee_id, first_name, last_name, email, phone, role, pin } = body;

  const result = await c.env.DB.prepare(`
    INSERT INTO staff (employee_id, first_name, last_name, email, phone, role, pin, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).bind(
    String(employee_id), 
    String(first_name), 
    String(last_name), 
    email ? String(email) : null, 
    phone ? String(phone) : null, 
    String(role), 
    pin ? String(pin) : null
  ).run();

  return c.json({ id: result.meta.last_row_id, success: true });
});

app.put("/api/staff/:id", async (c) => {
  const staffId = c.req.param("id");
  const body = await c.req.json();
  const { employee_id, first_name, last_name, email, phone, role, pin, is_active } = body;

  await c.env.DB.prepare(`
    UPDATE staff 
    SET employee_id = ?, first_name = ?, last_name = ?, email = ?, phone = ?, 
        role = ?, pin = ?, is_active = ?, updated_at = datetime('now')
    WHERE id = ?
  `).bind(
    String(employee_id), 
    String(first_name), 
    String(last_name), 
    email ? String(email) : null, 
    phone ? String(phone) : null, 
    String(role), 
    pin ? String(pin) : null, 
    Number(is_active), 
    Number(staffId)
  ).run();

  return c.json({ success: true });
});

app.delete("/api/staff/:id", async (c) => {
  const staffId = c.req.param("id");
  
  // Soft delete by setting is_active to 0
  await c.env.DB.prepare(`
    UPDATE staff SET is_active = 0, updated_at = datetime('now') WHERE id = ?
  `).bind(Number(staffId)).run();

  return c.json({ success: true });
});

// Menu categories routes
app.get("/api/menu/categories", async (c) => {
  const categories = await c.env.DB.prepare(
    "SELECT * FROM menu_categories WHERE is_active = 1 ORDER BY display_order, name"
  ).all();

  return c.json(categories.results);
});

// Menu items routes
app.get("/api/menu/items", async (c) => {
  const items = await c.env.DB.prepare(`
    SELECT mi.*, mc.name as category_name 
    FROM menu_items mi 
    JOIN menu_categories mc ON mi.category_id = mc.id 
    WHERE mi.is_available = 1 AND mc.is_active = 1
    ORDER BY mc.display_order, mi.name
  `).all();

  return c.json(items.results);
});

app.post("/api/menu/categories", async (c) => {
  const body = await c.req.json();
  const { name, description, display_order } = body;

  const result = await c.env.DB.prepare(`
    INSERT INTO menu_categories (name, description, display_order, updated_at)
    VALUES (?, ?, ?, datetime('now'))
  `).bind(
    String(name), 
    description ? String(description) : null, 
    Number(display_order || 0)
  ).run();

  return c.json({ id: result.meta.last_row_id, success: true });
});

app.post("/api/menu/items", async (c) => {
  const body = await c.req.json();
  const { category_id, name, description, price, image_url, preparation_time } = body;

  const result = await c.env.DB.prepare(`
    INSERT INTO menu_items (category_id, name, description, price, image_url, preparation_time, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `).bind(
    Number(category_id), 
    String(name), 
    description ? String(description) : null, 
    Number(price), 
    image_url ? String(image_url) : null, 
    Number(preparation_time || 15)
  ).run();

  return c.json({ id: result.meta.last_row_id, success: true });
});

// Tables routes
app.get("/api/tables", async (c) => {
  const tables = await c.env.DB.prepare(
    "SELECT * FROM tables ORDER BY room_name, table_number"
  ).all();

  return c.json(tables.results);
});

app.post("/api/tables", async (c) => {
  const body = await c.req.json();
  const { table_number, room_name, capacity } = body;

  const result = await c.env.DB.prepare(`
    INSERT INTO tables (table_number, room_name, capacity, updated_at)
    VALUES (?, ?, ?, datetime('now'))
  `).bind(
    String(table_number), 
    room_name ? String(room_name) : null, 
    Number(capacity)
  ).run();

  return c.json({ id: result.meta.last_row_id, success: true });
});

app.put("/api/tables/:id/status", async (c) => {
  const tableId = c.req.param("id");
  const body = await c.req.json();
  const { is_occupied } = body;

  await c.env.DB.prepare(`
    UPDATE tables SET is_occupied = ?, updated_at = datetime('now') WHERE id = ?
  `).bind(is_occupied ? 1 : 0, Number(tableId)).run();

  return c.json({ success: true });
});

export default app;
