
export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other'
}

export enum VisitStatus {
  VISITED = 'Visited',
  NOT_VISITED = 'Not Visited'
}

export enum PaymentStatus {
  PAID = 'Paid',
  NOT_PAID = 'Not Paid'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR'
}

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
}

export interface Visit {
  timestamp: string;
  doctorName: string;
  doctorNotes: string;
  visitStatus: VisitStatus;
  paymentStatus: PaymentStatus;
  consultationFee: number;
}

export interface Patient {
  id: string; 
  name: string;
  gender: Gender;
  whatsAppNumber: string;
  dob: string;
  address: string;
  timestamp: string;
  initialConsultingFees: string; 
  doctorName: string;
  visitStatus: VisitStatus;
  visitDate: string;
  consultationFee: number;
  paymentStatus: PaymentStatus;
  doctorNotes: string;
  nextVisitDate: string;
  internalMessage: string;
  history: Visit[];
}

export type ViewType = 'DASHBOARD' | 'LIST' | 'PROFILE' | 'HISTORY' | 'LOGIN';

export interface DashboardStats {
  totalThisMonth: number;
  visitedCount: number;
  notVisitedCount: number;
  feesPaid: number;
  feesPending: number;
  totalUniquePatients: number;
}
