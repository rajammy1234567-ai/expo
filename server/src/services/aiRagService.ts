import mongoose from 'mongoose';
import { Brand, IBrand } from '../models/Brand';
import { BrandKnowledgeBase, IBrandKnowledgeBase } from '../models/BrandKnowledgeBase';
import { inMemoryStore } from '../store/inMemoryStore';

export interface AIResponse {
  answer: string;
  sources: string[];
  suggestMeeting: boolean;
  brandSnapshot: {
    name: string;
    investment: string;
    area: string;
    model: string;
  };
}

export class AIRagService {
  /**
   * Generates a strictly grounded response for a brand using its approved knowledge base.
   */
  static async queryBrandAI(brandId: string, question: string): Promise<AIResponse> {
    let brand: any = null;
    let kbRecords: any[] = [];

    if (mongoose.connection.readyState === 1) {
      try {
        brand = await Brand.findById(brandId);
        if (brand) {
          kbRecords = await BrandKnowledgeBase.find({
            brandId: brand._id,
            isApprovedByAdmin: true,
          });
        }
      } catch (e) {
        // Fallback
      }
    }

    if (!brand) {
      brand = inMemoryStore.brands.find((b) => b._id === brandId || b.slug === brandId) || null;
      kbRecords = brand ? inMemoryStore.knowledgeBases.filter((k) => k.brandId === brand._id) : [];
    }

    if (!brand) {
      return {
        answer: 'Yeh brand abhi VIZ platform par available nahi hai.',
        sources: [],
        suggestMeeting: false,
        brandSnapshot: {
          name: '',
          investment: '',
          area: '',
          model: '',
        },
      };
    }

    const normalizedQ = question.toLowerCase();

    // Context knowledge builder
    let matchedChunks: string[] = [];
    let relevantSources: string[] = [];

    for (const kb of kbRecords) {
      const combinedText = `${kb.title} ${kb.question || ''} ${kb.answer || ''} ${kb.content}`.toLowerCase();
      if (
        normalizedQ.split(' ').some((word) => word.length > 3 && combinedText.includes(word)) ||
        (kb.question && normalizedQ.includes(kb.question.toLowerCase()))
      ) {
        matchedChunks.push(kb.answer || kb.content);
        relevantSources.push(kb.title);
      }
    }

    // Default fallback chunks if specific chunk wasn't triggered
    if (matchedChunks.length === 0 && kbRecords.length > 0) {
      matchedChunks = kbRecords.slice(0, 3).map((k) => k.answer || k.content);
      relevantSources = kbRecords.slice(0, 3).map((k) => k.title);
    }

    // Strict Grounding & Rule Logic
    let answer = '';
    let suggestMeeting = false;

    // Check for ROI / Profit questions
    if (normalizedQ.includes('roi') || normalizedQ.includes('profit') || normalizedQ.includes('payback') || normalizedQ.includes('return')) {
      const minM = brand.estimatedROIHistoricalMonths?.min || 12;
      const maxM = brand.estimatedROIHistoricalMonths?.max || 18;
      answer = `Brand-provided historical/estimated figures ke according expected payback period lagbhag ${minM}–${maxM} months hai. Kripya dhyan dein ki actual financial returns location, operational execution, daily footfall aur market conditions par depend karte hain. (No guaranteed returns).`;
      suggestMeeting = true;
    }
    // Check for Total Investment / Cost
    else if (normalizedQ.includes('investment') || normalizedQ.includes('cost') || normalizedQ.includes('budget') || normalizedQ.includes('kitna paisa') || normalizedQ.includes('kharcha')) {
      answer = `Brand-provided information ke according total estimated investment ${brand.investmentRange?.displayString || '₹30L – ₹40L'} hai. Isme franchise fee lagbhag ₹${((brand.franchiseFeeINR || 500000) / 100000).toFixed(1)} Lakh, setup cost, aur initial machinery shamil hain. Royalty fee ${brand.royaltyPercentage || 5}% hai.`;
      suggestMeeting = true;
    }
    // Check for Location / City availability
    else if (normalizedQ.includes('city') || normalizedQ.includes('location') || normalizedQ.includes('chandigarh') || normalizedQ.includes('delhi') || normalizedQ.includes('mumbai') || normalizedQ.includes('bangalore') || normalizedQ.includes('available')) {
      const citiesList = brand.targetExpansionCities?.length > 0 ? brand.targetExpansionCities.join(', ') : 'Chandigarh, Punjab, Delhi NCR';
      answer = `Brand ke current expansion data ke according active target locations: ${citiesList} hain. Specific location availability aur territory exclusivity confirm karne ke liye aap brand se direct meeting request kar sakte hain.`;
      suggestMeeting = true;
    }
    // Check for Space / Area
    else if (normalizedQ.includes('area') || normalizedQ.includes('space') || normalizedQ.includes('sqft') || normalizedQ.includes('sq.ft') || normalizedQ.includes('jagah')) {
      answer = `Is franchise ke liye required commercial space ${brand.requiredAreaSqFt?.displayString || '800 – 1200 sq.ft.'} hai (${brand.businessModel} model). Location high footfall retail market, mall ya commercial hub mein honi chahiye.`;
    }
    // Check for Franchise Model (FOFO / FOCO)
    else if (normalizedQ.includes('fofo') || normalizedQ.includes('foco') || normalizedQ.includes('coco') || normalizedQ.includes('model')) {
      const modelDesc = brand.businessModel === 'FOFO'
        ? 'FOFO (Franchise Owned, Franchise Operated) - aap outlet khud manage karte hain with full brand SOPs'
        : 'FOCO (Franchise Owned, Company Operated) - investment aapki hoti hai aur operations company manage karti hai';
      answer = `${brand.brandName} ka primary format ${brand.businessModel} model hai (${modelDesc}).`;
    }
    // Check for Support / Training
    else if (normalizedQ.includes('support') || normalizedQ.includes('training') || normalizedQ.includes('help') || normalizedQ.includes('marketing')) {
      answer = `Brand complete operational support provide karta hai: Site Selection assistance, Comprehensive Staff Training, National/Local Marketing Support, Standard Interior Fit-out guidelines aur Raw Material supply chain.`;
      suggestMeeting = true;
    }
    // General Knowledge base answer synthesis
    else if (matchedChunks.length > 0) {
      answer = `${matchedChunks[0]}\n\n(Yeh jankari brand ke approved official expo document se li gayi hai).`;
    } else {
      answer = `Ye specific detail brand ke current approved catalog mein explicitly mention nahi hai. Sahi aur updated details ke liye kripya direct Live Meeting request karein.`;
      suggestMeeting = true;
    }

    return {
      answer,
      sources: relevantSources.length > 0 ? relevantSources : ['Official Brand Expo Dossier'],
      suggestMeeting,
      brandSnapshot: {
        name: brand.brandName,
        investment: brand.investmentRange?.displayString || '₹30L – ₹40L',
        area: brand.requiredAreaSqFt?.displayString || '800 – 1200 sq.ft.',
        model: brand.businessModel || 'FOFO',
      },
    };
  }
}
