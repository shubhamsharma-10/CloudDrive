import { NextFunction, Request, Response } from 'express';
import config from '../config/config.js';
import jwt from 'jsonwebtoken';

// Extend Express Request type to include userId
declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

interface JwtPayload {
    id: string;
    iat?: number;
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
        req.userId = decoded.id;

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}

export default authMiddleware;