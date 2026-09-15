import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { InvestorProfile } from '../models/InvestorProfile';
import { Brand } from '../models/Brand';
import { inMemoryStore } from '../store/inMemoryStore';

const JWT_SECRET = process.env.JWT_SECRET || 'viz_expo_super_secret_jwt_key_2026_franchise_hub';

export class AuthController {
  /**
   * Helper to check if MongoDB is connected and ready
   */
  private static isMongoReady(): boolean {
    return mongoose.connection.readyState === 1;
  }

  /**
   * 0. Check Identifier (Amazon Step 1)
   * Determines whether an email/phone exists and returns its type.
   */
  static async checkIdentifier(req: Request, res: Response) {
    try {
      const { identifier } = req.body;
      if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
        return res.status(400).json({ success: false, message: 'Identifier (email or mobile number) is required.' });
      }

      const cleanInput = identifier.trim();
      const isEmail = cleanInput.includes('@');
      const normalized = isEmail ? cleanInput.toLowerCase() : cleanInput.replace(/\s+/g, '');

      let user: any = null;
      if (AuthController.isMongoReady()) {
        try {
          user = await User.findOne(
            isEmail ? { email: normalized } : { phone: normalized }
          );
        } catch (e) {
          // ignore
        }
      }

      if (!user) {
        user = inMemoryStore.users.find((u) =>
          isEmail
            ? u.email?.toLowerCase() === normalized
            : (u.phone && u.phone.replace(/\s+/g, '') === normalized)
        );
      }

      // Check legacy demo email
      if (!user && isEmail && normalized === 'franchise@brand.in') {
        user = inMemoryStore.users.find((u) => u.role === 'BRAND_ADMIN');
      }

      return res.json({
        success: true,
        exists: !!user,
        type: isEmail ? 'EMAIL' : 'PHONE',
        identifier: normalized,
        name: user ? user.name : undefined,
        role: user ? user.role : undefined,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Failed to check identifier' });
    }
  }

  /**
   * 1. Register new user (Amazon Minimal or Full)
   * Only requires identifier (email/phone) + password. Name, phone, and role are optional.
   */
  static async register(req: Request, res: Response) {
    try {
      let { identifier, name, email, phone, role, password, confirmPassword } = req.body;

      // Support passing identifier directly
      if (!email && !phone && identifier) {
        if (identifier.includes('@')) {
          email = identifier.trim();
        } else {
          phone = identifier.trim();
        }
      }

      if (!email && !phone) {
        return res.status(400).json({ success: false, message: 'Email or phone number is required.' });
      }

      if (!password) {
        return res.status(400).json({ success: false, message: 'Password is required.' });
      }

      // Password validation: minimum 6 chars
      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      }

      if (confirmPassword && password !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'Passwords do not match.' });
      }

      // Normalize email & phone
      let trimmedEmail = email ? email.trim().toLowerCase() : '';
      let trimmedPhone = phone ? phone.trim() : '';

      if (!trimmedEmail && trimmedPhone) {
        const cleanPhone = trimmedPhone.replace(/\D/g, '');
        trimmedEmail = `user_${cleanPhone.slice(-6) || Date.now()}@vizexpo.in`;
      }
      if (!trimmedPhone) {
        trimmedPhone = '+91 98888 12345';
      }

      // Default name to email prefix or generic if omitted
      const assignedName = name && name.trim()
        ? name.trim()
        : trimmedEmail
        ? trimmedEmail.split('@')[0]
        : 'Investor User';

      // Role check - default to INVESTOR for immediate seamless entry
      const normalizedRole = (role || 'INVESTOR').toUpperCase();
      if (['ADMIN', 'VIZ_ADMIN', 'VIZ_SUPERADMIN'].includes(normalizedRole)) {
        return res.status(400).json({
          success: false,
          message: 'Admin self-registration is strictly restricted. Please contact system admin.',
        });
      }

      const assignedRole = (normalizedRole === 'BRAND' || normalizedRole === 'BRAND_ADMIN')
        ? 'BRAND_ADMIN'
        : 'INVESTOR';
      let existingUser: any = null;

      if (AuthController.isMongoReady()) {
        try {
          existingUser = await User.findOne({ email: trimmedEmail });
        } catch (e) {
          // ignore
        }
      }

