import { Request, Response, NextFunction } from 'express';

export interface CustomError extends Error {
  statusCode?: number;
  details?: any;
}

export function errorHandler(
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    statusCode,
    path: req.path,
    method: req.method,
  });
  
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: err.details,
      }),
    },
  });
}