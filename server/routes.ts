import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { generateLoginId, generateTempPassword, parseFullName } from "./utils";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import { insertUserSchema, insertAttendanceSchema, insertLeaveSchema, type CreateUserRequest, type ChangePasswordRequest } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Seed data is now handled in storage.ts constructor


  // === AUTH ===

  // Login - accepts loginId or email
  app.post(api.auth.login.path, async (req, res) => {
    // Frontend authService sends 'username' in FormData
    // LoginPage.tsx sends 'loginIdOrEmail' in JSON
    const loginIdOrEmail = req.body.loginIdOrEmail || req.body.username;
    const password = req.body.password;

    console.log("[auth] Login attempt:", { loginIdOrEmail, passwordLength: password?.length });

    if (!loginIdOrEmail || !password) {
      return res.status(400).json({ message: "Login ID and password are required" });
    }

    // Try to find user by loginId first, then email
    let user = await storage.getUserByLoginId(loginIdOrEmail);
    if (!user) {
      user = await storage.getUserByEmail(loginIdOrEmail);
    }

    if (!user) {
      console.log("[auth] User not found:", loginIdOrEmail);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("[auth] User found:", { id: user.id, loginId: user.loginId, email: user.email });

    if (user.password !== password) {
      console.log("[auth] Password mismatch for user:", user.fullName);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("[auth] Login successful for user:", user.fullName);

    // Return the shape expected by client/src/hooks/use-auth.tsx and authService
    // Including a mock JWT that is parsable by the frontend's parseJwt
    // Base64 of {"sub": 1, "role": "admin"} is eyJzdWIiOjEsInJvbGUiOiJhZG1pbiJ9
    const mockToken = `header.${btoa(JSON.stringify({ sub: user.id, role: user.role, email: user.email })).replace(/=/g, '')}.signature`;

    res.json({
      access_token: mockToken,
      token_type: "bearer",
      user: user
    });
  });

  // Admin Registration (Company Onboarding)
  app.post("/api/register-admin", async (req, res) => {
    try {
      const { companyName, fullName, email, phone, password, companyLogo } = req.body;

      // Check if email already exists
      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Generate Login ID for admin
      const year = new Date().getFullYear();
      const serialNumber = await storage.getNextSerialNumber(year, companyName);
      const { firstName, lastName } = parseFullName(fullName);
      const loginId = generateLoginId(companyName, firstName, lastName, year, serialNumber);

      const user = await storage.createUser({
        loginId,
        password,
        role: "admin",
        fullName,
        email,
        phone: phone || null,
        companyName,
        companyLogo: companyLogo || null,
        joinYear: year,
        serialNumber,
        isFirstLogin: false, // Admin sets password during signup
      });

      res.status(201).json({ user, loginId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Create Employee (Admin Only)
  app.post("/api/admin/create-user", async (req, res) => {
    try {
      const { firstName, lastName, email, joiningDate, jobTitle, department } = req.body;

      // TODO: Add proper auth middleware to verify admin role
      // For now, we'll skip auth check

      // Check if email already exists
      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Get admin's company (in real app, get from session)
      // For now, use first admin's company
      const admins = (await storage.getUsers()).filter(u => u.role === "admin");
      if (admins.length === 0) {
        return res.status(400).json({ message: "No admin found" });
      }
      const companyName = admins[0].companyName;

      // Generate credentials using joining date year
      const year = joiningDate ? new Date(joiningDate).getFullYear() : new Date().getFullYear();
      const serialNumber = await storage.getNextSerialNumber(year, companyName);
      const loginId = generateLoginId(companyName, firstName, lastName, year, serialNumber);
      const tempPassword = generateTempPassword();

      const user = await storage.createUser({
        loginId,
        password: tempPassword,
        role: "employee",
        fullName: `${firstName} ${lastName}`,
        email,
        companyName,
        jobTitle: jobTitle || null,
        department: department || null,
        joinYear: year,
        serialNumber,
        isFirstLogin: true,
      });

      res.status(201).json({
        user,
        loginId,
        tempPassword,
        message: "Employee created successfully. Share these credentials with the employee."
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to create employee" });
    }
  });

  // Change Password
  app.post("/api/change-password", async (req, res) => {
    try {
      const { oldPassword, newPassword }: ChangePasswordRequest = req.body;

      // TODO: Get user from session
      // For now, we'll require loginId in body
      const { loginId } = req.body;

      const user = await storage.getUserByLoginId(loginId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.password !== oldPassword) {
        return res.status(401).json({ message: "Incorrect old password" });
      }

      const updatedUser = await storage.updateUser(user.id, {
        password: newPassword,
        isFirstLogin: false,
      });

      res.json({ message: "Password changed successfully", user: updatedUser });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Legacy signup endpoint (kept for compatibility, but should redirect to admin registration)
  app.post(api.auth.signup.path, async (req, res) => {
    res.status(400).json({
      message: "Please use /api/register-admin for company registration"
    });
  });

  // === EMPLOYEES / USERS ===

  // Compatibility aliasing for use-auth.tsx
  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(Number(req.params.id));
    if (!user) return res.status(404).json({ message: "User not found" });

    // Map to Python-style fields expected by use-auth.tsx
    res.json({
      ...user,
      full_name: user.fullName,
      company: user.companyName,
      created_at: user.createdAt?.toISOString() || new Date().toISOString()
    });
  });

  app.get("/api/employees/", async (req, res) => {
    const users = await storage.getUsers();
    // Map to Python-style nested user object expected by use-auth.tsx
    res.json(users.map(u => ({
      ...u,
      user: {
        id: u.id,
        email: u.email,
        full_name: u.fullName,
        role: u.role,
        company: u.companyName
      },
      job_title: u.jobTitle,
      department: u.department,
      profile_picture_url: u.photoUrl,
      check_in_time: u.lastCheckIn,
      check_out_time: u.lastCheckOut,
      // Include extra fields if needed in list view
    })));
  });

  app.get("/api/employees/:id/private-info", async (req, res) => {
    const user = await storage.getUser(Number(req.params.id));
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      personal_email: user.personalEmail,
      private_phone: user.privatePhone,
      emergency_contact: user.emergencyContact,
      nationality: user.nationality,
      gender: user.gender,
      date_of_birth: user.dateOfBirth,
      marital_status: user.maritalStatus,
      certificate_level: user.certificateLevel,
      visa_info: user.visaInfo
    });
  });

  app.get("/api/employees/:id/salary", async (req, res) => {
    const user = await storage.getUser(Number(req.params.id));
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      base_salary: user.baseSalary,
      wage_type: user.wageType,
      pay_schedule: user.paySchedule,
      bank_name: user.bankName,
      account_number: user.accountNumber,
      swift_code: user.swiftCode,
      contract_start_date: user.contractStartDate,
      contract_end_date: user.contractEndDate,
      working_hours: user.workingHours
    });
  });

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
    // Redirect to new endpoint
    res.status(400).json({
      message: "Please use /api/admin/create-user to create employees"
    });
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

    // If leave is approved, update user status to "on-leave"
    if (input.status === "approved") {
      await storage.updateUserStatus(item.employeeId, "on-leave");

      // Emit WebSocket event
      const { emitStatusChange } = await import("./websocket");
      emitStatusChange(item.employeeId, "on-leave", new Date());
    }

    res.json(item);
  });

  // === PAYROLL ===
  app.get(api.payroll.list.path, async (req, res) => {
    const empId = req.query.employeeId ? Number(req.query.employeeId) : undefined;
    const items = await storage.getPayroll(empId);
    res.json(items);
  });

  // === CHECK-IN/CHECK-OUT ===
  app.post("/api/attendance/check-in", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }

      const result = await storage.checkIn(userId);

      // Emit WebSocket event
      const { emitCheckIn, emitStatusChange } = await import("./websocket");
      emitCheckIn(userId, result.user.lastCheckIn!);
      emitStatusChange(userId, result.user.currentStatus, result.user.lastCheckIn!);

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/attendance/check-out", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }

      const result = await storage.checkOut(userId);

      // Emit WebSocket events
      const { emitCheckOut, emitStatusChange } = await import("./websocket");
      emitCheckOut(userId, result.user.lastCheckOut!);
      emitStatusChange(userId, result.user.currentStatus, result.user.lastCheckOut!);

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get all users with their current status
  app.get("/api/users/status", async (req, res) => {
    try {
      const users = await storage.getUsers();
      const statusData = users.map(user => ({
        id: user.id,
        fullName: user.fullName,
        loginId: user.loginId,
        currentStatus: user.currentStatus,
        lastCheckIn: user.lastCheckIn,
        lastCheckOut: user.lastCheckOut,
        role: user.role,
      }));
      res.json(statusData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Manual status reset (for testing/admin)
  app.post("/api/admin/reset-statuses", async (req, res) => {
    try {
      await storage.resetAllStatuses();
      res.json({ message: "All statuses reset successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}
