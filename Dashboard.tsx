
import React from 'react';
import { DashboardStats, Patient, VisitStatus } from '../types';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  IndianRupee, 
  AlertCircle,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from 'recharts';

interface DashboardProps {
  stats: DashboardStats;
  patients: Patient[];
  onSelect: (id: string) => void;
  onViewAll: () => void;
  userName: string;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, patients, onSelect, onViewAll, userName }) => {
  const cards = [
    { label: 'Assigned Patients', value: stats.totalThisMonth, icon: Users, color: 'blue', sub: 'Total' },
    { label: 'Visited Today', value: stats.visitedCount, icon: CheckCircle2, color: 'green', sub: 'Completed' },
    { label: 'Pending List', value: stats.notVisitedCount, icon: XCircle, color: 'amber', sub: 'In Queue' },
    { label: 'Revenue Earned', value: `₹${stats.feesPaid}`, icon: IndianRupee, color: 'indigo', sub: 'Paid' },
    { label: 'Pending Fees', value: `₹${stats.feesPending}`, icon: AlertCircle, color: 'rose', sub: 'Unpaid' },
  ];

  const chartData = [
    { name: 'Visited', value: stats.visitedCount },
    { name: 'Pending', value: stats.notVisitedCount },
  ];

  const COLORS = ['#3b82f6', '#f59e0b'];

  const recentPatients = [...patients].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ).slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Welcome, {userName}</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Here is your daily clinical performance summary.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          const colorClass = {
            blue: 'bg-blue-50 text-blue-600 border-blue-100',
            green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            amber: 'bg-amber-50 text-amber-600 border-amber-100',
            indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
            rose: 'bg-rose-50 text-rose-600 border-rose-100',
          }[card.color as keyof typeof colorClass];

          return (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-xl border ${colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{card.label}</span>
                <div className="text-2xl font-bold text-slate-900 mt-1">{card.value}</div>
                <p className="text-slate-400 text-[10px] mt-1 font-semibold">{card.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-800">Visit Status Breakdown</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={50}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">Next in Queue</h3>
            <button 
              onClick={onViewAll}
              className="text-blue-600 text-[10px] font-bold uppercase tracking-wider hover:text-blue-700"
            >
              View List
            </button>
          </div>
          <div className="space-y-3 flex-1">
            {recentPatients.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm italic">No patients assigned yet.</div>
            ) : (
              recentPatients.map((p) => (
                <div 
                  key={p.id} 
                  onClick={() => onSelect(p.id)}
                  className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-blue-50 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-blue-100 group"
                >
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold text-sm shadow-sm">
                    {p.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-900 truncate">{p.name}</div>
                    <div className="text-[10px] text-slate-500 font-medium truncate">{p.whatsAppNumber}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
              ))
            )}
          </div>
          <div className="mt-6 pt-6 border-t border-slate-100">
             <div className="flex justify-between items-center mb-1">
               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Earnings</span>
               <span className="text-emerald-600 text-[10px] font-bold">+100%</span>
             </div>
             <div className="text-3xl font-bold text-slate-900 leading-none">₹{stats.feesPaid}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
