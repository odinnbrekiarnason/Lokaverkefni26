import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { payloadToken } from '../config/typesAndInterfaces.js';

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    if(!JWT_SECRET) {
      return res.status(412).json({error: 'JWT_SECRET missing from enviroment'});
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader === undefined) {
      req.user = {id: 0, role: 'Guest'};
      return res.status(401).json({error: 'Invalid or no token: continuing as Guest'});
    }

    const token = authHeader && authHeader.split('Bearer ')[1];
    if(!token) {
      req.user = {id: 0, role: 'Guest'};
      return res.status(401).json({error: 'Invalid or no token: continuing as Guest'});
    }

    const decodedToken = jwt.verify(token, JWT_SECRET!) as unknown as payloadToken;
    
    req.user = {
      id: decodedToken.sub,
      role: decodedToken.role,
    }

    next();
  } catch (e) {
    if (e instanceof jwt.JsonWebTokenError || e instanceof jwt.TokenExpiredError) {
      req.user = {id: 0, role: 'Guest'};
      return res.status(401).json({error: 'Not logged in: role set as Guest'});
    }
    next(e)
  }
};

export const authorizeRoles = async(validRoles: ('Admin' | 'User')[]) => {
  return(req: Request, res: Response, next: NextFunction) => {
    if(!req.user) {
      return res.status(401).json({error: 'Authentication required'});
    }

    if(req.user.role === 'Guest' || !validRoles.includes(req.user.role)) {
      return res.status(403).json({error: 'Insufficient permissions'});
    }
    next();
  }
};

