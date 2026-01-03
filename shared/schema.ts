import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

// Note: This schema now primarily serves as a type definition for the frontend 
// to align with the FastAPI backend (Dayflow API).

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  full_name: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(),
  company: text("company").notNull(),
  phone: text("phone"),
  created_at: timestamp("created_at"),
  updated_at: timestamp("updated_at"),
});

// Employee specific fields (usually merged with User in frontend)
export const employees = pgTable("employees", {
  id: text("id").primaryKey(), // UUID
  job_title: text("job_title").notNull(),
  department: text("department").notNull(),
  address: text("address"),
  check_in_time: text("check_in_time"), // format "HH:MM:SS"
  check_out_time: text("check_out_time"),
  date_of_joining: text("date_of_joining"),
  profile_picture_url: text("profile_picture_url"),
});

export const attendance = pgTable("attendance", {
  id: text("id").primaryKey(), // UUID
  employee_id: text("employee_id").notNull(),
  work_date: text("work_date").notNull(), // YYYY-MM-DD
  check_in: timestamp("check_in"),
  check_out: timestamp("check_out"),
  status: text("status").notNull(), // 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE'
  created_at: timestamp("created_at"),
});

// Leaves and other tables not in current API scope removed

export const payroll = pgTable("payroll", {
  id: integer("id").primaryKey(),
  employee_id: text("employee_id").notNull(),
  pay_period_start: text("pay_period_start").notNull(),
  pay_period_end: text("pay_period_end").notNull(),
  basic_salary: integer("basic_salary").notNull(),
  deductions: integer("deductions").default(0),
  net_pay: integer("net_pay").notNull(),
});

// === SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true, created_at: true } as any);
export const insertAttendanceSchema = createInsertSchema(attendance).omit({ id: true } as any);
export const insertPayrollSchema = createInsertSchema(payroll).omit({ id: true } as any);

// === TYPES ===

// === TYPES ===

export type User = typeof users.$inferSelect;
export type Employee = typeof employees.$inferSelect;
export type Attendance = typeof attendance.$inferSelect;
export type Payroll = typeof payroll.$inferSelect;

// Request Types
export type LoginRequest = { username: string; password: string };
export type EmployeeCreate = {
  job_title: string;
  department: string;
  address?: string;
  check_in_time?: string;
  check_out_time?: string;
  date_of_joining: string;
  user: {
    full_name: string;
    email: string;
    role: string;
    company: string;
    password: string;
  };
};
