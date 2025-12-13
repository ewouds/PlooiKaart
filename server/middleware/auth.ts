import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { userId: string; username: string };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.token;
  console.log('[AUTH] Cookies received:', Object.keys(req.cookies), 'from origin:', req.headers.origin);

  if (!token) {
    console.log('[AUTH] No token cookie found - unauthorized');
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
