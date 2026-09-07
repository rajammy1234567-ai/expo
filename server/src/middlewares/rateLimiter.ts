import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [ip: string]: { count: number; resetTime: number };
}

export const createRateLimiter = (options: { windowMs: number; max: number; message?: string }) => {
  const store: RateLimitStore = {};
  const { windowMs, max, message = 'Too many requests from this IP, please try again later.' } = options;

  // Cleanup interval to avoid memory leaks
  setInterval(() => {
    const now = Date.now();
    for (const ip in store) {
      if (store[ip].resetTime <= now) {
        delete store[ip];
      }
    }
  }, windowMs);

  return (req: Request, res: Response, next: NextFunction): void => {
    // Determine client IP
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      'unknown-ip';

    const now = Date.now();
    const record = store[clientIp];

    if (!record || record.resetTime <= now) {
      store[clientIp] = { count: 1, resetTime: now + windowMs };
      return next();
    }

    record.count += 1;

    if (record.count > max) {
      res.status(429).json({
        success: false,
        message,
        retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000),
      });
      return;
    }

    next();
  };
};

// Standard limiter for auth endpoints (e.g. 50 attempts per 15 minutes)
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 60,
  message: 'Too many authentication attempts. Please try again after 15 minutes.',
});
