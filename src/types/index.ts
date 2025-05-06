// User-related types
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  position: string;
  department: string; // Primary clinic assignment
  profileImageUrl?: string;
  createdAt: string;
  isActive: boolean;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

// Clinic-related types
export interface Clinic {
  id: string;
  name: string;
  description?: string;
  head?: string; // ID of the clinic head
  requiresWeekendCoverage: boolean;
  requiresHolidayCoverage: boolean;
  defaultShiftDuration: number; // in hours
  createdAt: string;
  isActive: boolean;
}

// Room (duty position) related types
export interface Room {
  id: string;
  name: string;
  clinicId: string;
  description?: string;
  isEmergency: boolean; // Whether this is an emergency position
  seniorityRequired?: string; // Level of seniority required (e.g., "Resident", "Specialist")
  createdAt: string;
  isActive: boolean;
}

// Shift-related types
export interface Shift {
  id: string;
  roomId: string;
  userId: string;
  startDate: string;
  endDate: string;
  isEmergency: boolean;
  status: ShiftStatus;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export enum ShiftStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// Request-related types
export interface Request {
  id: string;
  userId: string;
  type: RequestType;
  status: RequestStatus;
  startDate: string;
  endDate: string;
  reason?: string;
  swapWithUserId?: string;
  swapShiftId?: string;
  createdAt: string;
  updatedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export enum RequestType {
  LEAVE = 'LEAVE',
  SWAP = 'SWAP',
  PREFERENCE = 'PREFERENCE',
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

// Notification-related types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  relatedItemId?: string;
  relatedItemType?: string;
}

export enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}