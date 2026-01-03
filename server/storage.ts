import { db } from "./db";
import { users, attendance, leaves, payroll, type User, type InsertUser, type Attendance, type InsertAttendance, type Leave, type InsertLeave, type Payroll, type InsertPayroll } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  getUsers(): Promise<User[]>;

  // Attendance
  getAttendance(employeeId?: number): Promise<Attendance[]>;
  createAttendance(record: InsertAttendance): Promise<Attendance>;
  
  // Leaves
  getLeaves(employeeId?: number): Promise<Leave[]>;
  createLeave(record: InsertLeave): Promise<Leave>;
  updateLeave(id: number, updates: Partial<InsertLeave>): Promise<Leave>;

  // Payroll
  getPayroll(employeeId?: number): Promise<Payroll[]>;
  createPayroll(record: InsertPayroll): Promise<Payroll>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.fullName);
  }

  // Attendance
  async getAttendance(employeeId?: number): Promise<Attendance[]> {
    if (employeeId) {
      return await db.select().from(attendance).where(eq(attendance.employeeId, employeeId)).orderBy(desc(attendance.date));
    }
    return await db.select().from(attendance).orderBy(desc(attendance.date));
  }

  async createAttendance(record: InsertAttendance): Promise<Attendance> {
    const [item] = await db.insert(attendance).values(record).returning();
    return item;
  }

  // Leaves
  async getLeaves(employeeId?: number): Promise<Leave[]> {
    if (employeeId) {
      return await db.select().from(leaves).where(eq(leaves.employeeId, employeeId)).orderBy(desc(leaves.startDate));
    }
    return await db.select().from(leaves).orderBy(desc(leaves.startDate));
  }

  async createLeave(record: InsertLeave): Promise<Leave> {
    const [item] = await db.insert(leaves).values(record).returning();
    return item;
  }

  async updateLeave(id: number, updates: Partial<InsertLeave>): Promise<Leave> {
    const [item] = await db.update(leaves).set(updates).where(eq(leaves.id, id)).returning();
    return item;
  }

  // Payroll
  async getPayroll(employeeId?: number): Promise<Payroll[]> {
    if (employeeId) {
      return await db.select().from(payroll).where(eq(payroll.employeeId, employeeId)).orderBy(desc(payroll.id));
    }
    return await db.select().from(payroll).orderBy(desc(payroll.id));
  }

  async createPayroll(record: InsertPayroll): Promise<Payroll> {
    const [item] = await db.insert(payroll).values(record).returning();
    return item;
  }
}

export const storage = new DatabaseStorage();
