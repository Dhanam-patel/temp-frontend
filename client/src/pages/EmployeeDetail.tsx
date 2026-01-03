import { Layout } from "@/components/Layout";
import { useEmployee, useEmployeePrivateInfo, useEmployeeSalary } from "@/hooks/use-employees";
import { useRoute, Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Mail, Phone, MapPin, Building, Briefcase, User as UserIcon, Shield, CreditCard, Plane, Circle, Globe, Calendar, CreditCard as CardIcon, Clock, Landmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAttendance } from "@/hooks/use-attendance";
import { usePayroll } from "@/hooks/use-payroll";
import { format } from "date-fns";
import { StatusChip } from "@/components/StatusChip";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export default function EmployeeDetail() {
  const [, params] = useRoute("/employees/:id");
  const idStr = params?.id;
  const { user: currentUser } = useAuth();
  const { employee, isLoading } = useEmployee(idStr!);
  const { data: privateInfo, isLoading: isLoadingPrivate } = useEmployeePrivateInfo(idStr!);
  const { data: salaryInfo, isLoading: isLoadingSalary } = useEmployeeSalary(idStr!);
  const { attendanceRecords } = useAttendance(idStr);
  const { payroll } = usePayroll(idStr!);

  if (isLoading) return <Layout><div className="p-8">Loading...</div></Layout>;
  if (!employee) return <Layout><div className="p-8">Employee not found</div></Layout>;

  const isAdmin = currentUser?.role === "admin";
  const isOwnProfile = currentUser?.email === employee.user?.email;
  const canViewPrivate = isAdmin || isOwnProfile;
  const canViewSalary = isAdmin || (isOwnProfile && currentUser?.role !== "employee"); // Assuming users see limited salary or none if just 'employee' but user said "Salary Info should be hidden or read-only for the user, depending on company policy". I'll allow read-only for users if it's their own.

  // Status Indicator logic
  const statusColor = employee.current_status === 'PRESENT' ? 'text-emerald-500' : 'text-slate-300';

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <Link href="/employees" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Employees
        </Link>
        <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-full border border-zinc-100 shadow-sm">
          <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
            <Circle className={cn("w-3 h-3 fill-current", statusColor)} />
            <span className="capitalize">{employee.current_status || 'ABSENT'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card-premium p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              {isAdmin && <Shield className="w-5 h-5 text-indigo-200" />}
            </div>
            <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-indigo-50 shadow-inner">
              <AvatarImage src={employee.photo_url || undefined} />
              <AvatarFallback className="text-4xl bg-indigo-100 text-indigo-700">
                {employee.full_name?.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold text-slate-900">{employee.full_name}</h2>
            <p className="text-indigo-600 font-medium">{employee.job_title}</p>
            <p className="text-sm text-slate-500 mt-1">{employee.department}</p>

            <div className="flex justify-center gap-2 mt-6">
              <Button variant="outline" size="sm" className="w-full">Message</Button>
              {isAdmin && <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700">Edit Profile</Button>}
            </div>
          </div>

          <div className="card-premium p-6 space-y-4">
            <h3 className="font-bold text-slate-900 border-b border-zinc-100 pb-2">Business Contact</h3>

            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs text-slate-400">Work Email</p>
                <p className="text-slate-700 font-medium truncate" title={employee.email}>{employee.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center text-slate-500">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Employee ID</p>
                <p className="text-slate-700 font-medium">#{employee.id.toString().padStart(4, '0')}</p>
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
            <TabsList className="w-full justify-start bg-transparent border-b border-zinc-200 p-0 h-auto gap-8 mb-6 rounded-none overflow-x-auto">
              <TabsTrigger value="attendance" className="tab-trigger">Attendance</TabsTrigger>
              <TabsTrigger value="private" className="tab-trigger">Private Info</TabsTrigger>
              <TabsTrigger value="salary" className="tab-trigger">Salary & Contract</TabsTrigger>
              <TabsTrigger value="payroll" className="tab-trigger">Payroll History</TabsTrigger>
            </TabsList>

            <TabsContent value="private" className="mt-0 space-y-6">
              {!canViewPrivate ? (
                <div className="p-12 text-center card-premium">
                  <Shield className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-900">Access Restricted</h3>
                  <p className="text-slate-500">You do not have permission to view this employee's private information.</p>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="card-premium p-6">
                    <div className="flex items-center gap-2 mb-6 border-b border-zinc-100 pb-4">
                      <UserIcon className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-bold text-slate-900">Personal Contact Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <DataField label="Personal Email" value={privateInfo?.personal_email} icon={Mail} />
                      <DataField label="Private Phone" value={privateInfo?.private_phone} icon={Phone} />
                      <DataField label="Emergency Contact" value={privateInfo?.emergency_contact} icon={Phone} />
                      <DataField label="Home Address" value={employee.address} icon={MapPin} />
                    </div>
                  </div>

                  <div className="card-premium p-6">
                    <div className="flex items-center gap-2 mb-6 border-b border-zinc-100 pb-4">
                      <Globe className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-bold text-slate-900">Identification & Status</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <DataField label="Nationality" value={privateInfo?.nationality} />
                      <DataField label="Gender" value={privateInfo?.gender} />
                      <DataField label="Marital Status" value={privateInfo?.marital_status} />
                      <DataField label="Date of Birth" value={privateInfo?.date_of_birth} icon={Calendar} />
                      <DataField label="Education Level" value={privateInfo?.certificate_level} />
                      <DataField label="Visa/Work Permit" value={privateInfo?.visa_info} />
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="salary" className="mt-0 space-y-6">
              {!canViewSalary ? (
                <div className="p-12 text-center card-premium">
                  <Shield className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-900">Access Restricted</h3>
                  <p className="text-slate-500">Salary information is only visible to HR and Administrators.</p>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="card-premium p-6 bg-indigo-50/30">
                    <div className="flex items-center gap-2 mb-6 border-b border-indigo-100 pb-4">
                      <CardIcon className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-bold text-slate-900">Compensation Details</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="col-span-1">
                        <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">Base Salary</p>
                        <p className="text-2xl font-bold text-indigo-600">
                          {salaryInfo?.base_salary ? `$${(salaryInfo.base_salary / 100).toLocaleString()}` : '-'}
                        </p>
                      </div>
                      <DataField label="Wage Type" value={salaryInfo?.wage_type} />
                      <DataField label="Pay Schedule" value={salaryInfo?.pay_schedule} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="card-premium p-6">
                      <div className="flex items-center gap-2 mb-4 border-b border-zinc-100 pb-2">
                        <Landmark className="w-4 h-4 text-indigo-600" />
                        <h4 className="font-bold text-slate-900">Bank Details</h4>
                      </div>
                      <div className="space-y-4">
                        <DataField label="Bank Name" value={salaryInfo?.bank_name} />
                        <DataField label="Account Number" value={salaryInfo?.account_number} />
                        <DataField label="SWIFT/IFSC Code" value={salaryInfo?.swift_code} />
                      </div>
                    </div>

                    <div className="card-premium p-6">
                      <div className="flex items-center gap-2 mb-4 border-b border-zinc-100 pb-2">
                        <Calendar className="w-4 h-4 text-indigo-600" />
                        <h4 className="font-bold text-slate-900">Contractual Data</h4>
                      </div>
                      <div className="space-y-4">
                        <DataField label="Contract Start" value={salaryInfo?.contract_start_date} />
                        <DataField label="Contract End" value={salaryInfo?.contract_end_date} />
                        <DataField label="Working Hours" value={`${salaryInfo?.working_hours || 0} hrs / week`} icon={Clock} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

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
                    {attendanceRecords?.map((record: any) => (
                      <tr key={record.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="px-6 py-4">{format(new Date(record.work_date), 'MMM dd, yyyy')}</td>
                        <td className="px-6 py-4">
                          <StatusChip status={record.status} variant={record.status === 'PRESENT' ? 'success' : 'error'} />
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {record.working_hours ? `${record.working_hours.toFixed(1)}h` : '-'}
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
              <div className="p-12 text-center text-slate-400 border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
                Feature coming soon.
              </div>
            </TabsContent>

            <TabsContent value="payroll" className="mt-0 space-y-4">
              {payroll?.map((pay: any) => (
                <div key={pay.id} className="card-premium p-5 flex justify-between items-center hover:border-emerald-100 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">${pay.net_pay.toLocaleString()}</h4>
                      <p className="text-xs text-slate-500 mt-1">Period: {pay.pay_period_start} to {pay.pay_period_end}</p>
                    </div>
                  </div>
                  <StatusChip
                    status="PAID"
                    variant="success"
                  />
                </div>
              ))}
              {(!payroll || payroll.length === 0) && (
                <div className="p-12 text-center text-slate-400 border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
                  <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  No payroll history found
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}

function DataField({ label, value, icon: Icon }: { label: string; value?: string | number | null; icon?: any }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{label}</p>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
        <p className="text-slate-800 font-medium">{value || '-'}</p>
      </div>
    </div>
  );
}
