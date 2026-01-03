import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { Users, CalendarOff, Clock, TrendingUp, Briefcase, LogIn, LogOut } from "lucide-react";
import { useEmployees } from "@/hooks/use-employees";
import { useAttendance } from "@/hooks/use-attendance";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from "@/hooks/use-auth";
import { StatusChip } from "@/components/StatusChip";
import { useUserStatus } from "@/hooks/use-user-status";
import StatusIndicator from "@/components/StatusIndicator";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user } = useAuth();
  const { employees } = useEmployees();
  const { attendanceRecords } = useAttendance();
  const { statuses, checkIn, checkOut, isCheckingIn, isCheckingOut } = useUserStatus();

  const totalEmployees = employees?.length || 0;
  const presentToday = attendanceRecords?.filter((a: any) =>
    new Date(a.work_date).toDateString() === new Date().toDateString() && a.status === 'PRESENT'
  ).length || 0;

  const isAdmin = user?.role === "admin";
  // The user status is linked via user.id (which is match with emp.user.id)
  // In our refactor, we want to find the status where email matches if IDs are problematic
  const currentUserStatus = statuses.find(s => s.email === user?.email);

  // Mock data for chart - in real app, aggregate from backend
  const attendanceData = [
    { name: 'Mon', present: 40, absent: 4 },
    { name: 'Tue', present: 42, absent: 2 },
    { name: 'Wed', present: 38, absent: 6 },
    { name: 'Thu', present: 43, absent: 1 },
    { name: 'Fri', present: 41, absent: 3 },
  ];

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          {isAdmin ? "Admin Dashboard" : "Employee Portal"}
        </h1>
        <p className="text-slate-500">
          {isAdmin ? "Overview of your company's HR metrics." : `Welcome back, ${user?.full_name}.`}
        </p>
      </div>

      {isAdmin ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            label="Total Employees"
            value={totalEmployees}
            icon={<Users className="w-5 h-5" />}
            trend="+12%"
            trendUp={true}
          />
          <StatCard
            label="Present Today"
            value={presentToday}
            icon={<Clock className="w-5 h-5" />}
            trend="96% rate"
            trendUp={true}
          />
          <StatCard
            label="On Leave"
            value="0"
            icon={<CalendarOff className="w-5 h-5" />}
            className="border-l-4 border-l-amber-400"
          />
          <StatCard
            label="Hiring Pipeline"
            value="8"
            icon={<TrendingUp className="w-5 h-5" />}
            trend="3 interviews"
            trendUp={true}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            label="Leave Balance"
            value="12 days"
            icon={<CalendarOff className="w-5 h-5" />}
          />
          <StatCard
            label="Attendance Score"
            value="98%"
            icon={<Clock className="w-5 h-5" />}
            trendUp={true}
          />
          <StatCard
            label="Active Project"
            value="Dayflow"
            icon={<Briefcase className="w-5 h-5" />}
          />
        </div>
      )}

      {/* Check-In/Check-Out Section for Employees */}
      {!isAdmin && user && (
        <div className="bg-white rounded-2xl shadow-xl shadow-zinc-200/50 border border-zinc-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Attendance</h3>
              <p className="text-sm text-slate-500">Mark your attendance for today</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Status:</span>
              {currentUserStatus && (
                <StatusIndicator status={currentUserStatus.current_status} size="md" showLabel />
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => checkIn()}
              disabled={isCheckingIn || currentUserStatus?.current_status === "PRESENT"}
              className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white"
            >
              <LogIn className="w-5 h-5 mr-2" />
              {isCheckingIn ? "Checking In..." : "Check In"}
            </Button>

            <Button
              onClick={() => checkOut()}
              disabled={isCheckingOut || currentUserStatus?.current_status !== "PRESENT"}
              className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <LogOut className="w-5 h-5 mr-2" />
              {isCheckingOut ? "Checking Out..." : "Check Out"}
            </Button>
          </div>

          {currentUserStatus?.last_check_in && (
            <div className="mt-4 p-3 bg-slate-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Last Check-In:</span>
                  <p className="font-medium text-slate-900">
                    {new Date(currentUserStatus.last_check_in).toLocaleTimeString()}
                  </p>
                </div>
                {currentUserStatus.last_check_out && (
                  <div>
                    <span className="text-slate-500">Last Check-Out:</span>
                    <p className="font-medium text-slate-900">
                      {new Date(currentUserStatus.last_check_out).toLocaleTimeString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-premium p-6">
          <h3 className="text-lg font-bold mb-6">Weekly Attendance</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                <Tooltip
                  cursor={{ fill: '#F1F5F9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="present" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="absent" fill="#E2E8F0" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-premium p-6">
          <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {isAdmin ? (
              <>
                <button className="w-full py-3 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium transition-colors text-left flex items-center justify-between group">
                  Add New Employee
                  <span className="text-xl leading-none group-hover:translate-x-1 transition-transform">→</span>
                </button>
                <button className="w-full py-3 px-4 bg-zinc-50 hover:bg-zinc-100 text-slate-700 rounded-lg text-sm font-medium transition-colors text-left flex items-center justify-between group">
                  Process Payroll
                  <span className="text-xl leading-none group-hover:translate-x-1 transition-transform">→</span>
                </button>
                <button className="w-full py-3 px-4 bg-zinc-50 hover:bg-zinc-100 text-slate-700 rounded-lg text-sm font-medium transition-colors text-left flex items-center justify-between group">
                  Approve Leave Requests
                  <span className="text-xl leading-none group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </>
            ) : (
              <>
                <button className="w-full py-3 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium transition-colors text-left flex items-center justify-between group">
                  Request Time Off
                  <span className="text-xl leading-none group-hover:translate-x-1 transition-transform">→</span>
                </button>
                <button className="w-full py-3 px-4 bg-zinc-50 hover:bg-zinc-100 text-slate-700 rounded-lg text-sm font-medium transition-colors text-left flex items-center justify-between group">
                  Mark Attendance
                  <span className="text-xl leading-none group-hover:translate-x-1 transition-transform">→</span>
                </button>
                <button className="w-full py-3 px-4 bg-zinc-50 hover:bg-zinc-100 text-slate-700 rounded-lg text-sm font-medium transition-colors text-left flex items-center justify-between group">
                  View My Payslips
                  <span className="text-xl leading-none group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </>
            )}
          </div>

          {isAdmin && (
            <div className="mt-8 pt-6 border-t border-zinc-100">
              <p className="text-sm text-slate-400">All systems operational</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
