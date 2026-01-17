
import { Patient, Gender, VisitStatus, PaymentStatus } from './types';

export const FIXED_CONSULTATION_FEE = 300;

export const MOCK_PATIENTS: Patient[] = [
  {
    timestamp: new Date().toISOString(),
    name: 'Rahul Sharma',
    gender: Gender.MALE,
    whatsAppNumber: '919876543210',
    dob: '1990-05-15',
    address: 'Sector 42, Mumbai, India',
    initialConsultingFees: 'Paid',
    doctorName: 'Dr. Smith',
    id: 'P-1001',
    visitStatus: VisitStatus.VISITED,
    visitDate: '2024-05-10',
    consultationFee: 300,
    paymentStatus: PaymentStatus.PAID,
    doctorNotes: 'Common cold and mild fever. Prescribed Paracetamol.',
    nextVisitDate: '2024-05-17',
    internalMessage: 'Your follow up is scheduled for next week. Please carry previous reports.',
    // Fixed: Added missing history property
    history: []
  },
  {
    timestamp: new Date().toISOString(),
    name: 'Priya Verma',
    gender: Gender.FEMALE,
    whatsAppNumber: '918765432109',
    dob: '1985-11-20',
    address: 'Andheri West, Mumbai',
    initialConsultingFees: 'Not Paid',
    doctorName: 'Not Assigned',
    id: 'P-1002',
    visitStatus: VisitStatus.NOT_VISITED,
    visitDate: '',
    consultationFee: 300,
    paymentStatus: PaymentStatus.NOT_PAID,
    doctorNotes: '',
    nextVisitDate: '',
    internalMessage: '',
    // Fixed: Added missing history property
    history: []
  },
  {
    timestamp: new Date().toISOString(),
    name: 'Amit Patel',
    gender: Gender.MALE,
    whatsAppNumber: '917654321098',
    dob: '1978-02-10',
    address: 'Bandra East, Mumbai',
    initialConsultingFees: 'Paid',
    doctorName: 'Dr. Smith',
    id: 'P-1003',
    visitStatus: VisitStatus.VISITED,
    visitDate: '2024-05-12',
    consultationFee: 300,
    paymentStatus: PaymentStatus.PAID,
    doctorNotes: 'Chronic back pain. Recommended physiotherapy.',
    nextVisitDate: '2024-06-12',
    internalMessage: 'How is your back pain now? Don\'t forget the exercises.',
    // Fixed: Added missing history property
    history: []
  }
];
