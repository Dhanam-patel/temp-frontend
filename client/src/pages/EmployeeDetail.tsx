import { Layout } from "@/components/Layout";
import { useEmployee } from "@/hooks/use-employees";
import { useRoute, Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Mail, Phone, MapPin, Building, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAttendance } from "@/hooks/use-attendance";
import { useLeaves } from "@/hooks/use-leaves";
import { usePayroll } from "@/hooks/use-payroll";
import { format } from "date-fns";
import { StatusChip } from "@/components/StatusChip";

export default function EmployeeDetail() {
  const [, params] = useRoute("/employees/:id");
  const id = Number(params?.id);
  const { employee, isLoading } = useEmployee(id);
  const { attendanceRecords } = useAttendance(id);
  const { leaves } = useLeaves(id);
  const { payroll } = usePayroll(id);

  if (isLoading) return <Layout><div className="p-8">Loading...</div></Layout>;
  if (!employee) return <Layout><div className="p-8">Employee not found</div></Layout>;

  return (
    <Layout>
      <Link href="/employees" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Employees
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card-premium p-6 text-center">
            <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-indigo-50">
              <AvatarImage src={employee.photoUrl || undefined} />
              <AvatarFallback className="text-4xl bg-indigo-100 text-indigo-700">
                {employee.fullName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold text-slate-900">{employee.fullName}</h2>
            <p className="text-indigo-600 font-medium">{employee.jobTitle}</p>
            
            <div className="flex justify-center gap-2 mt-6">
              <Button variant="outline" size="sm" className="w-full">Message</Button>
              <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700">Edit Profile</Button>
            </div>
          </div>

          <div className="card-premium p-6 space-y-4">
            <h3 className="font-bold text-slate-900 border-b border-zinc-100 pb-2">Contact Info</h3>
            
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs text-slate-400">Email</p>
                <p className="text-slate-700 font-medium truncate" title={employee.email}>{employee.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center text-slate-500">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Phone</p>
                <p className="text-slate-700 font-medium">{employee.phone || '-'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center text-slate-500">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Department</p>
                <p className="text-slate-700 font-medium">{employee.department || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="attendance" className="w-full">
            <TabsList className="w-full justify-start bg-transparent border-b border-zinc-200 p-0 h-auto gap-6 mb-6 rounded-none">
              <TabsTrigger 
                value="attendance" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 rounded-none px-0 pb-3 text-slate-500 hover:text-slate-700 font-medium"
              >
                Attendance
              </TabsTrigger>
              <TabsTrigger 
                value="leaves" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 rounded-none px-0 pb-3 text-slate-500 hover:text-slate-700 font-medium"
              >
                Time Off
              </TabsTrigger>
              <TabsTrigger 
                value="payroll" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 rounded-none px-0 pb-3 text-slate-500 hover:text-slate-700 font-medium"
              >
                Payroll
              </TabsTrigger>
            </TabsList>

            <TabsContent value="attendance" className="mt-0">
              <div className="card-premium overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-zinc-50 text-slate-500 font-medium">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Hours</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {attendanceRecords?.map((record) => (
                      <tr key={record.id} className="hover:bg-zinc-50/50">
                        <td className="px-6 py-4">{format(new Date(record.date), 'MMM dd, yyyy')}</td>
                        <td className="px-6 py-4">
                          <StatusChip status={record.status} variant={record.status === 'present' ? 'success' : 'error'} />
                        </td>
                        <td className="px-6 py-4">
                          {record.workHours ? `${(record.workHours / 60).toFixed(1)}h` : '-'}
                        </td>
                      </tr>
                    ))}
                    {(!attendanceRecords || attendanceRecords.length === 0) && (
                      <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400">No records found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="leaves" className="mt-0 space-y-4">
              {leaves?.map((leave) => (
                <div key={leave.id} className="card-premium p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-slate-900 capitalize">{leave.type} Leave</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <StatusChip 
                      status={leave.status} 
                      variant={leave.status === 'approved' ? 'success' : leave.status === 'rejected' ? 'error' : 'warning'} 
                    />
                    <p className="text-xs text-slate-400 mt-1">{leave.daysAllocated} days</p>
                  </div>
                </div>
              ))}
               {(!leaves || leaves.length === 0) && (
                 <div className="p-8 text-center text-slate-400 border border-dashed border-zinc-200 rounded-xl">No leave requests</div>
               )}
            </TabsContent>

            <TabsContent value="payroll" className="mt-0 space-y-4">
              {payroll?.map((pay) => (
                <div key={pay.id} className="card-premium p-4 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">${(pay.amount / 100).toFixed(2)}</h4>
                      <p className="text-xs text-slate-500">Salary for {pay.month}</p>
                    </div>
                  </div>
                  <StatusChip 
                    status={pay.status} 
                    variant={pay.status === 'paid' ? 'success' : 'warning'} 
                  />
                </div>
              ))}
              {(!payroll || payroll.length === 0) && (
                 <div className="p-8 text-center text-slate-400 border border-dashed border-zinc-200 rounded-xl">No payroll history</div>
               )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
