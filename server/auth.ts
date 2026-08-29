import type { Request, Response, NextFunction } from 'express';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Only protect API routes — static files and SPA shell are public
  if (!req.path.startsWith('/api/')) {
    return next();
  }

  const token = process.env.AUTH_TOKEN;

  // No token configured — allow all (dev mode)
  if (!token) {
    return next();
  }

  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing authorization token' });
    return;
  }

  const provided = header.slice(7);
  if (provided !== token) {
    res.status(403).json({ error: 'Invalid authorization token' });
    return;
  }

  next();
}
