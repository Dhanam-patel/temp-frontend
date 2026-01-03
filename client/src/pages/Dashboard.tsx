import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { Users, CalendarOff, Clock, TrendingUp, Briefcase } from "lucide-react";
import { useEmployees } from "@/hooks/use-employees";
import { useAttendance } from "@/hooks/use-attendance";
import { useLeaves } from "@/hooks/use-leaves";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from "@/hooks/use-auth";
import { StatusChip } from "@/components/StatusChip";

export default function Dashboard() {
  const { user } = useAuth();
  const { employees } = useEmployees();
  const { attendanceRecords } = useAttendance();
  const { leaves } = useLeaves();

  const totalEmployees = employees?.length || 0;
  const presentToday = attendanceRecords?.filter(a => 
    new Date(a.date).toDateString() === new Date().toDateString() && a.status === 'present'
  ).length || 0;
  
  const onLeaveToday = leaves?.filter(l => {
    const today = new Date();
    const start = new Date(l.startDate);
    const end = new Date(l.endDate);
    return today >= start && today <= end && l.status === 'approved';
  }).length || 0;

  const isAdmin = user?.role === "admin";

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
          {isAdmin ? "Overview of your company's HR metrics." : `Welcome back, ${user?.fullName}.`}
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
            value={onLeaveToday} 
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-premium p-6">
          <h3 className="text-lg font-bold mb-6">Weekly Attendance</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
                <Tooltip 
                  cursor={{fill: '#F1F5F9'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
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
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-100">
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Pending Approvals</h4>
            {leaves?.filter(l => l.status === 'pending').slice(0, 3).map(leave => (
              <div key={leave.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                    ID{leave.employeeId}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{leave.type}</p>
                    <p className="text-xs text-slate-500">{new Date(leave.startDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <StatusChip status="pending" variant="warning" />
              </div>
            ))}
            {(!leaves || leaves.filter(l => l.status === 'pending').length === 0) && (
              <p className="text-sm text-slate-400">No pending requests</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
