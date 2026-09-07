import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Brand } from '../models/Brand';
import { BrandKnowledgeBase } from '../models/BrandKnowledgeBase';
import { inMemoryStore } from '../store/inMemoryStore';
import { AuthRequest, getActiveUserBrandId } from '../middlewares/authMiddleware';

export class BrandController {
  /**
   * Get brands for Expo Floor with strict verification scoping:
   * - Investors and public visitors ONLY see VERIFIED brands.
   * - Only VIZ_ADMIN can view unverified/pending brands.
   */
  static async getBrands(req: AuthRequest, res: Response) {
    try {
      const { category, budgetBracket, model, search, featuredOnly } = req.query;

      // Data Scoping: Only VIZ_ADMIN can bypass verifiedOnly
      const callerRole = req.user?.role;
      const isPlatformAdmin = callerRole === 'VIZ_ADMIN';
      const verifiedOnly = isPlatformAdmin && req.query.verifiedOnly === 'false' ? 'false' : 'true';

      let brands: any[] = [];
      if (mongoose.connection.readyState === 1) {
        try {
          const query: any = {};
          if (verifiedOnly === 'true') query.verificationStatus = 'VERIFIED';
          if (category && category !== 'All') query.category = new RegExp(`^${category}$`, 'i');
          if (model && model !== 'All') query.businessModel = model;
          if (featuredOnly === 'true') query.isFeatured = true;
          brands = await Brand.find(query).sort({ isFeatured: -1, featuredRank: -1, createdAt: -1 });
        } catch (e) {
          brands = inMemoryStore.brands;
        }
      } else {
        brands = inMemoryStore.brands;
      }

      if (!brands || brands.length === 0) {
        brands = inMemoryStore.brands;
      }

      // In-Memory Filter Engine
      let filtered = [...brands];
      if (verifiedOnly === 'true') {
        filtered = filtered.filter((b) => b.verificationStatus === 'VERIFIED');
      }
      if (category && category !== 'All') {
        filtered = filtered.filter((b) => b.category?.toLowerCase() === (category as string).toLowerCase());
      }
      if (model && model !== 'All') {
        filtered = filtered.filter((b) => b.businessModel === model);
      }
      if (search) {
        const s = (search as string).toLowerCase();
        filtered = filtered.filter(
          (b) =>
            b.brandName?.toLowerCase().includes(s) ||
            b.description?.toLowerCase().includes(s) ||
            b.category?.toLowerCase().includes(s)
        );
      }
      if (budgetBracket) {
        switch (budgetBracket) {
          case 'UNDER_5L':
            filtered = filtered.filter((b) => b.investmentRange?.minINR <= 500000);
            break;
          case '5L_10L':
            filtered = filtered.filter((b) => b.investmentRange?.minINR <= 1000000 && b.investmentRange?.maxINR >= 500000);
            break;
          case '10L_25L':
            filtered = filtered.filter((b) => b.investmentRange?.minINR <= 2500000 && b.investmentRange?.maxINR >= 1000000);
            break;
          case '25L_50L':
            filtered = filtered.filter((b) => b.investmentRange?.minINR <= 5000000 && b.investmentRange?.maxINR >= 2500000);
            break;
          case '50L_1CR':
            filtered = filtered.filter((b) => b.investmentRange?.minINR <= 10000000 && b.investmentRange?.maxINR >= 5000000);
            break;
          case '1CR_PLUS':
            filtered = filtered.filter((b) => b.investmentRange?.maxINR >= 10000000);
            break;
        }
      }

      return res.json({
        success: true,
        count: filtered.length,
        brands: filtered,
      });
    } catch (error: any) {
      const verified = inMemoryStore.brands.filter((b) => b.verificationStatus === 'VERIFIED');
      return res.json({ success: true, count: verified.length, brands: verified });
    }
  }

  static async getBrandById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      let brand: any = null;
      let kb: any[] = [];

