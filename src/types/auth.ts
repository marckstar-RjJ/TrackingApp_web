export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  CUSTOMER = 'CUSTOMER'
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  password?: string;
}

export interface CustomerUser extends User {
  role: UserRole.CUSTOMER;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  company?: string;
  taxId?: string;
}

export interface StaffUser extends User {
  role: UserRole.STAFF | UserRole.ADMIN;
  department: string;
  position: string;
  employeeId: string;
  permissions: string[];
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  status: string;
  origin: string;
  destination: string;
  customerId: string;
  history: Array<{
    timestamp: string;
    location: string;
    status: string;
    details?: {
      notes?: string;
      issues?: string;
      receivedFrom?: string;
      dispatchedTo?: string;
      packageCondition?: 'Bueno' | 'Regular' | 'Malo';
      contentVerified?: boolean;
      weightVerified?: boolean;
      dimensionsVerified?: boolean;
      securityCheck?: boolean;
      customsCheck?: boolean;
      specialHandling?: boolean;
      specialHandlingNotes?: string;
    };
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  fullName: string;
}

export interface ReturnRequest {
  id: string;
  trackingNumber: string;
  userId: string;
  reason: string;
  status: 'Pendiente' | 'Aceptado' | 'Rechazado';
  requestDate: string;
}

export interface ShipmentRequest {
  id: string;
  customerId: string;
  senderName: string;
  senderAddress: string;
  recipientName: string;
  recipientAddress: string;
  packageType: string;
  weightKg: number;
  dimensionsCm: string;
  description: string;
  status: 'Pendiente' | 'Aceptado' | 'Rechazado';
  requestDate: string;
  trackingNumber?: string;
} 