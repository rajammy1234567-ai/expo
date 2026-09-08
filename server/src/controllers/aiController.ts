import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { AIRagService } from '../services/aiRagService';
import { Brand } from '../models/Brand';
import { MatchmakingService } from '../services/matchmakingService';
import { inMemoryStore } from '../store/inMemoryStore';

export class AIController {
  /**
   * Query Brand AI Franchise Assistant (Grounded RAG)
   */
  static async askBrandAI(req: Request, res: Response) {
    try {
      const { brandId, question } = req.body;

      if (!brandId || !question) {
        return res.status(400).json({
          success: false,
          message: 'Both brandId and question are required',
        });
      }

      const result = await AIRagService.queryBrandAI(brandId, question);

      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Run AI Matchmaker on customized query parameters
   */
  static async matchInvestorPreferences(req: Request, res: Response) {
    try {
      const { city, budgetBracket, category, model } = req.body;
      let brands: any[] = [];
      if (mongoose.connection.readyState === 1) {
        brands = await Brand.find({ verificationStatus: 'VERIFIED' });
      } else {
        brands = inMemoryStore.brands.filter((b) => b.verificationStatus === 'VERIFIED');
      }

      let minINR = 1000000;
      let maxINR = 5000000;
      if (budgetBracket === 'UNDER_5L') { minINR = 100000; maxINR = 500000; }
      else if (budgetBracket === '5L_10L') { minINR = 500000; maxINR = 1000000; }
      else if (budgetBracket === '10L_25L') { minINR = 1000000; maxINR = 2500000; }
      else if (budgetBracket === '25L_50L') { minINR = 2500000; maxINR = 5000000; }
      else if (budgetBracket === '50L_1CR') { minINR = 5000000; maxINR = 10000000; }
      else if (budgetBracket === '1CR_PLUS') { minINR = 10000000; maxINR = 50000000; }

      const profileMock: any = {
        city: city || 'Chandigarh',
        preferredCategories: category ? [category] : ['Food'],
        franchiseModelPreference: model ? [model] : ['FOFO'],
        investmentBudget: { minINR, maxINR, bracket: budgetBracket || '25L_50L' },
      };

      const matches = brands.map((b) => MatchmakingService.calculateMatch(profileMock, b));
      matches.sort((a, b) => b.matchScore - a.matchScore);

      return res.json({
        success: true,
        count: matches.length,
        matches,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
