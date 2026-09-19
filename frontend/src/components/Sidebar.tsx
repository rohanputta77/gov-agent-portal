import type { Page } from "../App";
import { useAuth } from "../contexts/AuthContext";

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems = [
  { id: "dashboard", label: "Home", icon: "🏛️" },
  { id: "applications", label: "My Applications", icon: "📄" },
  { id: "documents", label: "Document Vault", icon: "🔒" },
  { id: "audit", label: "Activity Log", icon: "📋" },
] as const;

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { user, logout } = useAuth();
  
  // Extract initials from user name or email
  const initials = user?.name 
    ? user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
    : user?.email.substring(0, 2).toUpperCase() || "US";

  return (
    <aside className="w-64 flex flex-col bg-[#0b1320] text-slate-300 border-r border-slate-800/60 shadow-2xl shrink-0">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg border border-slate-700 bg-slate-800/50 flex items-center justify-center text-orange-400 shadow-inner">
            <span className="text-xl">☸️</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 tracking-wide uppercase">Gov<span className="text-orange-400">Agent</span></h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium mt-0.5">National Portal</p>
          </div>
        </div>
      </div>

      {/* User */}
      <div className="px-6 py-5 border-b border-slate-800/60 bg-slate-900/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="truncate">
            <p className="text-sm font-semibold text-slate-200 truncate">{user?.name || user?.email}</p>
            <p className="text-xs text-slate-500">Verified Identity ✓</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as Page)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-slate-800/60 text-white border-l-2 border-orange-500 rounded-r-lg"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 rounded-lg border-l-2 border-transparent"
              }`}
            >
              <span className="text-base opacity-80">{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer note */}
      <div className="px-6 py-5 border-t border-slate-800/60 bg-slate-900/30 flex justify-between items-center">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="text-green-500">●</span> 
          <span>Secure Gov Network</span>
        </div>
        <button 
          onClick={logout}
          className="text-xs text-slate-400 hover:text-white transition-colors"
          title="Sign out"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