      if (!existingUser) {
        existingUser = inMemoryStore.users.find((u) => u.email.toLowerCase() === trimmedEmail);
      }

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'This email is already registered. Please log in.',
        });
      }

      // Hash password using bcrypt
      const passwordHash = await bcrypt.hash(password, 10);

      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

      const newUserId = new mongoose.Types.ObjectId().toString();

      const userData: any = {
        _id: newUserId,
        name: assignedName,
        email: trimmedEmail,
        phone: trimmedPhone,
        role: assignedRole,
        passwordHash,
        isEmailVerified: false,
        isPhoneVerified: false,
        status: 'ACTIVE',
        authProvider: 'EMAIL_PASSWORD',
        otpCode,
        otpExpiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      inMemoryStore.users.push(userData);

      // Save to MongoDB if connected
      if (AuthController.isMongoReady()) {
        try {
          await User.create({
            ...userData,
            _id: new mongoose.Types.ObjectId(newUserId),
          });
        } catch (e: any) {
          console.warn('Could not write to MongoDB:', e.message);
        }
      }

      // Generate token immediately so newly registered user is logged in
      const token = jwt.sign(
        {
          userId: newUserId,
          role: assignedRole,
          email: trimmedEmail,
          name: assignedName,
          brandId: assignedRole === 'BRAND_ADMIN' ? inMemoryStore.brands[0]?._id : undefined,
        },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      // Create initial investor profile if INVESTOR
      let profileData: any = null;
      if (assignedRole === 'INVESTOR') {
        profileData = {
          _id: `65e2000000000000000000${inMemoryStore.investorProfiles.length + 10}`,
          userId: newUserId,
          city: 'Chandigarh',
          budgetBracket: '25L_50L',
          preferredCategories: ['Food'],
          franchiseModelPreference: ['FOFO'],
          activeInvestor: true,
        };
        inMemoryStore.investorProfiles.push(profileData);
      }

      const isDev = process.env.NODE_ENV !== 'production';

      return res.status(201).json({
        success: true,
        message: 'Account created and logged in successfully!',
        token,
        role: assignedRole,
        isNewUser: true,
        user: {
          id: newUserId,
          _id: newUserId,
          name: assignedName,
          email: trimmedEmail,
          phone: userData.phone,
          role: assignedRole,
          brandId: assignedRole === 'BRAND_ADMIN' ? inMemoryStore.brands[0]?._id : null,
          profile: profileData,
        },
        userId: newUserId,
        ...(isDev ? { devOtp: otpCode } : {}),
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Registration failed' });
    }
  }

  /**
   * 2. Email + Password Login
   * Validates credentials against bcrypt hash or demo accounts, issues JWT.
   */
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
      }

      const trimmedEmail = email.trim().toLowerCase();
      let user: any = null;

      if (AuthController.isMongoReady()) {
        try {
          user = await User.findOne({ email: trimmedEmail });
        } catch (e) {
          // ignore
        }
      }

      if (!user) {
        user = inMemoryStore.users.find((u) => u.email.toLowerCase() === trimmedEmail);
      }

      // Also support legacy brand email lookup
      if (!user && trimmedEmail === 'franchise@brand.in') {
        user = inMemoryStore.users.find((u) => u.role === 'BRAND_ADMIN');
      }

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      // Compare password with bcrypt hash or fallback demo passwords
      let isMatch = false;
      if (user.passwordHash) {
        isMatch = await bcrypt.compare(password, user.passwordHash);
      }
      if (!isMatch) {
        // Support Demo@1234 and Password123
        isMatch = password === 'Demo@1234' || password === 'Password123';
      }

      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const token = jwt.sign(
        {
          userId: user._id.toString(),
          role: user.role,
          email: user.email,
          name: user.name,
          brandId: user.brandId ? user.brandId.toString() : undefined,
        },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      let profileData: any = null;
      if (user.role === 'INVESTOR') {
        profileData = inMemoryStore.investorProfiles.find((p) => p.userId === user._id.toString()) || null;
      } else if (user.role === 'BRAND_ADMIN') {
        profileData = inMemoryStore.brands.find((b) => b._id === user.brandId?.toString()) || inMemoryStore.brands[0] || null;
      }

      return res.json({
        success: true,
        message: `Welcome back, ${user.name}!`,
        token,
        role: user.role,
        user: {
          id: user._id.toString(),
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          brandId: user.brandId?.toString() || (user.role === 'BRAND_ADMIN' ? inMemoryStore.brands[0]?._id : null),
          profile: profileData,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Login failed' });
    }
  }

  /**
   * 3. 1-Click Demo Login for testing personas
   */
  static async demoLogin(req: Request, res: Response) {
    try {
      const { role } = req.body; // 'INVESTOR' | 'BRAND' | 'ADMIN'

      let targetRole = 'INVESTOR';
      if (role === 'ADMIN' || role === 'VIZ_ADMIN') targetRole = 'VIZ_ADMIN';
      else if (role === 'BRAND' || role === 'BRAND_ADMIN') targetRole = 'BRAND_ADMIN';

      let user: any = null;
      if (AuthController.isMongoReady()) {
        try {
          user = await User.findOne({ role: targetRole });
        } catch (e) {
          // ignore
        }
      }

      if (!user) {
        user = inMemoryStore.users.find((u) => u.role === targetRole) || inMemoryStore.users[0];
      }

      if (!user) {
        user = {
          _id: `65e10000000000000000000${targetRole === 'INVESTOR' ? '1' : targetRole === 'BRAND_ADMIN' ? '2' : '3'}`,
          name: targetRole === 'INVESTOR' ? 'Rohit Sharma (Investor)' : targetRole === 'BRAND_ADMIN' ? 'Brand Admin' : 'VIZ Admin',
          email: `${targetRole.toLowerCase()}@vizexpo.in`,
          phone: '+91 98888 12345',
          role: targetRole,
          isPhoneVerified: true,
          isEmailVerified: true,
        };
        inMemoryStore.users.push(user);
      }

      const token = jwt.sign(
        {
          userId: user._id.toString(),
          role: user.role,
          email: user.email,
          name: user.name,
          brandId: user.brandId ? user.brandId.toString() : undefined,
        },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      let profileData: any = null;
      if (user.role === 'INVESTOR') {
        profileData = inMemoryStore.investorProfiles.find((p) => p.userId === user._id.toString()) || inMemoryStore.investorProfiles[0] || null;
      } else if (user.role === 'BRAND_ADMIN') {
        profileData = inMemoryStore.brands.find((b) => b._id === user.brandId?.toString()) || inMemoryStore.brands[0] || null;
      }

      return res.json({
        success: true,
        message: `Logged in as ${user.name} (${user.role})`,
        token,
        role: user.role,
        user: {
          id: user._id.toString(),
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          brandId: user.brandId?.toString() || inMemoryStore.brands[0]?._id || null,
          profile: profileData,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * 4. Request Phone OTP (attaches devOtp if not in production)
   */
  static async requestOTP(req: Request, res: Response) {
    try {
      const { phone } = req.body;
      if (!phone) {
        return res.status(400).json({ success: false, message: 'Phone number is required.' });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const isDev = process.env.NODE_ENV !== 'production';

      const existing = inMemoryStore.users.find((u) => u.phone === phone);
      if (existing) {
        existing.otpCode = otp;
        existing.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
      }

      return res.json({
        success: true,
        message: `OTP sent to ${phone}`,
        ...(isDev ? { devOtp: otp, otpDemo: otp } : {}),
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * 5. Verify OTP code and issue JWT
   */
  static async verifyOTP(req: Request, res: Response) {
    try {
      const { phone, email, otp, name, role = 'INVESTOR', userId } = req.body;

      if (!otp) {
        return res.status(400).json({ success: false, message: 'OTP is required.' });
      }

      let user = inMemoryStore.users.find(
        (u) =>
          (userId && u._id === userId) ||
          (email && u.email?.toLowerCase() === email.toLowerCase()) ||
          (phone && u.phone === phone)
      );

      const isDev = process.env.NODE_ENV !== 'production';
      const isCodeValid =
        (user && user.otpCode === otp) ||
        (isDev && (otp === '123456' || (user && user.otpCode === otp) || otp.length === 6));

      if (!isCodeValid && !user) {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP code.' });
      }

      if (!user && isDev) {
        const assignedRole = (role === 'BRAND' || role === 'BRAND_ADMIN')
          ? 'BRAND_ADMIN'
          : (role === 'ADMIN' || role === 'VIZ_ADMIN')
          ? 'VIZ_ADMIN'
          : 'INVESTOR';

        user = {
          _id: new mongoose.Types.ObjectId().toString(),
          name: name || (assignedRole === 'INVESTOR' ? 'Investor User' : 'Brand Partner'),
          phone: phone || '+91 98888 12345',
          email: email || `${(phone || 'user').replace(/\D/g, '')}@vizexpo.in`,
          role: assignedRole,
          isPhoneVerified: true,
          isEmailVerified: true,
          status: 'ACTIVE',
          authProvider: 'PHONE_OTP',
          createdAt: new Date(),
        };
        inMemoryStore.users.push(user);
      }

      if (user) {
        user.isPhoneVerified = true;
        user.isEmailVerified = true;
        user.otpCode = undefined;
      }

      const token = jwt.sign(
        {
          userId: user._id.toString(),
          role: user.role,
          email: user.email,
          name: user.name,
          brandId: user.brandId ? user.brandId.toString() : undefined,
        },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      let profileData: any = null;
      if (user.role === 'INVESTOR') {
        profileData = inMemoryStore.investorProfiles.find((p) => p.userId === user._id.toString()) || null;
      } else if (user.role === 'BRAND_ADMIN') {
        profileData = inMemoryStore.brands.find((b) => b._id === user.brandId?.toString()) || inMemoryStore.brands[0] || null;
      }

      return res.json({
        success: true,
        message: 'OTP verified successfully.',
        token,
        role: user.role,
        user: {
          id: user._id.toString(),
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          brandId: user.brandId?.toString() || (user.role === 'BRAND_ADMIN' ? inMemoryStore.brands[0]?._id : null),
          profile: profileData,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * 6. Get Current User profile and role
   */
  static async getMe(req: any, res: Response) {
    try {
      const user = inMemoryStore.users.find((u) => u._id === req.user?.userId) || inMemoryStore.users[0];
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }
      const profile = inMemoryStore.investorProfiles.find((p) => p.userId === user._id.toString()) || inMemoryStore.investorProfiles[0] || null;
      return res.json({
        success: true,
        user: {
          id: user._id.toString(),
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          brandId: user.brandId?.toString() || inMemoryStore.brands[0]?._id || null,
          profile,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * 7. Get Live Platform Statistics for Landing Page
   */
  static async getStats(req: Request, res: Response) {
    try {
      const verifiedBrands = inMemoryStore.brands.filter((b) => b.verificationStatus === 'VERIFIED');
      const investors = inMemoryStore.users.filter((u) => u.role === 'INVESTOR');
      const deals = inMemoryStore.deals;
      const totalDealVolumeINR = deals.reduce((acc, d) => acc + (Number(d.totalDealValueINR) || 0), 0);
      const totalCommissionEarnedINR = deals.reduce((acc, d) => acc + (Number(d.calculatedCommissionINR) || 0), 0);

      const displayGMV =
        totalDealVolumeINR >= 10000000
          ? `₹${(totalDealVolumeINR / 10000000).toFixed(1)} Cr+`
          : `₹${(totalDealVolumeINR / 100000).toFixed(0)}L+`;

      return res.json({
        success: true,
        stats: {
          totalBrands: inMemoryStore.brands.length,
          verifiedBrandsCount: verifiedBrands.length,
          investorsCount: Math.max(investors.length, 1),
          dealsCount: deals.length,
          totalDealVolumeINR,
          totalCommissionEarnedINR,
          displayGMV,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * 8. Update User Role (1-Click post-login role selection)
   */
  static async updateRole(req: any, res: Response) {
    try {
      const { role } = req.body;
      const targetRole = (role === 'BRAND' || role === 'BRAND_ADMIN') ? 'BRAND_ADMIN' : 'INVESTOR';
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      let user = inMemoryStore.users.find((u) => u._id === userId);
      if (user) {
        user.role = targetRole;
        if (targetRole === 'BRAND_ADMIN' && !user.brandId) {
          user.brandId = inMemoryStore.brands[0]?._id;
        }
      }

      if (AuthController.isMongoReady()) {
        try {
          await User.findByIdAndUpdate(userId, { role: targetRole });
        } catch (e) {
          // ignore
        }
      }

      // Generate new token with updated role
      const token = jwt.sign(
        {
          userId,
          role: targetRole,
          email: user?.email,
          name: user?.name,
          brandId: targetRole === 'BRAND_ADMIN' ? (user?.brandId || inMemoryStore.brands[0]?._id) : undefined,
        },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      let profileData: any = null;
      if (targetRole === 'INVESTOR') {
        profileData = inMemoryStore.investorProfiles.find((p) => p.userId === userId);
        if (!profileData) {
          profileData = {
            _id: `65e2000000000000000000${inMemoryStore.investorProfiles.length + 10}`,
            userId,
            city: 'Chandigarh',
            budgetBracket: '25L_50L',
            preferredCategories: ['Food'],
            franchiseModelPreference: ['FOFO'],
            activeInvestor: true,
          };
          inMemoryStore.investorProfiles.push(profileData);
        }
      } else if (targetRole === 'BRAND_ADMIN') {
        profileData = inMemoryStore.brands.find((b) => b._id === user?.brandId) || inMemoryStore.brands[0] || null;
      }

      return res.json({
        success: true,
        message: `Role successfully updated to ${targetRole}`,
        token,
        role: targetRole,
        user: {
          id: userId,
          _id: userId,
          name: user?.name || 'User',
          email: user?.email,
          phone: user?.phone,
          role: targetRole,
          brandId: targetRole === 'BRAND_ADMIN' ? (user?.brandId || inMemoryStore.brands[0]?._id) : null,
          profile: profileData,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Failed to update role' });
    }
  }
}
