import z from "zod";

// Staff roles enum
export const StaffRoleSchema = z.enum(['admin', 'manager', 'waiter', 'receptionist', 'chef']);
export type StaffRole = z.infer<typeof StaffRoleSchema>;

// Staff schema
export const StaffSchema = z.object({
  id: z.number(),
  mocha_user_id: z.string().nullable(),
  employee_id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  role: StaffRoleSchema,
  pin: z.string().nullable(),
  is_active: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Staff = z.infer<typeof StaffSchema>;

// Extended user type that includes staff information
export const ExtendedUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  google_sub: z.string(),
  google_user_data: z.object({
    email: z.string(),
    email_verified: z.boolean(),
    family_name: z.string().nullable().optional(),
    given_name: z.string().nullable().optional(),
    hd: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    picture: z.string().nullable().optional(),
    sub: z.string(),
  }),
  last_signed_in_at: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  staff: StaffSchema.nullable(),
});

export type ExtendedUser = z.infer<typeof ExtendedUserSchema>;

// Menu category schema
export const MenuCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  display_order: z.number(),
  is_active: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type MenuCategory = z.infer<typeof MenuCategorySchema>;

// Menu item schema
export const MenuItemSchema = z.object({
  id: z.number(),
  category_id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  image_url: z.string().nullable(),
  is_available: z.number(),
  preparation_time: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
  category_name: z.string().optional(),
});

export type MenuItem = z.infer<typeof MenuItemSchema>;

// Table schema
export const TableSchema = z.object({
  id: z.number(),
  table_number: z.string(),
  room_name: z.string().nullable(),
  capacity: z.number(),
  qr_code_url: z.string().nullable(),
  is_occupied: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Table = z.infer<typeof TableSchema>;

// Role permissions helper
export const ROLE_PERMISSIONS = {
  admin: ['manage_staff', 'manage_menu', 'manage_tables', 'view_analytics', 'pos', 'kitchen'],
  manager: ['manage_menu', 'manage_tables', 'view_analytics', 'pos', 'kitchen'],
  waiter: ['pos', 'view_tables'],
  receptionist: ['manage_tables', 'pos'],
  chef: ['kitchen', 'view_menu'],
} as const;

export function hasPermission(role: StaffRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role] as readonly string[];
  return permissions?.includes(permission) || false;
}
