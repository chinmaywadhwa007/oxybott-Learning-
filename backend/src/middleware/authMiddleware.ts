import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // Authentication disabled / bypassed for now
  req.user = {
    id: 'guest-user-1',
    email: 'guest@oxybott.local',
    username: 'Guest Developer',
  };
  next();
}
