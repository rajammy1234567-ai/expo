import { Response } from 'express';
import { inMemoryStore } from '../store/inMemoryStore';
import { MatchmakingService } from '../services/matchmakingService';

export class InvestorController {
  static async updateProfile(req: any, res: Response) {
    const userId = req.user?.userId || inMemoryStore.users[0]?._id || 'guest_investor';
    let profile = inMemoryStore.investorProfiles.find((p) => p.userId === userId);
    if (!profile) {
      profile = {
        _id: `65e2000000000000000000${inMemoryStore.investorProfiles.length + 10}`,
        userId,
        ...req.body,
      };
      inMemoryStore.investorProfiles.push(profile);
    } else {
      Object.assign(profile, req.body);
    }

    return res.json({ success: true, message: 'Profile updated', profile });
  }

  static async getAIMatches(req: any, res: Response) {
    const userId = req.user?.userId || inMemoryStore.users[0]?._id || 'guest_investor';
    const profile = inMemoryStore.investorProfiles.find((p) => p.userId === userId) || inMemoryStore.investorProfiles[0] || {};
    const brands = inMemoryStore.brands.filter((b) => b.verificationStatus === 'VERIFIED');

    const matches = brands.map((brand) => MatchmakingService.calculateMatch(profile, brand));
    matches.sort((a, b) => b.matchScore - a.matchScore);

    return res.json({
      success: true,
      count: matches.length,
      matches,
    });
  }

  static async toggleSaveBrand(req: any, res: Response) {
    const { brandId } = req.body;
    return res.json({ success: true, message: 'Saved status toggled', isSaved: true });
  }

  static async compareBrands(req: any, res: Response) {
    const { brandIds } = req.body;
    const brands = inMemoryStore.brands.filter((b) => brandIds.includes(b._id));
    return res.json({ success: true, brands });
  }
}
