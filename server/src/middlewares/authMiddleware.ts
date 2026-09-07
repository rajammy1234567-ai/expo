import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { inMemoryStore } from '../store/inMemoryStore';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
    email: string;
    name: string;
    brandId?: string;
  };
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authorization token required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET || 'viz_expo_super_secret_jwt_key_2026_franchise_hub';
    const decoded = jwt.verify(token, secret) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const optionalAuthenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET || 'viz_expo_super_secret_jwt_key_2026_franchise_hub';
    const decoded = jwt.verify(token, secret) as any;
    req.user = decoded;
  } catch (error) {
    // ignore invalid token for optional auth
  }
  next();
};

/**
 * RBAC middleware: checks if req.user has one of the allowed roles
 * Usage: authorizeRole('INVESTOR') or authorizeRole('BRAND_ADMIN', 'VIZ_ADMIN')
 */
export const authorizeRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before role verification',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${roles.join(', ')}]. Your current role is '${req.user.role}'.`,
      });
    }
    next();
  };
};

// Backward-compatibility alias for existing code
export const requireRole = (roles: string[]) => authorizeRole(...roles);

/**
 * Data Scoping Helper: Resolves the logged-in user's assigned brandId
 */
export const getActiveUserBrandId = (req: AuthRequest): string | null => {
  if (req.user?.brandId) return req.user.brandId;
  const user = inMemoryStore.users.find((u) => u._id === req.user?.userId);
  if (user?.brandId) return user.brandId;
  // If user is a brand admin and owns a brand in store
  const ownedBrand = inMemoryStore.brands.find((b) => b.ownerUserId === req.user?.userId);
  if (ownedBrand) return ownedBrand._id;
  // For default seeded brand admin
  if (req.user?.role === 'BRAND_ADMIN' && inMemoryStore.brands.length > 0) {
    return inMemoryStore.brands[0]._id;
  }
  return null;
};

/**
 * Ownership Verification Helper:
 * Validates whether the caller owns the specified brand.
 */
export const verifyBrandOwnership = (req: AuthRequest, targetBrandId: string): boolean => {
  if (!req.user) return false;
  // VIZ_ADMIN has platform-wide view rights, but specific endpoints may restrict editing
  if (req.user.role === 'VIZ_ADMIN') return true;
  if (req.user.role !== 'BRAND_ADMIN') return false;

  const userBrandId = getActiveUserBrandId(req);
  return userBrandId === targetBrandId;
};
