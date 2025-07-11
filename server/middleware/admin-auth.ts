import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PostgresStorage } from '../storage-postgres';

const storage = new PostgresStorage();

export interface AdminAuthRequest extends Request {
  adminId?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function generateAdminToken(adminId: string): string {
  return jwt.sign({ adminId, type: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
}

export async function authenticateAdmin(req: AdminAuthRequest, res: Response, next: NextFunction) {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { adminId: string; type: string };

    if (decoded.type !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Invalid token type.' });
    }

    const admin = await storage.getAdmin(decoded.adminId);
    if (!admin || !admin.isActive) {
      return res.status(403).json({ message: 'Access denied. Admin not found or inactive.' });
    }

    req.adminId = decoded.adminId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
}

export function requirePermission(permission: string) {
  return async (req: AdminAuthRequest, res: Response, next: NextFunction) => {
    try {
      const admin = await storage.getAdmin(req.adminId!);

      if (!admin) {
        return res.status(403).json({ message: 'Admin not found.' });
      }

      if (admin.role === 'super_admin' || admin.permissions.includes(permission)) {
        next();
      } else {
        res.status(403).json({ message: 'Insufficient permissions.' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error checking permissions.' });
    }
  };
}
