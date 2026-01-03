import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useAttendance } from "@/hooks/use-attendance";
import { useEmployees } from "@/hooks/use-employees";
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
  const { attendanceRecords, isLoading } = useAttendance();
  const { employees } = useEmployees();
  const [searchTerm, setSearchTerm] = useState("");

  const getEmployeeName = (id: number) => {
    return employees?.find(e => e.id === id)?.fullName || `Employee #${id}`;
  };

  const getStatusVariant = (status: string) => {
    switch(status) {
      case 'present': return 'success';
      case 'absent': return 'error';
      case 'half-day': return 'warning';
      case 'leave': return 'info';
      default: return 'neutral';
    }
  };

  const filteredRecords = attendanceRecords?.filter(record => 
    getEmployeeName(record.employeeId).toLowerCase().includes(searchTerm.toLowerCase())
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
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <CalendarCheck className="w-4 h-4 mr-2" />
            Mark Attendance
          </Button>
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
                    {getEmployeeName(record.employeeId)}
                  </TableCell>
                  <TableCell>{format(new Date(record.date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {record.checkIn ? format(new Date(record.checkIn), 'hh:mm a') : '-'}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {record.checkOut ? format(new Date(record.checkOut), 'hh:mm a') : '-'}
                  </TableCell>
                  <TableCell>
                    {record.workHours ? `${Math.floor(record.workHours / 60)}h ${record.workHours % 60}m` : '-'}
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
