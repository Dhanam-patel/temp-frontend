import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import { insertUserSchema, insertAttendanceSchema, insertLeaveSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // === SEED DATA ===
  const users = await storage.getUsers();
  if (users.length === 0) {
    console.log("Seeding database...");
    const admin = await storage.createUser({
      username: "admin",
      password: "password123", // In a real app, hash this!
      role: "admin",
      fullName: "Admin User",
      email: "admin@dayflow.com",
      companyName: "Dayflow Inc.",
      jobTitle: "HR Manager",
      department: "Human Resources",
      photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    });

    const emp1 = await storage.createUser({
      username: "emp1",
      password: "password123",
      role: "employee",
      fullName: "Sarah Connor",
      email: "sarah@dayflow.com",
      jobTitle: "Software Engineer",
      department: "Engineering",
      photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    });

    // Seed Attendance
    await storage.createAttendance({
      employeeId: emp1.id,
      date: new Date().toISOString().split('T')[0],
      status: 'present',
      checkIn: new Date(),
      checkOut: new Date(new Date().getTime() + 8 * 60 * 60 * 1000), // 8 hours later
      workHours: 480,
    });

    // Seed Leaves
    await storage.createLeave({
      employeeId: emp1.id,
      type: 'sick',
      startDate: '2023-11-01',
      endDate: '2023-11-02',
      daysAllocated: 2,
      status: 'approved',
      reason: 'Flu',
    });

    // Seed Payroll
    await storage.createPayroll({
      employeeId: emp1.id,
      month: 'October 2023',
      amount: 500000, // $5000.00
      status: 'paid',
      paymentDate: new Date(),
    });
  }

  // === AUTH ===
  app.post(api.auth.login.path, async (req, res) => {
    // Simple mock auth
    const { username, password } = req.body;
    const user = await storage.getUserByUsername(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    res.json(user);
  });

  app.post(api.auth.signup.path, async (req, res) => {
    try {
      const input = insertUserSchema.parse(req.body);
      const existing = await storage.getUserByUsername(input.username);
      if (existing) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const user = await storage.createUser(input);
      res.status(201).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      }
    }
  });

  // === EMPLOYEES ===
  app.get(api.employees.list.path, async (req, res) => {
    const users = await storage.getUsers();
    res.json(users);
  });

  app.get(api.employees.get.path, async (req, res) => {
    const user = await storage.getUser(Number(req.params.id));
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

  app.post(api.employees.create.path, async (req, res) => {
    try {
      const input = insertUserSchema.parse(req.body);
      const user = await storage.createUser(input);
      res.status(201).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      }
    }
  });

  app.put(api.employees.update.path, async (req, res) => {
    try {
      const input = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(Number(req.params.id), input);
      res.json(user);
    } catch (err) {
      res.status(400).json({ message: "Update failed" });
    }
  });

  // === ATTENDANCE ===
  app.get(api.attendance.list.path, async (req, res) => {
    const empId = req.query.employeeId ? Number(req.query.employeeId) : undefined;
    const items = await storage.getAttendance(empId);
    res.json(items);
  });

  app.post(api.attendance.create.path, async (req, res) => {
    const input = insertAttendanceSchema.parse(req.body);
    const item = await storage.createAttendance(input);
    res.status(201).json(item);
  });

  // === LEAVES ===
  app.get(api.leaves.list.path, async (req, res) => {
    const empId = req.query.employeeId ? Number(req.query.employeeId) : undefined;
    const items = await storage.getLeaves(empId);
    res.json(items);
  });

  app.post(api.leaves.create.path, async (req, res) => {
    const input = insertLeaveSchema.parse(req.body);
    const item = await storage.createLeave(input);
    res.status(201).json(item);
  });

  app.put(api.leaves.update.path, async (req, res) => {
    const input = insertLeaveSchema.partial().parse(req.body);
    const item = await storage.updateLeave(Number(req.params.id), input);
    res.json(item);
  });

  // === PAYROLL ===
  app.get(api.payroll.list.path, async (req, res) => {
    const empId = req.query.employeeId ? Number(req.query.employeeId) : undefined;
    const items = await storage.getPayroll(empId);
    res.json(items);
  });

  return httpServer;
}
