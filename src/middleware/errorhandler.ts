import { NextFunction, Request, Response } from 'express';
import pgPromise from 'pg-promise';
import z from 'zod';

const pgp = pgPromise({})

export const errorHandler = (
  error: any,
  request: Request,
  response: Response,
  next: NextFunction
) => {
  console.error('ErrorHandler caught:', error);
  if (error instanceof z.ZodError) {
    const details = error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    return response.status(400).json({
      success: false,
      error: 'Validation failed',
      details,
    });
  }
  if(error instanceof pgp.errors.ParameterizedQueryError || error instanceof pgp.errors.PreparedStatementError || error instanceof pgp.errors.QueryFileError || error instanceof pgp.errors.QueryResultError ) {
    return response.status(400).json({
      success: false, 
      error: error.name,
      message: error.message,
      stack: error.stack
    });
  }

  const status = error.status || 500;
  const message = error.message || 'Internal Server Error';

  response.status(status).json({
    success: false,
    error: message
  });
};