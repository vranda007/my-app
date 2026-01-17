
import React, { useState, useEffect } from 'react';
import { HeartPulse, Lock, User, AlertCircle, Loader2, CheckCircle2, ShieldCheck, UserPlus, ArrowLeft, Shield } from 'lucide-react';
import { AuthUser, UserRole } from '../types';

// Initial base users
const INITIAL_USERS = [
  { id: 'ss78648742', password: 'Sumit@siyasi1', name: 'Administrator', role: UserRole.ADMIN },
  { id: 'Dr. Smith', password: 'Smith@456', name: 'Dr. Smith', role: UserRole.DOCTOR },
  { id: 'Dr. Anevesh', password: 'Anevesh@789', name: 'Dr. Anevesh', role: UserRole.DOCTOR },
];

interface LoginProps {
  onLogin: (user: AuthUser) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [loginRole, setLoginRole] = useState<UserRole>(UserRole.DOCTOR);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Persistence for registered users
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('doc_manage_registered_users');
    if (saved) {
      setRegisteredUsers(JSON.parse(saved));
    } else {
      setRegisteredUsers(INITIAL_USERS);
      localStorage.setItem('doc_manage_registered_users', JSON.stringify(INITIAL_USERS));
    }
  }, []);

  const validatePassword = (pass: string) => {
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasNumber = /\d/.test(pass);
    const hasSpecial = /[@$!%*?&]/.test(pass);
    const isLongEnough = pass.length >= 8;
    return { 
      hasUpper, 
      hasLower, 
      hasNumber, 
      hasSpecial, 
      isLongEnough, 
      isValid: hasUpper && hasLower && hasNumber && hasSpecial && isLongEnough 
    };
  };

  const passwordReqs = validatePassword(password);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    setTimeout(() => {
      if (mode === 'LOGIN') {
        const userMatch = registeredUsers.find(u => 
          u.id === username && 
          u.password === password && 
          u.role === loginRole
        );
        
        if (userMatch) {
          onLogin({ id: userMatch.id, name: userMatch.name, role: userMatch.role });
        } else {
          setError(`Invalid credentials for ${loginRole === UserRole.ADMIN ? 'Administrator' : 'Doctor'}.`);
          setIsSubmitting(false);
        }
      } else {
        // Sign Up Logic (Only for Doctors)
        if (registeredUsers.some(u => u.id === username)) {
          setError('This Registration ID is already taken. Please choose a unique one.');
          setIsSubmitting(false);
          return;
        }

        if (!passwordReqs.isValid) {
          setError('Password does not meet the security requirements.');
          setIsSubmitting(false);
          return;
        }

        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setIsSubmitting(false);
          return;
        }

        const newUser = {
          id: username,
          password,
          name: displayName || username,
          role: UserRole.DOCTOR
        };

        const updatedUsers = [...registeredUsers, newUser];
        setRegisteredUsers(updatedUsers);
        localStorage.setItem('doc_manage_registered_users', JSON.stringify(updatedUsers));
        
        setSuccess('Doctor account created successfully! You can now log in.');
        setMode('LOGIN');
        setLoginRole(UserRole.DOCTOR);
        setIsSubmitting(false);
        setPassword('');
        setConfirmPassword('');
      }
    }, 1000);
  };

  const toggleMode = () => {
    setMode(mode === 'LOGIN' ? 'SIGNUP' : 'LOGIN');
    setError(null);
    setSuccess(null);
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl text-white mb-4 shadow-xl shadow-blue-200">
            <HeartPulse className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">DocManage</h1>
          <p className="text-slate-500 mt-2 font-medium">OPD Management Portal</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl relative overflow-hidden">
          {/* Header Role Toggle */}
          {mode === 'LOGIN' && (
            <div className="flex p-1 bg-slate-100 m-6 rounded-xl">
              <button 
                onClick={() => setLoginRole(UserRole.DOCTOR)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${loginRole === UserRole.DOCTOR ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <User className="w-4 h-4" /> Doctor
              </button>
              <button 
                onClick={() => setLoginRole(UserRole.ADMIN)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${loginRole === UserRole.ADMIN ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Shield className="w-4 h-4" /> Admin
              </button>
            </div>
          )}

          <div className={`p-8 pt-0 transition-all duration-300 ${isSubmitting ? 'blur-sm pointer-events-none opacity-50' : ''}`}>
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center justify-between">
              {mode === 'LOGIN' 
                ? `${loginRole === UserRole.ADMIN ? 'Admin' : 'Doctor'} Login` 
                : 'Doctor Sign Up'}
              {mode === 'SIGNUP' && (
                <button onClick={toggleMode} className="text-blue-600 p-1 hover:bg-blue-50 rounded-lg transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
            </h2>
            
            <form onSubmit={handleAuth} className="space-y-4">
              {mode === 'SIGNUP' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                      placeholder="e.g. Dr. John Doe"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">
                  {mode === 'LOGIN' ? 'Registration ID' : 'Choose Unique ID'}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                    placeholder={loginRole === UserRole.ADMIN ? "Admin ID" : "Doctor ID"}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {mode === 'SIGNUP' && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                    <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 uppercase">
                      <ShieldCheck className="w-3 h-3 text-blue-500" /> Password Security Guide
                    </div>
                    <div className="grid grid-cols-2 gap-y-1">
                      {[
                        { label: '8+ Characters', ok: passwordReqs.isLongEnough },
                        { label: 'Uppercase (A-Z)', ok: passwordReqs.hasUpper },
                        { label: 'Lowercase (a-z)', ok: passwordReqs.hasLower },
                        { label: 'Number (0-9)', ok: passwordReqs.hasNumber },
                        { label: 'Special char (@$!%*)', ok: passwordReqs.hasSpecial },
                      ].map((req, i) => (
                        <div key={i} className={`flex items-center gap-1.5 text-[9px] font-bold ${req.ok ? 'text-emerald-600' : 'text-slate-400'}`}>
                          <CheckCircle2 className={`w-2.5 h-2.5 ${req.ok ? 'opacity-100' : 'opacity-20'}`} />
                          {req.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-600 rounded-xl text-[11px] font-bold border border-rose-100">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-600 rounded-xl text-[11px] font-bold border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || (mode === 'SIGNUP' && !passwordReqs.isValid)}
                className={`w-full py-3 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  loginRole === UserRole.ADMIN ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                }`}
              >
                {mode === 'LOGIN' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {loginRole === UserRole.DOCTOR && (
              <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                {mode === 'LOGIN' ? (
                  <p className="text-xs text-slate-500">
                    New clinician?{' '}
                    <button onClick={toggleMode} className="text-blue-600 font-bold hover:underline">
                      Create Doctor Account
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">
                    Already have an account?{' '}
                    <button onClick={toggleMode} className="text-blue-600 font-bold hover:underline">
                      Sign In
                    </button>
                  </p>
                )}
              </div>
            )}
            
            {mode === 'LOGIN' && loginRole === UserRole.ADMIN && (
              <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                <p className="text-[10px] text-slate-400 font-medium">
                  Administrator accounts are managed by the IT department.
                </p>
              </div>
            )}
          </div>

          {isSubmitting && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px]">
              <Loader2 className={`w-10 h-10 animate-spin ${loginRole === UserRole.ADMIN ? 'text-indigo-600' : 'text-blue-600'}`} />
              <p className="mt-4 text-xs font-bold text-slate-600 uppercase tracking-widest animate-pulse">
                {mode === 'LOGIN' ? 'Verifying...' : 'Processing...'}
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center space-y-2">
          <p className="text-slate-400 text-[10px] font-medium uppercase tracking-tight">Secure Access Portal</p>
          <div className="flex justify-center gap-4">
             <span className="text-[10px] text-slate-300 font-bold">v2.6.0-ENTERPRISE</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
