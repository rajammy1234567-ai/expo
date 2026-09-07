import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { InvestorProfile } from '../models/InvestorProfile';
import { Brand } from '../models/Brand';
import { BrandKnowledgeBase } from '../models/BrandKnowledgeBase';
import { Lead } from '../models/Lead';
import { Meeting } from '../models/Meeting';
import { DealCommission } from '../models/DealCommission';

dotenv.config();

export async function runSeed() {
  console.log('🌱 Starting VIZ India Digital Expo Database Seeder...');

  // Clear existing collections
  await User.deleteMany({});
  await InvestorProfile.deleteMany({});
  await Brand.deleteMany({});
  await BrandKnowledgeBase.deleteMany({});
  await Lead.deleteMany({});
  await Meeting.deleteMany({});
  await DealCommission.deleteMany({});

  // 1. Create Brands
  const brandsData = [
    {
      slug: 'burger-blast',
      brandName: 'Burger Blast',
      tagline: 'India’s Fastest Growing Gourmet Smash Burger Franchise',
      description: 'Burger Blast delivers chef-crafted gourmet burgers, loaded fries, and signature shakes with automated cloud-assisted kitchen operations and 65%+ gross margins.',
      category: 'Food',
      subCategories: ['QSR', 'Fast Food', 'Burgers', 'Cafe'],
      logoUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300&h=300&fit=crop&crop=faces',
      bannerUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&h=600&fit=crop',
      pitchVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-preparing-a-tasty-burger-41132-large.mp4',
      galleryUrls: [
        'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&fit=crop',
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&fit=crop',
        'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800&fit=crop',
      ],
      brochurePdfUrl: 'https://vizexpo.in/brochures/burger-blast-investor-dossier-2026.pdf',
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(),
      isFeatured: true,
      featuredRank: 1,
      investmentRange: {
        minINR: 3000000,
        maxINR: 4000000,
        displayString: '₹30L – ₹40L',
      },
      franchiseFeeINR: 500000,
      royaltyPercentage: 5,
      requiredAreaSqFt: {
        min: 800,
        max: 1200,
        displayString: '800 – 1200 sq.ft.',
      },
      businessModel: 'FOFO' as const,
      estimatedROIHistoricalMonths: {
        min: 12,
        max: 18,
        disclaimer: 'Based on historical figures provided by brand. Actual results depend on location and management.',
      },
      targetExpansionCities: ['Chandigarh', 'Delhi NCR', 'Mohali', 'Ludhiana', 'Jaipur', 'Bangalore', 'Pune'],
      existingOutletsCount: 42,
      yearEstablished: 2019,
      supportOffered: {
        siteSelection: true,
        staffTraining: true,
        marketingSupport: true,
        interiorSetup: true,
        rawMaterialSupply: true,
        softwareBillingPOS: true,
      },
      subscription: {
        tier: 'PREMIUM_BOOTH' as const,
        startDate: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        agreedSuccessFeePercentage: 3.0,
        isActive: true,
      },
      aiBotSettings: {
        isEnabled: true,
        botName: 'BlastBot AI',
        welcomeMessage: 'Namaste! Main Burger Blast ka official AI assistant hoon. Franchise cost, FOFO model, ya location availability ke baare mein kuch bhi puchein!',
      },
    },
    {
      slug: 'chai-shai-express',
      brandName: 'Chai Shai Express',
      tagline: 'Authentic Kulhad Chai & Desi Snacks Cafe Chain',
      description: 'High-margin, low-capex desi tea cafe concept offering 20+ varieties of hand-brewed kulhad chai, bun maska, and street delicacies.',
      category: 'Food',
      subCategories: ['Cafe', 'Beverages', 'Tea & Coffee'],
      logoUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=300&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=1200&h=600&fit=crop',
      pitchVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-hot-tea-in-a-cup-43180-large.mp4',
      galleryUrls: [
        'https://images.unsplash.com/photo-1561047029-3000c68339ca?w=800&fit=crop',
        'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=800&fit=crop',
      ],
      brochurePdfUrl: 'https://vizexpo.in/brochures/chai-shai-franchise.pdf',
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(),
      isFeatured: true,
      featuredRank: 2,
      investmentRange: {
        minINR: 1000000,
        maxINR: 1800000,
        displayString: '₹10L – ₹18L',
      },
      franchiseFeeINR: 300000,
      royaltyPercentage: 4,
      requiredAreaSqFt: {
        min: 300,
        max: 600,
        displayString: '300 – 600 sq.ft.',
      },
      businessModel: 'FOFO' as const,
      estimatedROIHistoricalMonths: {
        min: 9,
        max: 14,
        disclaimer: 'Based on brand estimates. Actual performance varies with footfall and operational efficiency.',
      },
      targetExpansionCities: ['Chandigarh', 'Amritsar', 'Dehradun', 'Indore', 'Bhopal', 'Lucknow'],
      existingOutletsCount: 85,
      yearEstablished: 2017,
      supportOffered: {
        siteSelection: true,
        staffTraining: true,
        marketingSupport: true,
        interiorSetup: true,
        rawMaterialSupply: true,
        softwareBillingPOS: true,
      },
      subscription: {
        tier: 'FEATURED' as const,
        startDate: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        agreedSuccessFeePercentage: 3.0,
        isActive: true,
      },
      aiBotSettings: {
        isEnabled: true,
        botName: 'Chai Mitra AI',
        welcomeMessage: 'Hello! Chai Shai Express ke quick-payback format ke bare me janne ke liye mujhse puchein.',
      },
    },
    {
      slug: 'kidzone-preschool',
      brandName: 'KidZone Early Learning Academy',
      tagline: 'Premium STEM-Integrated Pre-School & Daycare Chain',
      description: 'Award-winning early childhood curriculum designed for holistic child development with smart interactive classrooms and high parental retention.',
      category: 'Education',
      subCategories: ['Pre-School', 'Daycare', 'Child Education'],
      logoUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=300&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=1200&h=600&fit=crop',
      pitchVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-kids-playing-in-a-kindergarten-room-41908-large.mp4',
      galleryUrls: [
        'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&fit=crop',
        'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&fit=crop',
      ],
      brochurePdfUrl: 'https://vizexpo.in/brochures/kidzone-franchise.pdf',
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(),
      isFeatured: true,
      featuredRank: 3,
      investmentRange: {
        minINR: 3500000,
        maxINR: 6000000,
        displayString: '₹35L – ₹60L',
      },
      franchiseFeeINR: 600000,
      royaltyPercentage: 8,
      requiredAreaSqFt: {
        min: 2500,
        max: 4000,
        displayString: '2500 – 4000 sq.ft.',
      },
      businessModel: 'FOFO' as const,
      estimatedROIHistoricalMonths: {
        min: 18,
        max: 24,
        disclaimer: 'Admissions and revenue depend on local demographic and admission cycles.',
      },
      targetExpansionCities: ['Chandigarh', 'Gurgaon', 'Noida', 'Ludhiana', 'Ahmedabad'],
      existingOutletsCount: 28,
      yearEstablished: 2016,
      supportOffered: {
        siteSelection: true,
        staffTraining: true,
        marketingSupport: true,
        interiorSetup: true,
        rawMaterialSupply: true,
        softwareBillingPOS: true,
      },
      subscription: {
        tier: 'FEATURED' as const,
        startDate: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        agreedSuccessFeePercentage: 3.0,
        isActive: true,
      },
      aiBotSettings: {
        isEnabled: true,
        botName: 'KidZone Advisor AI',
        welcomeMessage: 'Namaste! KidZone curriculum, fee structure aur territory exclusivity ke bare mein jankari payen.',
      },
    },
    {
      slug: 'voltcharge-ev-hub',
      brandName: 'VoltCharge EV Charging Station',
      tagline: 'High-Yield Commercial EV Fast-Charging Infrastructure',
      description: 'Turnkey FOCO/FOFO EV charging hubs along highways and commercial plazas with 100% automated billing and zero day-to-day staff hassle.',
      category: 'EV',
      subCategories: ['CleanTech', 'Electric Mobility', 'Automated Hub'],
      logoUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=300&h=300&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1558441719-7561f5c6b453?w=1200&h=600&fit=crop',
      pitchVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-car-charging-at-an-electric-station-43093-large.mp4',
      galleryUrls: [
        'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&fit=crop',
      ],
      brochurePdfUrl: 'https://vizexpo.in/brochures/voltcharge-ev.pdf',
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(),
      isFeatured: true,
      featuredRank: 4,
      investmentRange: {
        minINR: 2000000,
        maxINR: 3500000,
        displayString: '₹20L – ₹35L',
      },
      franchiseFeeINR: 400000,
      royaltyPercentage: 10,
      requiredAreaSqFt: {
        min: 600,
        max: 1200,
        displayString: '600 – 1200 sq.ft.',
      },
      businessModel: 'FOCO' as const,
      estimatedROIHistoricalMonths: {
        min: 15,
        max: 22,
        disclaimer: 'Utilization rates depend on highway/city vehicle density.',
      },
      targetExpansionCities: ['Chandigarh', 'Delhi-Amritsar Highway', 'Jaipur', 'Mumbai-Pune Expressway'],
      existingOutletsCount: 54,
      yearEstablished: 2021,
      supportOffered: {
        siteSelection: true,
        staffTraining: false,
        marketingSupport: true,
        interiorSetup: true,
        rawMaterialSupply: true,
        softwareBillingPOS: true,
      },
      subscription: {
        tier: 'PREMIUM_BOOTH' as const,
        startDate: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        agreedSuccessFeePercentage: 3.0,
        isActive: true,
      },
      aiBotSettings: {
        isEnabled: true,
        botName: 'Volt AI Guide',
        welcomeMessage: 'Welcome to VoltCharge! Ask me how FOCO passive-income charging hubs work.',
      },
    },
    {
      slug: 'fitpulse-247-gym',
      brandName: 'FitPulse 24/7 Smart Gym',
      tagline: 'Tech-Driven 24-Hour Fitness Club Franchise',
      description: 'Biometric RFID access, state-of-the-art biomechanical equipment, and hybrid virtual coaching that minimizes front-desk overhead.',
      category: 'Fitness',
      subCategories: ['Gym', 'Wellness', 'CrossFit'],
      logoUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=300&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1200&h=600&fit=crop',
      pitchVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-training-at-a-gym-41380-large.mp4',
      galleryUrls: [
        'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&fit=crop',
      ],
      brochurePdfUrl: 'https://vizexpo.in/brochures/fitpulse-gym.pdf',
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(),
      isFeatured: false,
      featuredRank: 5,
      investmentRange: {
        minINR: 4500000,
        maxINR: 8000000,
        displayString: '₹45L – ₹80L',
      },
      franchiseFeeINR: 800000,
      royaltyPercentage: 6,
      requiredAreaSqFt: {
        min: 3000,
        max: 5000,
        displayString: '3000 – 5000 sq.ft.',
      },
      businessModel: 'FOFO' as const,
      estimatedROIHistoricalMonths: {
        min: 14,
        max: 20,
        disclaimer: 'Membership presales and active renewal ratios determine actual ROI.',
      },
      targetExpansionCities: ['Chandigarh', 'Mohali', 'Panchkula', 'Zirakpur', 'Patiala', 'Delhi'],
      existingOutletsCount: 19,
      yearEstablished: 2020,
      supportOffered: {
        siteSelection: true,
        staffTraining: true,
        marketingSupport: true,
        interiorSetup: true,
        rawMaterialSupply: false,
        softwareBillingPOS: true,
      },
      subscription: {
        tier: 'BASIC' as const,
        startDate: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        agreedSuccessFeePercentage: 3.0,
        isActive: true,
      },
      aiBotSettings: {
        isEnabled: true,
        botName: 'Pulse AI',
        welcomeMessage: 'Hi! Learn about FitPulse gym equipment leasing, setup cost, and membership revenue models.',
      },
    },
    {
      slug: 'glowup-luxury-salon',
      brandName: 'GlowUp Salon & Aesthetic Spa',
      tagline: 'High-Ticket Hair, Skin & Bridal Salon Chain',
      description: 'Luxury salon chain offering premium hair styling, clinical aesthetic treatments, and bridal studio services.',
      category: 'Beauty',
      subCategories: ['Salon', 'Spa', 'Aesthetics'],
      logoUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300&h=300&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&h=600&fit=crop',
      pitchVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hairdresser-styling-hair-for-a-woman-42099-large.mp4',
      galleryUrls: [
        'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&fit=crop',
      ],
      brochurePdfUrl: 'https://vizexpo.in/brochures/glowup-salon.pdf',
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(),
      isFeatured: false,
      featuredRank: 6,
      investmentRange: {
        minINR: 2500000,
        maxINR: 4500000,
        displayString: '₹25L – ₹45L',
      },
      franchiseFeeINR: 500000,
      royaltyPercentage: 7,
      requiredAreaSqFt: {
        min: 1200,
        max: 1800,
        displayString: '1200 – 1800 sq.ft.',
      },
      businessModel: 'FOFO' as const,
      estimatedROIHistoricalMonths: {
        min: 12,
        max: 16,
        disclaimer: 'Based on average ticket size and stylist utilization rates.',
      },
      targetExpansionCities: ['Chandigarh', 'Ludhiana', 'Jalandhar', 'Shimla', 'Jaipur'],
      existingOutletsCount: 15,
      yearEstablished: 2018,
      supportOffered: {
        siteSelection: true,
        staffTraining: true,
        marketingSupport: true,
        interiorSetup: true,
        rawMaterialSupply: true,
        softwareBillingPOS: true,
      },
      subscription: {
        tier: 'BASIC' as const,
        startDate: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        agreedSuccessFeePercentage: 3.0,
        isActive: true,
      },
      aiBotSettings: {
        isEnabled: true,
        botName: 'Glow AI',
        welcomeMessage: 'Hello! Discover franchise packages, staff recruitment support, and profit margins at GlowUp.',
      },
    },
  ];

  const savedBrands = await Brand.insertMany(brandsData);
  console.log(`✅ Seeded ${savedBrands.length} Verified Brands.`);

  // 2. Populate Knowledge Base chunks for Brand AI
  const burgerBlast = savedBrands.find((b) => b.slug === 'burger-blast')!;
  const kbChunks = [
    {
      brandId: burgerBlast._id,
      sourceType: 'FINANCIAL_BREAKUP' as const,
      title: 'Total Investment & Fee Breakup',
      question: 'Is franchise ka total investment kitna hai?',
      answer: 'Brand-provided information ke according total estimated investment ₹30–40 lakh hai. Isme ₹5 Lakh franchise fee, ₹18–22 Lakh kitchen machinery & automated griddles, aur ₹8–12 Lakh modern interior fit-out shamil hai.',
      content: 'Total capital requirement ₹30-40 Lakh for 800-1200 sqft outlet under FOFO format.',
      isApprovedByBrand: true,
      isApprovedByAdmin: true,
    },
    {
      brandId: burgerBlast._id,
      sourceType: 'EXPANSION_RULES' as const,
      title: 'City Availability & Territories',
      question: 'Chandigarh mein available hai?',
      answer: 'Brand ke current expansion data ke according Chandigarh, Mohali aur Panchkula high-priority expansion zones hain aur prime commercial locations ke liye applications open hain.',
      content: 'Targeting North India Tier-1 & Tier-2 cities with territory exclusivity radius of 3km.',
      isApprovedByBrand: true,
      isApprovedByAdmin: true,
    },
    {
      brandId: burgerBlast._id,
      sourceType: 'FAQ_MANUAL' as const,
      title: 'Historical Payback & Operational Returns',
      question: 'Franchise ka ROI kitna hai?',
      answer: 'Brand-provided historical/estimated figures ke according expected payback period 12–18 months hai. Actual results location, local footfall aur operational management par depend karte hain. No guaranteed returns.',
      content: 'Typical breakeven happens in 12-18 months based on past performance across 40+ operational outlets.',
      isApprovedByBrand: true,
      isApprovedByAdmin: true,
    },
  ];
  await BrandKnowledgeBase.insertMany(kbChunks);
  console.log(`✅ Seeded Knowledge Base Chunks for Burger Blast AI.`);

  // 3. Create Users
  const investorUser = new User({
    name: 'Rohit Sharma',
    email: 'rohit.sharma@gmail.com',
    phone: '+91 98888 12345',
    role: 'INVESTOR',
    isPhoneVerified: true,
    isEmailVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=faces',
  });
  await investorUser.save();

  const investorProfile = new InvestorProfile({
    userId: investorUser._id,
    city: 'Chandigarh',
    state: 'Punjab',
    tier: 'TIER_2',
    investmentBudget: {
      minINR: 2500000,
      maxINR: 5000000,
      bracket: '25L_50L',
    },
    preferredCategories: ['Food', 'EV', 'Retail'],
    franchiseModelPreference: ['FOFO'],
    businessExperienceYears: 4,
    availableCommercialSpaceSqFt: 1000,
    hasOwnProperty: false,
    expectedPaybackMonths: 18,
    savedBrandIds: [burgerBlast._id],
    subscription: {
      plan: 'FREE',
      directMeetingCreditsRemaining: 5,
      aiQueryCreditsRemaining: 50,
    },
  });
  await investorProfile.save();
  investorUser.investorProfileId = investorProfile._id;
  await investorUser.save();

  // Brand Manager User
  const brandAdminUser = new User({
    name: 'Vikram Sethi (Brand Head)',
    email: 'franchise@burgerblast.in',
    phone: '+91 98111 22334',
    role: 'BRAND_ADMIN',
    brandId: burgerBlast._id,
    isPhoneVerified: true,
    isEmailVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&h=150&fit=crop&crop=faces',
  });
  await brandAdminUser.save();

  // VIZ Super Admin User
  const vizAdminUser = new User({
    name: 'VIZ Operational Admin',
    email: 'admin@vizexpo.in',
    phone: '+91 99999 00000',
    role: 'VIZ_ADMIN',
    isPhoneVerified: true,
    isEmailVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces',
  });
  await vizAdminUser.save();
  console.log(`✅ Seeded 3 Core Users: Rohit Sharma (Investor), Vikram Sethi (Brand Admin), VIZ Admin.`);

  // 4. Create Leads & Pipeline
  const lead1 = new Lead({
    investorId: investorUser._id,
    investorProfileId: investorProfile._id,
    brandId: burgerBlast._id,
    source: 'BOOTH_DISCOVERY',
    status: 'MEETING_SCHEDULED',
    investorSnapshot: {
      name: 'Rohit Sharma',
      phone: '+91 98888 12345',
      email: 'rohit.sharma@gmail.com',
      city: 'Chandigarh',
      budgetBracket: '₹25L – ₹50L',
      experienceYears: 4,
    },
    brandInternalNotes: ['High intent franchisee from Sector 35 Chandigarh. Ready space available.'],
    dealValueEstimatedINR: 3500000,
    stageHistory: [
      { stage: 'NEW', updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), note: 'Discovered booth on Expo Floor' },
      { stage: 'CONTACTED', updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), note: 'Engaged with Brand AI Assistant' },
      { stage: 'MEETING_SCHEDULED', updatedAt: new Date(), note: 'Confirmed 30min discovery video call' },
    ],
  });
  await lead1.save();

  // 5. Create Meeting
  const meeting1 = new Meeting({
    leadId: lead1._id,
    investorId: investorUser._id,
    brandId: burgerBlast._id,
    scheduledStartTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    scheduledEndTime: new Date(Date.now() + 2.5 * 60 * 60 * 1000),
    meetingType: 'VIDEO_CALL',
    status: 'ACCEPTED',
    meetingRoomUrl: 'https://meet.vizexpo.in/room-bb-chandigarh-982',
    notesFromInvestor: 'Want to finalize unit economics and exclusive territorial rights for Chandigarh.',
  });
  await meeting1.save();

  // 6. Create Deals & Commission Ledgers (VIZ 3% Success Fee)
  const deal1 = new DealCommission({
    dealNumber: 'VIZ-DEAL-2026-0001',
    leadId: lead1._id,
    brandId: burgerBlast._id,
    investorId: investorUser._id,
    franchiseCity: 'Chandigarh',
    franchiseUnitModel: 'FOFO',
    totalDealValueINR: 3000000, // ₹30 Lakh
    commissionRatePercentage: 3.0,
    calculatedCommissionINR: 90000, // ₹90,000
    taxINR: 16200, // 18% GST = ₹16,200
    totalInvoiceAmountINR: 106200, // ₹1,06,200
    status: 'RECEIVED_SETTLED',
    invoiceNumber: 'VIZ-INV-2026-0001',
    paymentReferenceNo: 'HDFC-RTGS-99281726',
    settledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    brandNotes: 'Franchise agreement signed for Sector 35 Chandigarh outlet.',
    adminNotes: '3% VIZ success fee verified and settled into VIZ bank account.',
  });

  const deal2 = new DealCommission({
    dealNumber: 'VIZ-DEAL-2026-0002',
    brandId: savedBrands.find((b) => b.slug === 'voltcharge-ev-hub')!._id,
    investorId: investorUser._id,
    franchiseCity: 'Mohali',
    franchiseUnitModel: 'FOCO',
    totalDealValueINR: 2500000, // ₹25 Lakh
    commissionRatePercentage: 3.0,
    calculatedCommissionINR: 75000,
    taxINR: 13500,
    totalInvoiceAmountINR: 88500,
    status: 'INVOICED',
    invoiceNumber: 'VIZ-INV-2026-0002',
    brandNotes: 'Dual-gun 60kW DC EV fast charging station agreement in Mohali.',
  });

  await deal1.save();
  await deal2.save();
  console.log(`✅ Seeded Closed Deals & VIZ 3% Commission Ledger.`);

  console.log('🎉 VIZ India Digital Expo Database successfully populated!');
}

if (require.main === module) {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/viz_digital_expo';
  mongoose
    .connect(uri)
    .then(async () => {
      await runSeed();
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed Error:', err);
      process.exit(1);
    });
}
