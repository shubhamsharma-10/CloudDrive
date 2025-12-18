import { NextFunction, Request, Response } from 'express';
import config from '../config/config.js';
import jwt from 'jsonwebtoken';

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        console.log("authorization: ", authHeader);
        
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        const verify = jwt.verify(token, config.jwtSecret)
        console.log(verify);

        // @ts-ignore
        req.userId = verify.id;
        
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}

export default authMiddleware;