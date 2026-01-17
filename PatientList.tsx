
import React, { useState } from 'react';
import { Patient, VisitStatus, PaymentStatus } from '../types';
import { MoreHorizontal, ExternalLink, Calendar, CheckCircle, XCircle } from 'lucide-react';

interface PatientListProps {
  patients: Patient[];
  onSelect: (id: string) => void;
  isHistory?: boolean;
}

const PatientList: React.FC<PatientListProps> = ({ patients, onSelect, isHistory }) => {
  const [filter, setFilter] = useState<'ALL' | VisitStatus>('ALL');

  const displayPatients = filter === 'ALL' ? patients : patients.filter(p => p.visitStatus === filter);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${filter === 'ALL' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-200'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter(VisitStatus.VISITED)}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${filter === VisitStatus.VISITED ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-200'}`}
          >
            Visited
          </button>
          <button 
            onClick={() => setFilter(VisitStatus.NOT_VISITED)}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${filter === VisitStatus.NOT_VISITED ? 'bg-amber-600 text-white' : 'text-slate-500 hover:bg-slate-200'}`}
          >
            Pending
          </button>
        </div>
        <span className="text-xs text-slate-400 font-medium">Showing {displayPatients.length} Patients</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">
              <th className="px-6 py-4">Patient Details</th>
              <th className="px-6 py-4">Reg Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Fees</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayPatients.map((p) => (
              <tr 
                key={p.id} 
                className="hover:bg-blue-50/30 group transition-colors cursor-pointer"
                onClick={() => onSelect(p.id)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{p.name}</div>
                      <div className="text-xs text-slate-500">{p.whatsAppNumber}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(p.timestamp).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                    p.visitStatus === VisitStatus.VISITED 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {p.visitStatus === VisitStatus.VISITED ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    {p.visitStatus}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900">₹{p.consultationFee}</span>
                    <span className={`text-[10px] font-medium ${p.paymentStatus === PaymentStatus.PAID ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {p.paymentStatus}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 text-slate-400 hover:text-blue-600 transition-all">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {displayPatients.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                  No patients found for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientList;