      try {
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
          brand = await Brand.findById(id);
        } else {
          brand = await Brand.findOne({ slug: id });
        }
        if (brand) {
          kb = await BrandKnowledgeBase.find({ brandId: brand._id });
        }
      } catch (e) {
        // Fallback
      }

      if (!brand) {
        brand = inMemoryStore.brands.find((b) => b._id === id || b.slug === id) || null;
        kb = brand ? inMemoryStore.knowledgeBases.filter((k) => k.brandId === brand._id) : [];
      }

      if (!brand) {
        return res.status(404).json({ success: false, message: 'Brand not found' });
      }

      return res.json({
        success: true,
        brand,
        knowledgeBase: kb,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createBrand(req: AuthRequest, res: Response) {
    const brandData = req.body;
    const count = inMemoryStore.brands.length + 1;
    const newBrandId = `65e0000000000000000000${String(count).padStart(2, '0')}`;
    const newBrand = {
      _id: newBrandId,
      ownerUserId: req.user?.userId,
      slug: (brandData.brandName || 'new-brand').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      brandName: brandData.brandName || 'New Franchise Brand',
      tagline: brandData.tagline || '',
      description: brandData.description || '',
      category: brandData.category || 'Food',
      subCategories: brandData.subCategories || [],
      logoUrl: brandData.logoUrl || 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300&h=300&fit=crop',
      bannerUrl: brandData.bannerUrl || 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&h=600&fit=crop',
      pitchVideoUrl: brandData.pitchVideoUrl || '',
      galleryUrls: brandData.galleryUrls || [],
      verificationStatus: 'PENDING',
      isFeatured: false,
      investmentRange: brandData.investmentRange || { minINR: 1000000, maxINR: 2000000, displayString: '₹10L – ₹20L' },
      franchiseFeeINR: brandData.franchiseFeeINR || 300000,
      royaltyPercentage: brandData.royaltyPercentage || 5,
      requiredAreaSqFt: brandData.requiredAreaSqFt || { min: 500, max: 1000, displayString: '500 – 1000 sq.ft.' },
      businessModel: brandData.businessModel || 'FOFO',
      estimatedROIHistoricalMonths: brandData.estimatedROIHistoricalMonths || { min: 12, max: 18, disclaimer: 'Estimated.' },
      targetExpansionCities: brandData.targetExpansionCities || ['Delhi', 'Mumbai', 'Bangalore'],
      existingOutletsCount: brandData.existingOutletsCount || 1,
      yearEstablished: brandData.yearEstablished || new Date().getFullYear(),
      supportOffered: brandData.supportOffered || { siteSelection: true, staffTraining: true, marketingSupport: true },
      subscription: { tier: 'PREMIUM_BOOTH', agreedSuccessFeePercentage: 3.0, isActive: true },
      aiBotSettings: { isEnabled: true, botName: `${brandData.brandName || 'Brand'} AI` },
      createdAt: new Date().toISOString(),
    };

    inMemoryStore.brands.push(newBrand);
    return res.status(201).json({ success: true, message: 'Brand created successfully', brand: newBrand });
  }

  /**
   * Update Digital Booth:
   * - STRICT OWNERSHIP: Brand Admin can only update their own booth.
   * - ADMIN SAFEGUARD: Admins cannot edit brand booths (audit/view-only).
   */
  static async updateBrandBooth(req: AuthRequest, res: Response) {
    const { brandId } = req.params;
    const updates = req.body;

    if (req.user?.role === 'VIZ_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Admins have audit-only access and cannot edit brand booth details. Only the franchisor brand partner can edit their booth.',
      });
    }

    if (req.user?.role === 'BRAND_ADMIN') {
      const userBrandId = getActiveUserBrandId(req);
      if (brandId !== userBrandId) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Access denied. You can only update your own brand digital booth.',
        });
      }
    }

    const index = inMemoryStore.brands.findIndex((b) => b._id === brandId);
    if (index > -1) {
      inMemoryStore.brands[index] = { ...inMemoryStore.brands[index], ...updates };
      return res.json({ success: true, message: 'Digital booth updated', brand: inMemoryStore.brands[index] });
    }
    return res.status(404).json({ success: false, message: 'Brand not found' });
  }

  /**
   * Add KB Chunk:
   * - STRICT OWNERSHIP: Brand Admin can only add/edit KB for their own brand.
   * - ADMIN SAFEGUARD: Admins cannot edit brand KB.
   */
  static async addKBChunk(req: AuthRequest, res: Response) {
    const { brandId } = req.params;
    const { title, question, answer, content, sourceType } = req.body;

    if (req.user?.role === 'VIZ_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Admins have audit-only access. Only the franchisor brand partner can modify their AI knowledge base.',
      });
    }

    if (req.user?.role === 'BRAND_ADMIN') {
      const userBrandId = getActiveUserBrandId(req);
      if (brandId !== userBrandId) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Access denied. You can only add knowledge base chunks to your own brand.',
        });
      }
    }

    const newChunk = {
      _id: `65e6000000000000000000${inMemoryStore.knowledgeBases.length + 10}`,
      brandId,
      title,
      question,
      answer,
      content: content || answer || question,
      sourceType: sourceType || 'FAQ_MANUAL',
      isApprovedByBrand: true,
      isApprovedByAdmin: true,
      createdAt: new Date().toISOString(),
    };
    inMemoryStore.knowledgeBases.push(newChunk);
    return res.json({ success: true, message: 'Knowledge Base chunk added', chunk: newChunk });
  }
}
