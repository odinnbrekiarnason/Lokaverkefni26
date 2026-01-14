import 'express'
import { userRole } from '../schemas';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: userRole;
      };
      queryParsed: any;
      bodyParsed: any;
      paramsParsed: any;
    }
  }
}
