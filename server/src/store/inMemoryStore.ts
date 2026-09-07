/**
 * In-Memory Store for VIZ India Digital Expo
 * Completely clean store — All dummy brands, deals, meetings, and leads removed.
 */

export const initialBrands: any[] = [];
export const initialLeads: any[] = [];
export const initialMeetings: any[] = [];
export const initialDeals: any[] = [];
export const initialKnowledgeBases: any[] = [];
export const initialInvestorProfiles: any[] = [];

import bcrypt from 'bcryptjs';

export const DEFAULT_DEMO_PASSWORD = 'Password123';
const DEFAULT_HASH = bcrypt.hashSync(DEFAULT_DEMO_PASSWORD, 10);

// Base user accounts for testing login/personas
export const initialUsers: any[] = [
  {
    _id: '65e100000000000000000001',
    name: 'Rohit Sharma (Investor)',
    email: 'rohit.sharma@gmail.com',
    phone: '+91 98888 12345',
    role: 'INVESTOR',
    passwordHash: DEFAULT_HASH,
    isPhoneVerified: true,
    isEmailVerified: true,
  },
  {
    _id: '65e100000000000000000002',
    name: 'Brand Admin',
    email: 'franchise@brand.in',
    phone: '+91 98111 22334',
    role: 'BRAND_ADMIN',
    passwordHash: DEFAULT_HASH,
    isPhoneVerified: true,
    isEmailVerified: true,
  },
  {
    _id: '65e100000000000000000003',
    name: 'VIZ Operational Admin',
    email: 'admin@vizexpo.in',
    phone: '+91 99999 00000',
    role: 'VIZ_ADMIN',
    passwordHash: DEFAULT_HASH,
    isPhoneVerified: true,
    isEmailVerified: true,
  },
];

class MemoryStore {
  brands: any[] = [...initialBrands];
  users: any[] = [...initialUsers];
  investorProfiles: any[] = [...initialInvestorProfiles];
  knowledgeBases: any[] = [...initialKnowledgeBases];
  leads: any[] = [...initialLeads];
  meetings: any[] = [...initialMeetings];
  deals: any[] = [...initialDeals];

  // Helper method to clear all data
  clearAll() {
    this.brands = [];
    this.knowledgeBases = [];
    this.leads = [];
    this.meetings = [];
    this.deals = [];
    this.investorProfiles = [];
  }
}

export const inMemoryStore = new MemoryStore();
