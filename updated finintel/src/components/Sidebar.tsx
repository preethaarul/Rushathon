import React from 'react';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Target, 
  MessageSquare, 
  LogOut,
  TrendingUp,
  Wallet
} from 'lucide-react';
import { cn } from './ui/Base';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  userName: string;
}

export default function Sidebar({ activeTab, setActiveTab, onLogout, userName }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'goals', label: 'Savings Goals', icon: Target },
    { id: 'chat', label: 'AI Assistant', icon: MessageSquare },
  ];

  return (
    <div className="w-64 h-screen bg-black/20 backdrop-blur-3xl border-r border-white/5 flex flex-col p-6">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Wallet className="text-white w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent font-display">
          FinIntel
        </h1>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
              activeTab === item.id 
                ? "bg-violet-500/10 text-violet-400 border border-violet-500/20 shadow-[0_0_20px_rgba(139,92,246,0.1)]" 
                : "text-white/50 hover:text-white hover:bg-white/5"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5 transition-transform group-hover:scale-110",
              activeTab === item.id ? "text-violet-400" : "text-white/40"
            )} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
        <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/5">
          <p className="text-xs text-white/40 uppercase tracking-wider font-bold mb-1">User</p>
          <p className="text-sm font-medium text-white truncate">{userName}</p>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
