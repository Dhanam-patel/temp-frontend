import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useAttendance } from "@/hooks/use-attendance";
import { useEmployees } from "@/hooks/use-employees";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Search } from "lucide-react";
import { StatusChip } from "@/components/StatusChip";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AttendancePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { attendanceRecords, isLoading, checkIn, checkOut } = useAttendance();
  const { employees } = useEmployees();
  const [searchTerm, setSearchTerm] = useState("");

  // Find the logged-in user's record in the derived attendance list
  // Note: user?.id is string, record.id (employeeId) is string.
  // We need to match based on the user -> employee relationship.
  // attendanceRecords items have `employeeId`.
  // `user` object from useAuth has `id` (User ID).
  // Wait, `attendanceRecords` derived from `employees` list.
  // `employees` list has `id` (Employee ID) and `user_id` (User ID).
  // `attendanceRecords` maps `employeeId` = `emp.id`.
  // So we need to find the record where the employee corresponds to the current user.
  // Use `employees` hook to map User ID -> Employee ID.
  const myEmployee = employees?.find(e => e.user_id === user?.id);
  const myRecord = (attendanceRecords as any[])?.find((r: any) => r.employee_id === myEmployee?.id);

  const getEmployeeName = (id: string) => {
    return employees?.find(e => e.id === id)?.full_name || `Employee #${id}`;
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'success';
      case 'ABSENT': return 'error';
      case 'HALF_DAY': return 'warning';
      case 'LEAVE': return 'info';
      default: return 'neutral';
    }
  };

  const filteredRecords = (attendanceRecords as any[])?.filter(record =>
    getEmployeeName(record.employee_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Attendance</h1>
          <p className="text-slate-500">Track employee check-ins and working hours.</p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline">Export Report</Button>
          {!isAdmin && (
            <div className="flex gap-2">
              <Button
                className="bg-green-600 hover:bg-green-700"
                disabled={checkIn.isPending}
                onClick={() => checkIn.mutate()}
              >
                <CalendarCheck className="w-4 h-4 mr-2" />
                {checkIn.isPending ? "Checking In..." : "Check In"}
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                disabled={checkOut.isPending}
                onClick={() => checkOut.mutate()}
              >
                <CalendarCheck className="w-4 h-4 mr-2" />
                {checkOut.isPending ? "Checking Out..." : "Check Out"}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="card-premium overflow-hidden">
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              placeholder="Search employee..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm outline-none focus:border-indigo-500 transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-slate-500">
            Showing {filteredRecords?.length || 0} records
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-zinc-50/50">
              <TableHead>Employee</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Work Hours</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">Loading attendance records...</TableCell>
              </TableRow>
            ) : filteredRecords?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">No attendance records found.</TableCell>
              </TableRow>
            ) : (
              filteredRecords?.map((record) => (
                <TableRow key={record.id} className="hover:bg-zinc-50">
                  <TableCell className="font-medium text-slate-900">
                    {getEmployeeName(record.employee_id)}
                  </TableCell>
                  <TableCell>{format(new Date(record.work_date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {record.check_in ? format(new Date(record.check_in), 'hh:mm a') : '-'}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {record.check_out ? format(new Date(record.check_out), 'hh:mm a') : '-'}
                  </TableCell>
                  <TableCell>
                    {record.working_hours ? `${record.working_hours.toFixed(1)}h` : '-'}
                  </TableCell>
                  <TableCell>
                    <StatusChip status={record.status} variant={getStatusVariant(record.status)} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Layout>
  );
}
