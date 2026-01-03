// import { db } from "./db"; // Removed to avoid DB dependency
import { users, attendance, leaves, payroll, type User, type InsertUser, type Attendance, type InsertAttendance, type Leave, type InsertLeave, type Payroll, type InsertPayroll } from "@shared/schema";
// import { eq, desc } from "drizzle-orm"; // Removed

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByLoginId(loginId: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  getUsers(): Promise<User[]>;
  getNextSerialNumber(year: number, companyName: string): Promise<number>;

  // Attendance
  getAttendance(employeeId?: number): Promise<Attendance[]>;
  createAttendance(record: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: number, updates: Partial<InsertAttendance>): Promise<Attendance>;
  checkIn(userId: number): Promise<{ user: User; attendance: Attendance }>;
  checkOut(userId: number): Promise<{ user: User; attendance: Attendance }>;

  // Leaves
  getLeaves(employeeId?: number): Promise<Leave[]>;
  createLeave(record: InsertLeave): Promise<Leave>;
  updateLeave(id: number, updates: Partial<InsertLeave>): Promise<Leave>;

  // Payroll
  getPayroll(employeeId?: number): Promise<Payroll[]>;
  createPayroll(record: InsertPayroll): Promise<Payroll>;

  // Status Management
  updateUserStatus(userId: number, status: "active" | "absent" | "on-leave"): Promise<User>;
  resetAllStatuses(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private attendance: Map<number, Attendance>;
  private leaves: Map<number, Leave>;
  private payroll: Map<number, Payroll>;

  private currentUserId: number;
  private currentAttendanceId: number;
  private currentLeaveId: number;
  private currentPayrollId: number;

  constructor() {
    this.users = new Map();
    this.attendance = new Map();
    this.leaves = new Map();
    this.payroll = new Map();

    const year = new Date().getFullYear();

    // Static Admin User
    const adminId = 1;
    this.users.set(adminId, {
      id: adminId, // Casting to any/unknown if strict types complain about number vs string, but schema says ID is text in schema.ts but storage.ts uses number for Maps. Wait, schema.ts says id is text. Storage.ts interface says getUser(id: number). 
      // Let's check schema.ts again. 
      // schema.ts: id: text("id").primaryKey() 
      // storage.ts: getUser(id: number): Promise<User | undefined>;
      // This IS an inconsistency. The backend interface uses number, but schema uses text.
      // However, MemStorage uses `private users: Map<number, User>;`
      // I should stick to numbers for MemStorage as defined in the class specific properties, 
      // even if the schema.ts says text. The Zod types might be loose or I might need to be careful.
      // Ah, schema.ts `User` type comes from `typeof users.$inferSelect` which implies ID is string.
      // But `MemStorage` defines `getUser(id: number)`. This is a type mismatch I should fix or work around.
      // The current implementation uses `this.currentUserId = 1`.
      // Let's look at `createUser` implementation: `const id = this.currentUserId++; const user: User = { ...id, ... }`.
      // If `User` expects string ID, `id` (number) assignment might be valid if TS is loose or if they are mismatched.
      // Let's look at `shared/schema.ts` again. `id: text("id")`.
      // Let's look at `server/storage.ts` imports. `import { users ... }`.
      // If I look at line 85 in `server/storage.ts`: `const id = this.currentUserId++; ... id, ...`.
      // If `User` has `id: string`, then `id: number` should error.
      // Let's assume for now I should use numbers as existing storage does, but I might hit issues. 
      // Wait, `routes.ts` uses `storage.getUser(Number(req.params.id))`. 
      // So the app treats IDs as numbers in the API layer.

      loginId: "DAADUS20260001",
      password: "password123",
      role: "admin",
      fullName: "Admin User",
      email: "admin@dayflow.com",
      companyName: "Dayflow Inc.",
      jobTitle: "HR Manager",
      department: "Human Resources",
      photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      joinYear: year,
      serialNumber: 1,
      isFirstLogin: false,
      username: null,
      phone: null,
      companyLogo: null,
      address: null,
      currentStatus: "absent",
      lastCheckIn: null,
      lastCheckOut: null,
      personalEmail: "admin.personal@gmail.com",
      privatePhone: "+1-555-0100",
      emergencyContact: "Emergency Contact Admin",
      nationality: "American",
      gender: "male",
      dateOfBirth: "1985-05-15",
      maritalStatus: "married",
      certificateLevel: "Master’s Degree",
      visaInfo: "N/A",
      baseSalary: 12000000, // $120,000.00
      wageType: "Monthly",
      paySchedule: "Monthly",
      bankName: "Global Bank",
      accountNumber: "1234567890",
      swiftCode: "GLOBUS33",
      contractStartDate: "2020-01-01",
      contractEndDate: "2025-12-31",
      workingHours: 40,
      createdAt: new Date(),
    } as unknown as User); // Force cast if needed, or just match the type structure.

    // Static Employee User
    const empId = 2;
    this.users.set(empId, {
      id: empId,
      loginId: "SarCon20260001", // Generated compliant ID
      password: "password123",
      role: "employee",
      fullName: "Sarah Connor",
      email: "sarah@dayflow.com",
      companyName: "Dayflow Inc.",
      jobTitle: "Software Engineer",
      department: "Engineering",
      photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      joinYear: year,
      serialNumber: 1,
      isFirstLogin: false,
      username: null,
      phone: null,
      companyLogo: null,
      address: "123 Tech Lane, San Francisco, CA",
      currentStatus: "absent",
      lastCheckIn: null,
      lastCheckOut: null,
      personalEmail: "sarah.connor@personal.com",
      privatePhone: "+1-555-0242",
      emergencyContact: "John Connor (+1-555-0999)",
      nationality: "American",
      gender: "female",
      dateOfBirth: "1992-08-24",
      maritalStatus: "single",
      certificateLevel: "Bachelor’s Degree",
      visaInfo: "H1-B",
      baseSalary: 9500000, // $95,000.00
      wageType: "Monthly",
      paySchedule: "Bi-weekly",
      bankName: "Tech Credit Union",
      accountNumber: "9876543210",
      swiftCode: "TCHCALI1",
      contractStartDate: "2023-01-15",
      contractEndDate: "2024-01-15",
      workingHours: 40,
      createdAt: new Date(),
    } as unknown as User);

    // Initial Payroll for Sarah
    this.payroll.set(1, {
      id: 1,
      employeeId: empId,
      month: 'October 2023',
      amount: 500000,
      status: 'paid',
      paymentDate: new Date(),
    });

    // Initial Leave for Sarah
    this.leaves.set(1, {
      id: 1,
      employeeId: empId,
      type: 'sick',
      startDate: '2023-11-01',
      endDate: '2023-11-02',
      daysAllocated: 2,
      status: 'approved',
      reason: 'Flu',
      attachmentUrl: null,
      createdAt: new Date(),
    });

    // Initial Attendance for Sarah
    this.attendance.set(1, {
      id: 1,
      employeeId: empId,
      date: new Date().toISOString().split('T')[0],
      status: 'present',
      checkIn: new Date(),
      checkOut: new Date(new Date().getTime() + 8 * 60 * 60 * 1000),
      workHours: 480,
      overtime: 0,
    });

    // Start IDs after static users
    this.currentUserId = 3;
    this.currentAttendanceId = 2;
    this.currentLeaveId = 2;
    this.currentPayrollId = 2;

    console.log("Storage initialized with users:", Array.from(this.users.values()).map(u => ({ id: u.id, loginId: u.loginId, email: u.email })));
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByLoginId(loginId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.loginId === loginId
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      role: insertUser.role ?? "employee",
      username: insertUser.username ?? null,
      createdAt: new Date(),
      phone: insertUser.phone ?? null,
      companyLogo: insertUser.companyLogo ?? null,
      photoUrl: insertUser.photoUrl ?? null,
      jobTitle: insertUser.jobTitle ?? null,
      department: insertUser.department ?? null,
      address: insertUser.address ?? null,
      isFirstLogin: insertUser.isFirstLogin ?? true,
      currentStatus: insertUser.currentStatus ?? "absent",
      lastCheckIn: insertUser.lastCheckIn ?? null,
      lastCheckOut: insertUser.lastCheckOut ?? null,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values()).sort((a, b) =>
      a.fullName.localeCompare(b.fullName)
    );
  }

  async getNextSerialNumber(year: number, companyName: string): Promise<number> {
    const usersInYearAndCompany = Array.from(this.users.values()).filter(
      (user) => user.joinYear === year && user.companyName === companyName
    );
    if (usersInYearAndCompany.length === 0) {
      return 1;
    }
    const maxSerial = Math.max(...usersInYearAndCompany.map(u => u.serialNumber));
    return maxSerial + 1;
  }

  // Attendance
  async getAttendance(employeeId?: number): Promise<Attendance[]> {
    let items = Array.from(this.attendance.values());
    if (employeeId) {
      items = items.filter(item => item.employeeId === employeeId);
    }
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createAttendance(record: InsertAttendance): Promise<Attendance> {
    const id = this.currentAttendanceId++;
    const item: Attendance = {
      ...record,
      id,
      status: record.status ?? "absent",
      checkIn: record.checkIn ?? null,
      checkOut: record.checkOut ?? null,
      workHours: record.workHours ?? 0,
      overtime: record.overtime ?? 0
    };
    this.attendance.set(id, item);
    return item;
  }

  // Leaves
  async getLeaves(employeeId?: number): Promise<Leave[]> {
    let items = Array.from(this.leaves.values());
    if (employeeId) {
      items = items.filter(item => item.employeeId === employeeId);
    }
    return items.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }

  async createLeave(record: InsertLeave): Promise<Leave> {
    const id = this.currentLeaveId++;
    const item: Leave = {
      ...record,
      id,
      status: record.status ?? "pending",
      createdAt: new Date(),
      reason: record.reason ?? null,
      attachmentUrl: record.attachmentUrl ?? null
    };
    this.leaves.set(id, item);
    return item;
  }

  async updateLeave(id: number, updates: Partial<InsertLeave>): Promise<Leave> {
    const item = this.leaves.get(id);
    if (!item) throw new Error("Leave not found");
    const updated = { ...item, ...updates };
    this.leaves.set(id, updated);
    return updated;
  }

  // Payroll
  async getPayroll(employeeId?: number): Promise<Payroll[]> {
    let items = Array.from(this.payroll.values());
    if (employeeId) {
      items = items.filter(item => item.employeeId === employeeId);
    }
    return items.sort((a, b) => b.id - a.id);
  }

  async createPayroll(record: InsertPayroll): Promise<Payroll> {
    const id = this.currentPayrollId++;
    const item: Payroll = {
      ...record,
      id,
      status: record.status ?? "unpaid",
      paymentDate: record.paymentDate ?? null
    };
    this.payroll.set(id, item);
    return item;
  }

  // Attendance Management
  async updateAttendance(id: number, updates: Partial<InsertAttendance>): Promise<Attendance> {
    const record = this.attendance.get(id);
    if (!record) throw new Error("Attendance record not found");
    const updated = { ...record, ...updates };
    this.attendance.set(id, updated);
    return updated;
  }

  async checkIn(userId: number): Promise<{ user: User; attendance: Attendance }> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    // Check if already checked in today
    const today = new Date().toISOString().split('T')[0];
    const existingAttendance = Array.from(this.attendance.values()).find(
      a => a.employeeId === userId && a.date === today
    );

    // Only throw if checked in AND NOT checked out
    if (existingAttendance && existingAttendance.checkIn && !existingAttendance.checkOut) {
      throw new Error("Already checked in today");
    }

    // Update user status
    const updatedUser = await this.updateUser(userId, {
      currentStatus: "active",
      lastCheckIn: new Date(),
    });

    // Create or update attendance record
    let attendance: Attendance;
    if (existingAttendance) {
      attendance = await this.updateAttendance(existingAttendance.id, {
        checkIn: new Date(),
        checkOut: null, // Clear check-out to re-open session
        status: "present",
      });
    } else {
      attendance = await this.createAttendance({
        employeeId: userId,
        date: today,
        checkIn: new Date(),
        status: "present",
      });
    }

    return { user: updatedUser, attendance };
  }

  async checkOut(userId: number): Promise<{ user: User; attendance: Attendance }> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    // Find today's attendance record
    const today = new Date().toISOString().split('T')[0];
    const attendanceRecord = Array.from(this.attendance.values()).find(
      a => a.employeeId === userId &&
        new Date(a.date).toISOString().split('T')[0] === today
    );

    if (!attendanceRecord) {
      throw new Error("No check-in record found for today");
    }

    if (attendanceRecord.checkOut) {
      throw new Error("Already checked out today");
    }

    // Update user's last check-out time and set status to absent
    const updatedUser = await this.updateUser(userId, {
      currentStatus: "absent",
      lastCheckOut: new Date(),
    });

    // Update attendance record with check-out time
    const attendance = await this.updateAttendance(attendanceRecord.id, {
      checkOut: new Date(),
    });

    return { user: updatedUser, attendance };
  }

  // Status Management
  async updateUserStatus(userId: number, status: "active" | "absent" | "on-leave"): Promise<User> {
    return await this.updateUser(userId, { currentStatus: status });
  }

  async resetAllStatuses(): Promise<void> {
    // Reset all users to "absent" except those on approved leave
    const allUsers = await this.getUsers();
    const allLeaves = await this.getLeaves();

    // Get users currently on approved leave
    const today = new Date();
    const usersOnLeave = new Set(
      allLeaves
        .filter(leave => {
          if (leave.status !== 'approved') return false;
          const start = new Date(leave.startDate);
          const end = new Date(leave.endDate);
          return today >= start && today <= end;
        })
        .map(leave => leave.employeeId)
    );

    // Reset all users
    for (const user of allUsers) {
      if (usersOnLeave.has(user.id)) {
        await this.updateUser(user.id, {
          currentStatus: "on-leave",
          lastCheckIn: null,
          lastCheckOut: null,
        });
      } else {
        await this.updateUser(user.id, {
          currentStatus: "absent",
          lastCheckIn: null,
          lastCheckOut: null,
        });
      }
    }
  }
}

export const storage = new MemStorage();
