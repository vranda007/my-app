
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Patient, 
  ViewType, 
  VisitStatus, 
  PaymentStatus, 
  DashboardStats,
  Gender,
  Visit,
  AuthUser,
  UserRole
} from './types';
import { FIXED_CONSULTATION_FEE } from './constants';
import Dashboard from './components/Dashboard';
import PatientList from './components/PatientList';
import PatientProfile from './components/PatientProfile';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import { Search, Bell, Loader2, RefreshCcw, LogOut } from 'lucide-react';

const SHEET_ID = '1o2Z5pPLB8ZsTswfRkyPZIGgdvCJGp0aBDBE36KzUw9o';
const SHEET_NAME = 'Form%20Responses%201';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}`;

const App: React.FC = () => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>('DASHBOARD');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for logged in user
    const savedUser = localStorage.getItem('doc_manage_user');
    if (savedUser) {
      setAuthUser(JSON.parse(savedUser));
    }

    const savedPatients = localStorage.getItem('doc_manage_patients');
    if (savedPatients) {
      setPatients(JSON.parse(savedPatients));
      setIsLoading(false);
    }
    fetchSheetData();
  }, []);

  const parseCSV = (csvText: string): Patient[] => {
    const lines = csvText.split(/\r?\n/);
    if (lines.length < 2) return [];

    const parseLine = (line: string) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseLine(lines[0]).map(h => h.replace(/^"|"$/g, '').toLowerCase());
    const rawRows = lines.slice(1).filter(line => line.trim()).map(line => {
      const values = parseLine(line).map(v => v.replace(/^"|"$/g, ''));
      const row: any = {};
      headers.forEach((header, i) => row[header] = values[i] || '');
      return row;
    });

    const grouped = new Map<string, any[]>();
    rawRows.forEach(row => {
      const phone = row['whatsapp number'] || row['whats_app_number'] || 'unknown';
      if (!grouped.has(phone)) grouped.set(phone, []);
      grouped.get(phone)?.push(row);
    });

    const finalPatients: Patient[] = [];

    grouped.forEach((rows, phone) => {
      const sortedRows = rows.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      const latest = sortedRows[0];
      
      const history: Visit[] = sortedRows.slice(1).map(r => ({
        timestamp: r.timestamp,
        doctorName: r['select doctor name'] || r['doctor name'] || 'Not Assigned',
        doctorNotes: r['doctor notes'] || '',
        visitStatus: (r['visit status'] as VisitStatus) || VisitStatus.VISITED,
        paymentStatus: (r['payment status'] as PaymentStatus) || PaymentStatus.PAID,
        consultationFee: parseInt(r['consultation fee']) || FIXED_CONSULTATION_FEE,
      }));

      finalPatients.push({
        id: phone,
        timestamp: latest.timestamp,
        name: latest['name'] || 'Unknown',
        gender: (latest['gender'] as Gender) || Gender.OTHER,
        whatsAppNumber: phone,
        dob: latest['date of birth'] || latest['dob'] || '',
        address: latest['address'] || '',
        initialConsultingFees: latest['consulting fees'] || '',
        doctorName: latest['select doctor name'] || latest['doctor name'] || 'Not Assigned',
        visitStatus: (latest['visit status'] as VisitStatus) || VisitStatus.NOT_VISITED,
        visitDate: latest['visit date'] || '',
        consultationFee: parseInt(latest['consultation fee']) || FIXED_CONSULTATION_FEE,
        paymentStatus: (latest['payment status'] as PaymentStatus) || PaymentStatus.NOT_PAID,
        doctorNotes: latest['doctor notes'] || '',
        nextVisitDate: latest['next visit date'] || '',
        internalMessage: latest['internal message'] || '',
        history: history
      });
    });

    return finalPatients;
  };

  const fetchSheetData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(CSV_URL);
      if (!response.ok) throw new Error('Failed to fetch data from Google Sheet.');
      const csvText = await response.text();
      const sheetPatients = parseCSV(csvText);
      
      setPatients(prevPatients => {
        const merged = sheetPatients.map(sp => {
          const existing = prevPatients.find(p => p.whatsAppNumber === sp.whatsAppNumber);
          if (existing) {
            return {
              ...sp,
              visitStatus: existing.visitStatus,
              paymentStatus: existing.paymentStatus,
              doctorNotes: existing.doctorNotes,
              visitDate: existing.visitDate,
              nextVisitDate: existing.nextVisitDate,
              internalMessage: existing.internalMessage,
              history: sp.history
            };
          }
          return sp;
        });
        localStorage.setItem('doc_manage_patients', JSON.stringify(merged));
        return merged;
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePatient = (updated: Patient) => {
    setPatients(prev => {
      const next = prev.map(p => p.id === updated.id ? updated : p);
      localStorage.setItem('doc_manage_patients', JSON.stringify(next));
      return next;
    });
  };

  // SECURE DATA VISIBILITY LOGIC
  const visiblePatients = useMemo(() => {
    if (!authUser) return [];
    
    // 1. Admin Role: Can see ALL patient records
    if (authUser.role === UserRole.ADMIN) {
      return patients;
    }
    
    // 2. Doctor Role: Filter based on 'Select Doctor Name' column in the sheet
    // We match case-insensitively against both the Doctor's Registration ID and their Full Name
    return patients.filter(p => {
      const assignedDoctor = p.doctorName?.trim().toLowerCase();
      const doctorId = authUser.id.toLowerCase();
      const doctorName = authUser.name.toLowerCase();
      
      return assignedDoctor === doctorId || assignedDoctor === doctorName;
    });
  }, [patients, authUser]);

  const stats = useMemo((): DashboardStats => {
    return {
      totalThisMonth: visiblePatients.length,
      visitedCount: visiblePatients.filter(p => p.visitStatus === VisitStatus.VISITED).length,
      notVisitedCount: visiblePatients.filter(p => p.visitStatus === VisitStatus.NOT_VISITED).length,
      feesPaid: visiblePatients.filter(p => p.paymentStatus === PaymentStatus.PAID).length * FIXED_CONSULTATION_FEE,
      feesPending: visiblePatients.filter(p => p.paymentStatus === PaymentStatus.NOT_PAID).length * FIXED_CONSULTATION_FEE,
      totalUniquePatients: visiblePatients.length
    };
  }, [visiblePatients]);

  const filteredPatients = useMemo(() => {
    return visiblePatients.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.whatsAppNumber.includes(searchQuery)
    );
  }, [visiblePatients, searchQuery]);

  const selectedPatient = useMemo(() => 
    visiblePatients.find(p => p.id === selectedPatientId) || null
  , [visiblePatients, selectedPatientId]);

  const handleSelectPatient = (id: string) => {
    setSelectedPatientId(id);
    setCurrentView('PROFILE');
  };

  const handleLogin = (user: AuthUser) => {
    setAuthUser(user);
    localStorage.setItem('doc_manage_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setAuthUser(null);
    localStorage.removeItem('doc_manage_user');
    setCurrentView('DASHBOARD');
  };

  if (!authUser) {
    return <Login onLogin={handleLogin} />;
  }

  if (isLoading && patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-600 font-medium tracking-tight">Accessing Secure Records...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar 
        currentView={currentView} 
        setView={(v) => { setCurrentView(v); setSelectedPatientId(null); }} 
        user={authUser}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <input 
                type="text" 
                placeholder={authUser.role === UserRole.ADMIN ? "Search all patients..." : "Search my patients..."}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={fetchSheetData}
              disabled={isLoading}
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-all"
              title="Refresh Records"
            >
              <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-900 leading-tight">{authUser.name}</div>
                <div className={`text-[10px] font-bold uppercase tracking-wider ${authUser.role === UserRole.ADMIN ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {authUser.role}
                </div>
              </div>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 ${authUser.role === UserRole.ADMIN ? 'bg-indigo-600 border-indigo-100' : 'bg-blue-600 border-blue-100'}`}>
                {authUser.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {currentView === 'DASHBOARD' && (
            <Dashboard 
              stats={stats} 
              patients={visiblePatients} 
              onSelect={handleSelectPatient} 
              onViewAll={() => setCurrentView('LIST')}
              userName={authUser.name}
            />
          )}
          
          {(currentView === 'LIST' || currentView === 'HISTORY') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {currentView === 'LIST' 
                      ? (authUser.role === UserRole.ADMIN ? 'Global Patient Registry' : 'My Patient Registry') 
                      : 'Clinical History'}
                  </h1>
                  <p className="text-slate-500 text-xs">
                    {authUser.role === UserRole.ADMIN 
                      ? 'Displaying all records from the centralized system.' 
                      : 'Records automatically assigned to your ID in the Google Sheet.'}
                  </p>
                </div>
              </div>
              <PatientList 
                patients={filteredPatients} 
                onSelect={handleSelectPatient}
                isHistory={currentView === 'HISTORY'}
              />
            </div>
          )}

          {currentView === 'PROFILE' && selectedPatient && (
            <PatientProfile 
              patient={selectedPatient} 
              onUpdate={handleUpdatePatient}
              onBack={() => setCurrentView('LIST')}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
