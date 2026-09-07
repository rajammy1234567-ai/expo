import { IBrand } from '../models/Brand';
import { IInvestorProfile } from '../models/InvestorProfile';

export interface MatchResult {
  brand: IBrand;
  matchScore: number; // 0 to 100
  matchReasons: string[];
}

export class MatchmakingService {
  /**
   * Computes compatibility score between an investor profile and brand catalog.
   */
  static calculateMatch(profile: Partial<IInvestorProfile>, brand: IBrand): MatchResult {
    let score = 50; // Base score
    const reasons: string[] = [];

    // 1. Budget Compatibility (Weight: 30%)
    if (profile.investmentBudget) {
      const invMin = profile.investmentBudget.minINR;
      const invMax = profile.investmentBudget.maxINR;
      const brandMin = brand.investmentRange.minINR;
      const brandMax = brand.investmentRange.maxINR;

      if (brandMin <= invMax && brandMax >= invMin) {
        score += 25;
        reasons.push(`Budget Fits: ${brand.investmentRange.displayString}`);
      } else if (Math.abs(brandMin - invMax) <= 500000) {
        score += 10;
        reasons.push('Near your preferred budget range');
      } else {
        score -= 15;
      }
    }

    // 2. Category Match (Weight: 25%)
    if (profile.preferredCategories && profile.preferredCategories.length > 0) {
      const isCategoryMatch = profile.preferredCategories.some(
        (c) => c.toLowerCase() === brand.category.toLowerCase()
      );
      if (isCategoryMatch) {
        score += 20;
        reasons.push(`Preferred Category: ${brand.category}`);
      }
    }

    // 3. Franchise Model Match (Weight: 15%)
    if (profile.franchiseModelPreference && profile.franchiseModelPreference.length > 0) {
      if (profile.franchiseModelPreference.includes(brand.businessModel)) {
        score += 15;
        reasons.push(`Model Match: ${brand.businessModel}`);
      }
    }

    // 4. City Expansion Match (Weight: 10%)
    if (profile.city && brand.targetExpansionCities.length > 0) {
      const cityMatches = brand.targetExpansionCities.some(
        (c) => c.toLowerCase() === profile.city?.toLowerCase()
      );
      if (cityMatches) {
        score += 15;
        reasons.push(`Actively expanding in ${profile.city}`);
      }
    }

    // 5. Featured / Verification Bonus
    if (brand.verificationStatus === 'VERIFIED') {
      score += 5;
    }
    if (brand.isFeatured) {
      score += 5;
    }

    const finalScore = Math.min(Math.max(score, 10), 99);

    return {
      brand,
      matchScore: finalScore,
      matchReasons: reasons,
    };
  }
}
