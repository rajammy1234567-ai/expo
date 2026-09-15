export interface IBrand {
  _id: string;
  slug: string;
  brandName: string;
  tagline: string;
  description: string;
  category: string;
  subCategories: string[];
  logoUrl: string;
  bannerUrl: string;
  pitchVideoUrl: string;
  galleryUrls: string[];
  brochurePdfUrl: string;
  verificationStatus: 'PENDING' | 'UNDER_REVIEW' | 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED';
  verifiedAt?: string;
  isFeatured: boolean;
  featuredRank: number;
  investmentRange: {
    minINR: number;
    maxINR: number;
    displayString: string;
  };
  franchiseFeeINR: number;
  royaltyPercentage: number;
  requiredAreaSqFt: {
    min: number;
    max: number;
    displayString: string;
  };
  businessModel: 'FOFO' | 'FOCO' | 'COCO' | 'COFO';
  estimatedROIHistoricalMonths: {
    min: number;
    max: number;
    disclaimer: string;
  };
  targetExpansionCities: string[];
  existingOutletsCount: number;
  yearEstablished: number;
  supportOffered: {
    siteSelection: boolean;
    staffTraining: boolean;
    marketingSupport: boolean;
    interiorSetup: boolean;
    rawMaterialSupply: boolean;
    softwareBillingPOS: boolean;
  };
  subscription: {
    tier: 'BASIC' | 'FEATURED' | 'PREMIUM_BOOTH' | 'ENTERPRISE';
    agreedSuccessFeePercentage: number;
    isActive: boolean;
  };
  ownerUserId?: string;
  aiBotSettings?: {
    isEnabled: boolean;
    botName: string;
    welcomeMessage: string;
  };
}

export interface IKnowledgeBaseItem {
  _id: string;
  brandId: string;
  sourceType: string;
  title: string;
  question?: string;
  answer?: string;
  content: string;
  isApprovedByBrand: boolean;
  isApprovedByAdmin: boolean;
}

export interface ILead {
  _id: string;
  investorId: any;
  brandId: any;
  source: string;
  status:
    | 'NEW'
    | 'CONTACTED'
    | 'MEETING_SCHEDULED'
    | 'MEETING_COMPLETED'
    | 'NEGOTIATION'
    | 'DUE_DILIGENCE'
    | 'AGREEMENT_SIGNED'
    | 'CLOSED_WON'
    | 'CLOSED_LOST';
  investorSnapshot: {
    name: string;
    phone: string;
    email: string;
    city: string;
    budgetBracket: string;
    experienceYears: number;
  };
  investorName?: string;
  investorPhone?: string;
  preferredCity?: string;
  brandInternalNotes: string[];
  dealValueEstimatedINR?: number;
  closedDealValueINR?: number;
  stageHistory: {
    stage: string;
    updatedAt: string;
    note?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface IMeeting {
  _id: string;
  leadId?: string;
  investorId: any;
  brandId: any;
  scheduledStartTime: string;
  scheduledEndTime: string;
  meetingType: 'VIDEO_CALL' | 'AUDIO_CALL' | 'CHAT_SESSION' | 'PHYSICAL_MEETING';
  status: 'REQUESTED' | 'ACCEPTED' | 'REJECTED' | 'RESCHEDULED' | 'COMPLETED' | 'CANCELLED';
  meetingRoomUrl?: string;
  notesFromInvestor?: string;
  brandFeedback?: string;
  createdAt: string;
}

export interface IDealCommission {
  _id: string;
  dealNumber: string;
  leadId?: string;
  brandId: any;
  investorId: any;
  franchiseCity: string;
  franchiseUnitModel: 'FOFO' | 'FOCO' | 'COCO' | 'COFO';
  totalDealValueINR: number;
  commissionRatePercentage: number;
  calculatedCommissionINR: number;
  taxINR: number;
  gstAmountINR?: number;
  totalInvoiceAmountINR: number;
  status: 'PENDING_INVOICE' | 'INVOICE_SENT' | 'PENDING_VERIFICATION' | 'INVOICED' | 'PARTIALLY_PAID' | 'RECEIVED_SETTLED' | 'DISPUTED';
  invoiceNumber?: string;
  paymentReferenceNo?: string;
  bankSettlementRef?: string;
  settledAt?: string;
  brandNotes?: string;
  adminNotes?: string;
  createdAt: string;
}

export interface IUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  role: 'INVESTOR' | 'BRAND_ADMIN' | 'BRAND_MEMBER' | 'VIZ_ADMIN' | 'VIZ_SUPERADMIN';
  brandId?: string;
  profile?: any;
}
