
import React, { useState } from 'react';
import { Patient, VisitStatus, PaymentStatus, Visit, Gender } from '../types';
import { 
  ArrowLeft, 
  Save, 
  Sparkles, 
  Phone,
  MapPin,
  History,
  Clock,
  User,
  Calendar,
  Stethoscope
} from 'lucide-react';
import { geminiService } from '../services/geminiService';

interface PatientProfileProps {
  patient: Patient;
  onUpdate: (updated: Patient) => void;
  onBack: () => void;
}

const PatientProfile: React.FC<PatientProfileProps> = ({ patient, onUpdate, onBack }) => {
  const [edited, setEdited] = useState<Patient>({ ...patient });
  const [isGeneratingMsg, setIsGeneratingMsg] = useState(false);
  const [activeTab, setActiveTab] = useState<'CURRENT' | 'HISTORY'>('CURRENT');

  const handleSave = () => {
    onUpdate(edited);
    alert('Patient record updated successfully!');
  };

  const handleGenerateAI = async () => {
    if (!edited.doctorNotes) {
      alert("Please enter doctor notes first.");
      return;
    }
    setIsGeneratingMsg(true);
    const msg = await geminiService.generateInternalMessage(edited.name, edited.doctorNotes);
    setEdited({ ...edited, internalMessage: msg });
    setIsGeneratingMsg(false);
  };

  const sendWhatsApp = () => {
    const text = encodeURIComponent(`Hello ${edited.name}, ${edited.internalMessage}`);
    window.open(`https://wa.me/${edited.whatsAppNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to List
        </button>
        <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm font-semibold transition-all">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-24">
            <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
              <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-3xl font-bold mb-4">
                {edited.name.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-slate-900">{edited.name}</h2>
              <p className="text-slate-500 text-sm">Patient ID: {edited.whatsAppNumber}</p>
              <div className="mt-4 flex gap-2">
                 <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {edited.history.length + 1} Total Visits
                 </span>
              </div>
            </div>
            
            <div className="mt-6 space-y-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-sm">
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-tight">Gender</div>
                  <div className="text-slate-800 font-semibold">{edited.gender || 'Not Specified'}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <Calendar className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-sm">
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-tight">Date of Birth</div>
                  <div className="text-slate-800 font-semibold">{edited.dob || 'Not Provided'}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <Phone className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-sm">
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-tight">WhatsApp</div>
                  <div className="text-slate-800 font-semibold">{edited.whatsAppNumber}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <MapPin className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-sm">
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-tight">Address</div>
                  <div className="text-slate-800 font-semibold leading-relaxed">{edited.address || 'No address saved.'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Tabs & Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex border-b border-slate-200">
            <button 
              onClick={() => setActiveTab('CURRENT')}
              className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'CURRENT' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              Current Visit
            </button>
            <button 
              onClick={() => setActiveTab('HISTORY')}
              className={`px-6 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'HISTORY' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              <History className="w-4 h-4" />
              Past Visits ({edited.history.length})
            </button>
          </div>

          {activeTab === 'CURRENT' ? (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-800">Visit & Billing</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Visit Status</label>
                    <select 
                      value={edited.visitStatus} 
                      onChange={(e) => setEdited({...edited, visitStatus: e.target.value as VisitStatus})}
                      className="w-full p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                    >
                      <option value={VisitStatus.NOT_VISITED}>Not Visited</option>
                      <option value={VisitStatus.VISITED}>Visited</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Payment Status</label>
                    <select 
                      value={edited.paymentStatus} 
                      onChange={(e) => setEdited({...edited, paymentStatus: e.target.value as PaymentStatus})}
                      className="w-full p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                    >
                      <option value={PaymentStatus.NOT_PAID}>Not Paid</option>
                      <option value={PaymentStatus.PAID}>Paid</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Next Appointment</label>
                    <input 
                      type="date" 
                      value={edited.nextVisitDate}
                      onChange={(e) => setEdited({...edited, nextVisitDate: e.target.value})}
                      className="w-full p-2 border rounded-lg text-sm bg-slate-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Doctor Assigned</label>
                    <div className="p-2 bg-slate-100 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700">{edited.doctorName}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block tracking-wider">Doctor Clinical Notes</label>
                <textarea 
                  rows={4}
                  value={edited.doctorNotes}
                  onChange={(e) => setEdited({...edited, doctorNotes: e.target.value})}
                  className="w-full p-4 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Summarize the patient's condition, diagnosis, and prescription..."
                />
                
                <div className="mt-6 p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-blue-800">WhatsApp Follow-up Message</h4>
                    <button 
                      onClick={handleGenerateAI} 
                      disabled={isGeneratingMsg} 
                      className="text-xs font-bold text-blue-600 flex items-center gap-1.5 hover:text-blue-700 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> AI Suggestion
                    </button>
                  </div>
                  <textarea 
                    value={edited.internalMessage}
                    onChange={(e) => setEdited({...edited, internalMessage: e.target.value})}
                    className="w-full p-4 text-sm bg-white border border-blue-100 rounded-xl italic text-slate-600 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    placeholder="Auto-generated message appears here..."
                  />
                  <button 
                    onClick={sendWhatsApp} 
                    className="w-full mt-4 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]"
                  >
                    Open WhatsApp & Send
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {edited.history.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 text-slate-400 italic">
                  <History className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  No previous visits recorded for this patient.
                </div>
              ) : (
                edited.history.map((visit, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden hover:border-slate-300 transition-all">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-slate-900 font-bold">
                        <Clock className="w-4 h-4 text-blue-500" />
                        {new Date(visit.timestamp).toLocaleDateString()}
                        <span className="text-slate-400 font-normal ml-1">
                          at {new Date(visit.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${visit.paymentStatus === PaymentStatus.PAID ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                        {visit.paymentStatus}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Doctor's Record ({visit.doctorName}):</div>
                      <div className="leading-relaxed">
                        {visit.doctorNotes || 'No notes saved for this visit.'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
