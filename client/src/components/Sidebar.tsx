import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  CalendarDays, 
  Banknote,
  LogOut,
  Hexagon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Employees", icon: Users, href: "/employees" },
  { label: "Attendance", icon: CalendarCheck, href: "/attendance" },
  { label: "Time Off", icon: CalendarDays, href: "/leaves" },
  { label: "Payroll", icon: Banknote, href: "/payroll" },
];

export function Sidebar() {
  const [location] = useLocation();
  const { logout, user } = useAuth();

  const filteredItems = navItems.filter(item => {
    if (item.href === "/employees" && user?.role !== "admin") return false;
    return true;
  });

  return (
    <div className="w-64 h-screen bg-slate-900 text-white flex flex-col flex-shrink-0 transition-all duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Hexagon className="w-6 h-6 text-white fill-indigo-500 stroke-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold font-display tracking-tight">Dayflow</h1>
          <p className="text-xs text-slate-400 font-medium">HR Management</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {filteredItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer group",
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
