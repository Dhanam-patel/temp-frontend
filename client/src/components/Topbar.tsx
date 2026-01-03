import { Search, Bell, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

export function Topbar() {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center w-96 relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-zinc-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-zinc-200 mx-1"></div>

        <div className="flex items-center gap-3 pl-2 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900">{user?.fullName}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role} {user?.jobTitle ? `| ${user.jobTitle}` : ''}</p>
          </div>
          <Avatar className="w-9 h-9 border border-zinc-200">
            <AvatarImage src={user?.photoUrl || "https://github.com/shadcn.png"} />
            <AvatarFallback className="bg-indigo-50 text-indigo-600"><UserIcon className="w-4 h-4" /></AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
