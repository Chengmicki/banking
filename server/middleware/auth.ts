import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PostgresStorage } from '../storage-clean';

const storage = new PostgresStorage();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await storage.getUser(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
};
