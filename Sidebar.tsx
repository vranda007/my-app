
import React, { useState } from 'react';
import { ViewType, AuthUser, UserRole } from '../types';
import { LayoutDashboard, Users, Clock, Settings, HeartPulse, LogOut, X, Check } from 'lucide-react';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  user: AuthUser;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, user, onLogout }) => {
  const [isConfirmingLogout, setIsConfirmingLogout] = useState(false);

  const items = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'LIST', label: 'My Patients', icon: Users },
    { id: 'HISTORY', label: 'Case History', icon: Clock },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden lg:flex border-r border-slate-800">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <HeartPulse className="w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold text-white tracking-tight leading-none">DocManage</span>
          <span className="text-[10px] text-blue-400 font-bold uppercase mt-1 tracking-widest">Clinician v2</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setView(item.id as ViewType);
                setIsConfirmingLogout(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-3">
        <div className="px-4 py-3 bg-slate-800/30 rounded-xl border border-slate-800/50">
           <div className="text-[10px] text-slate-500 font-bold uppercase mb-1 tracking-tight">Logged as</div>
           <div className="text-xs font-bold text-white truncate">{user.name}</div>
        </div>
        
        {!isConfirmingLogout ? (
          <button 
            onClick={() => setIsConfirmingLogout(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all border border-transparent hover:border-rose-500/20 group"
          >
            <LogOut className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            Log Out
          </button>
        ) : (
          <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-[10px] text-rose-400 font-bold uppercase text-center mb-1">Confirm Logout?</div>
            <div className="flex gap-2">
              <button 
                onClick={onLogout}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-lg shadow-rose-900/40"
              >
                <Check className="w-3 h-3" /> Yes
              </button>
              <button 
                onClick={() => setIsConfirmingLogout(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all"
              >
                <X className="w-3 h-3" /> No
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
