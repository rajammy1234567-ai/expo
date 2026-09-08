/**
 * In-Memory Store for VIZ India Digital Expo
 * Includes clean scoped data for Investor (Rohit Sharma), Brand Admin (Chai Shai Express), and VIZ Admin.
 */
import bcrypt from 'bcryptjs';

export const DEFAULT_DEMO_PASSWORD = 'Password123';
const DEFAULT_HASH = bcrypt.hashSync(DEFAULT_DEMO_PASSWORD, 10);

export const initialBrands: any[] = [
  {
    _id: '65e000000000000000000001',
    ownerUserId: '65e100000000000000000002',
    slug: 'chai-shai-express',
    brandName: 'Chai Shai Express',
    tagline: 'India’s Authentic Desi Kulhad Chai & Quick Bites Franchise',
    description: 'Serving authentic brewed tea, bun maska, and hot samosas with rapid 4-minute customer turnaround and high daily footfall.',
    category: 'Food',
    subCategories: ['Tea Cafe', 'QSR', 'Beverages'],
    logoUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=300&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=1200&h=600&fit=crop',
    pitchVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-preparing-a-tasty-burger-41132-large.mp4',
    galleryUrls: [
      'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&fit=crop',
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&fit=crop',
    ],
    brochurePdfUrl: 'https://vizexpo.in/brochures/chai-shai-express-dossier-2026.pdf',
    verificationStatus: 'VERIFIED',
    verifiedAt: new Date().toISOString(),
    isFeatured: true,
    featuredRank: 1,
    investmentRange: {
      minINR: 800000,
      maxINR: 1500000,
      displayString: '₹8L – ₹15L',
    },
    franchiseFeeINR: 250000,
    royaltyPercentage: 4,
    requiredAreaSqFt: {
      min: 150,
      max: 400,
      displayString: '150 – 400 sq.ft.',
    },
    businessModel: 'FOFO',
    estimatedROIHistoricalMonths: {
      min: 9,
      max: 14,
      disclaimer: 'Based on existing company & franchise operational outlets.',
    },
    targetExpansionCities: ['Delhi NCR', 'Chandigarh', 'Jaipur', 'Lucknow', 'Indore'],
    existingOutletsCount: 18,
    yearEstablished: 2021,
    supportOffered: {
      siteSelection: true,
      staffTraining: true,
      marketingSupport: true,
      interiorSetup: true,
      rawMaterialSupply: true,
      softwareBillingPOS: true,
    },
    subscription: {
      tier: 'PREMIUM_BOOTH',
      startDate: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      agreedSuccessFeePercentage: 3.0,
      isActive: true,
    },
    aiBotSettings: {
      isEnabled: true,
      botName: 'Chai Shai Advisor AI',
      welcomeMessage: 'Namaste! Main Chai Shai Express ka AI Advisor hoon. Franchise investment, ROI aur territory availability ke baare mein kuch bhi poochiye.',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '65e000000000000000000002',
    slug: 'unverified-stealth-cafe',
    brandName: 'Stealth Cafe (Pending Verification)',
    tagline: 'Brand pending admin audit',
    description: 'Brand dossier submitted for VIZ verification review.',
    category: 'Food',
    subCategories: ['QSR'],
    logoUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=300&h=300&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&h=600&fit=crop',
    verificationStatus: 'PENDING',
    isFeatured: false,
    investmentRange: { minINR: 1000000, maxINR: 2000000, displayString: '₹10L – ₹20L' },
    franchiseFeeINR: 300000,
    royaltyPercentage: 5,
    businessModel: 'FOFO',
    createdAt: new Date().toISOString(),
  },
];

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
    brandId: '65e000000000000000000001',
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

export const initialInvestorProfiles: any[] = [
  {
    userId: '65e100000000000000000001',
    city: 'Chandigarh',
    state: 'Punjab',
    budgetBracket: '25L_50L',
    targetCategories: ['Food', 'EV'],
    businessModelPreferences: ['FOFO'],
    riskAppetite: 'MODERATE',
    activeInvestor: true,
  },
];

export const initialKnowledgeBases: any[] = [
  {
    _id: '65e600000000000000000001',
    brandId: '65e000000000000000000001',
    title: 'Franchise Fee & Royalty Structure',
    question: 'What is the one-time franchise fee and recurring royalty?',
    answer: 'The franchise fee is ₹2,500,000 + GST for a 5-year renewable agreement. The monthly royalty is 4% of net sales.',
    content: 'Chai Shai Express franchise fee is ₹2.5 Lakhs with a 4% royalty on gross billing. Complete cloud POS provided.',
    sourceType: 'FAQ_MANUAL',
    isApprovedByBrand: true,
    isApprovedByAdmin: true,
  },
];

export const initialLeads: any[] = [
  {
    _id: '65e300000000000000000001',
    investorId: initialUsers[0],
    brandId: initialBrands[0],
    source: 'BOOTH_DISCOVERY',
    status: 'NEW',
    investorSnapshot: {
      name: 'Rohit Sharma (Investor)',
      phone: '+91 98888 12345',
      email: 'rohit.sharma@gmail.com',
      city: 'Chandigarh',
      budgetBracket: '₹25L – ₹50L',
      experienceYears: 4,
    },
    brandInternalNotes: ['Interested in opening 2 outlets in Mohali and Panchkula.'],
    dealValueEstimatedINR: 1200000,
    stageHistory: [{ stage: 'NEW', updatedAt: new Date().toISOString(), note: 'Generated via Booth discovery' }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const initialMeetings: any[] = [
  {
    _id: '65e400000000000000000001',
    investorId: initialUsers[0],
    brandId: initialBrands[0],
    scheduledStartTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    scheduledEndTime: new Date(Date.now() + 24.5 * 60 * 60 * 1000).toISOString(),
    meetingType: 'VIDEO_CALL',
    status: 'ACCEPTED',
    meetingRoomUrl: 'https://meet.vizexpo.in/room-chai-shai-rohit',
    notesFromInvestor: 'Discuss territory exclusivity for Chandigarh Tricity.',
    createdAt: new Date().toISOString(),
  },
];

export const initialDeals: any[] = [
  {
    _id: '65e500000000000000000001',
    dealNumber: 'VIZ-DEAL-2026-0001',
    brandId: initialBrands[0],
    investorId: initialUsers[0],
    leadId: '65e300000000000000000001',
    franchiseCity: 'Chandigarh',
    franchiseUnitModel: 'FOFO',
    totalDealValueINR: 1200000,
    commissionRatePercentage: 3.0,
    calculatedCommissionINR: 36000,
    taxINR: 6480,
    totalInvoiceAmountINR: 42480,
    status: 'RECEIVED_SETTLED',
    invoiceNumber: 'VIZ-INV-2026-0001',
    settledAt: new Date().toISOString(),
    brandNotes: 'Initial unit for Sector 35 Chandigarh confirmed.',
    createdAt: new Date().toISOString(),
  },
];

export const initialConversations: any[] = [
  {
    _id: '65e600000000000000000001',
    participants: ['65e100000000000000000001', '65e100000000000000000002'], // Rohit Sharma & Vikramaditya (Chai Shai Express)
    relatedBrandId: '65e000000000000000000001',
    lastMessage: 'Namaste Rohit ji! We have prime locations available in Sector 35 Chandigarh.',
    lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
    unreadCount: {
      '65e100000000000000000001': 0,
      '65e100000000000000000002': 0,
    },
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

export const initialMessages: any[] = [
  {
    _id: '65e700000000000000000001',
    conversationId: '65e600000000000000000001',
    senderId: '65e100000000000000000001',
    receiverId: '65e100000000000000000002',
    text: 'Hello! I am Rohit, exploring Chai Shai Express franchise for Chandigarh Tricity with ₹50L budget.',
    status: 'SEEN',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    _id: '65e700000000000000000002',
    conversationId: '65e600000000000000000001',
    senderId: '65e100000000000000000002',
    receiverId: '65e100000000000000000001',
    text: 'Namaste Rohit ji! We have prime locations available in Sector 35 Chandigarh. Bun Maska & Kulhad Chai format requires 250-350 sq.ft.',
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&fit=crop',
    status: 'SEEN',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

export const initialNotifications: any[] = [
  {
    _id: '65e800000000000000000001',
    userId: '65e100000000000000000001', // Rohit Sharma
    type: 'MESSAGE',
    title: 'New Message from Chai Shai Express',
    body: 'Namaste Rohit ji! We have prime locations available in Sector 35...',
    relatedId: '65e600000000000000000001',
    deepLink: '/chats/65e600000000000000000001',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    _id: '65e800000000000000000002',
    userId: '65e100000000000000000002', // Brand Admin
    type: 'LEAD',
    title: 'New High-Intent Investor Lead',
    body: 'Rohit Sharma has requested a video discovery meeting for Chandigarh.',
    relatedId: '65e300000000000000000001',
    deepLink: '/brand-portal',
    isRead: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    _id: '65e800000000000000000003',
    userId: '65e100000000000000000003', // VIZ Admin
    type: 'DEAL',
    title: 'Closed Deal Pending Settlement',
    body: 'Chai Shai Express closed deal with Rohit Sharma (₹12.0L). 3% Success Fee: ₹42,480.',
    relatedId: '65e500000000000000000001',
    deepLink: '/admin-dashboard',
    isRead: false,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
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
  conversations: any[] = [...initialConversations];
  messages: any[] = [...initialMessages];
  notifications: any[] = [...initialNotifications];

  // Helper method to clear all data
  clearAll() {
    this.brands = [];
    this.knowledgeBases = [];
    this.leads = [];
    this.meetings = [];
    this.deals = [];
    this.investorProfiles = [];
    this.conversations = [];
    this.messages = [];
    this.notifications = [];
  }
}

export const inMemoryStore = new MemoryStore();

