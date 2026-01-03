import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(), // Login ID
  password: text("password").notNull(),
  role: text("role").notNull().default("employee"), // 'admin' | 'employee'
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  companyName: text("company_name"), // Only for admin/tenant
  photoUrl: text("photo_url"),
  jobTitle: text("job_title"),
  department: text("department"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(), // Foreign key to users.id handled in code/relations
  date: date("date").notNull(), // YYYY-MM-DD
  checkIn: timestamp("check_in"),
  checkOut: timestamp("check_out"),
  workHours: integer("work_hours").default(0), // In minutes
  overtime: integer("overtime").default(0), // In minutes
  status: text("status").notNull().default("absent"), // 'present' | 'absent' | 'half-day' | 'leave'
});

export const leaves = pgTable("leaves", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  type: text("type").notNull(), // 'paid' | 'sick' | 'unpaid'
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  reason: text("reason"),
  attachmentUrl: text("attachment_url"),
  daysAllocated: integer("days_allocated").notNull(),
  status: text("status").notNull().default("pending"), // 'pending' | 'approved' | 'rejected'
  createdAt: timestamp("created_at").defaultNow(),
});

export const payroll = pgTable("payroll", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  month: text("month").notNull(), // e.g., "October 2023"
  amount: integer("amount").notNull(), // In cents
  status: text("status").notNull().default("unpaid"), // 'paid' | 'unpaid'
  paymentDate: timestamp("payment_date"),
});

// === SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertAttendanceSchema = createInsertSchema(attendance).omit({ id: true });
export const insertLeaveSchema = createInsertSchema(leaves).omit({ id: true, createdAt: true });
export const insertPayrollSchema = createInsertSchema(payroll).omit({ id: true });

// === TYPES ===

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;

export type Leave = typeof leaves.$inferSelect;
export type InsertLeave = z.infer<typeof insertLeaveSchema>;

export type Payroll = typeof payroll.$inferSelect;
export type InsertPayroll = z.infer<typeof insertPayrollSchema>;

// Request/Response Types
export type LoginRequest = { username: string; password: string };
export type AuthResponse = { user: User; token?: string };
