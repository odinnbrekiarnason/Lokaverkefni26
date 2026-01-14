import z from 'zod'
import { NextFunction, Response, Request} from 'express'


export const validateBody = <T extends z.ZodSchema>(schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try{
      const parsed = schema.parse(req.body);
      req.bodyParsed = parsed as z.infer<T>
      next();
    } catch (e) {
      next(e);
    }
  }
};

export const validateParams = <T extends z.ZodSchema>(schema: z.ZodSchema) => {
  return(req: Request, res: Response, next: NextFunction) => {
    try{
      const parsed = schema.parse(req.params);
      req.paramsParsed = parsed as z.infer<T>
      next()
    } catch(e) {
      next(e);
    }
  }
};

export const validateQuery = <T extends z.ZodSchema>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction): void => { 
    try{
      const parsed = schema.parse(req.query);
      req.queryParsed = parsed as z.infer<T>;
      next();
    } catch(e) {
      next(e)
    }
  }
};

