export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type Gender = 'Male' | 'Female' | 'Other';

export interface User {
  id: string;
  fullName: string;
  email?: string;
  phone: string;
  bloodType: BloodType;
  dateOfBirth: string;
  gender: Gender;
  address: string;
  role: 'user' | 'admin';
  avatarUrl?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  description?: string;
  imageUrl?: string;
  hours: string;
  bloodInventory: Record<BloodType, number>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  location: string;
  hospitalId: string;
  hospital?: Hospital;
  imageUrl?: string;
  maxParticipants: number;
  registeredCount: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Donation {
  id: string;
  donationDate: string;
  hospital: string;
  bloodType: BloodType;
  quantityMl: number;
  status: 'pending' | 'completed' | 'rejected';
  event?: string;
  notes?: string;
}

export type ListingType = 'request' | 'offer';
export type UrgencyLevel = 'critical' | 'urgent' | 'normal';
export type TipCategory = 'before' | 'during' | 'after' | 'general';

export interface BloodMarketListing {
  id: string;
  type: ListingType;
  bloodType: BloodType;
  quantityMl: number;
  urgency: UrgencyLevel;
  location: string;
  contactPhone: string;
  description: string;
  status: 'open' | 'fulfilled' | 'expired';
  createdAt: string;
}

export interface Tip {
  id: string;
  title: string;
  content: string;
  category: TipCategory;
  icon: string;
  tips: string[];
}

export interface RegistrationFormData {
  fullName: string;
  phone: string;
  email?: string;
  bloodType: BloodType;
  gender: Gender;
  dateOfBirth: string;
  address: string;
}