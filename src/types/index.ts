export interface Tenant {
  id: string;
  name: string;
  country: string;
  department: string;
  settings: TenantSettings;
}

export interface TenantSettings {
  currency: string;
  language: string;
  timezone: string;
}

export interface TrackingInfo {
  id: string;
  trackingNumber: string;
  tenantId: string;
  status: TrackingStatus;
  currentLocation: Location;
  history: TrackingHistory[];
  estimatedDelivery: Date;
  actualDelivery?: Date;
}

export interface Location {
  country: string;
  city: string;
  facility: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface TrackingHistory {
  timestamp: Date;
  status: TrackingStatus;
  location: Location;
  description: string;
}

export enum TrackingStatus {
  REGISTERED = 'REGISTERED',
  IN_TRANSIT = 'IN_TRANSIT',
  ARRIVED_AT_FACILITY = 'ARRIVED_AT_FACILITY',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  RETURNED = 'RETURNED',
  EXCEPTION = 'EXCEPTION'
}

export interface User {
  id: string;
  tenantId: string;
  email: string;
  role: UserRole;
  preferences: UserPreferences;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  OPERATOR = 'OPERATOR',
  CUSTOMER = 'CUSTOMER'
}

export interface UserPreferences {
  language: string;
  notifications: boolean;
  theme: 'light' | 'dark';
} 