import { Request, Response, NextFunction } from "express";
import { ErrorResponse } from "../..";

// Custom error class for API errors
export class ApiError extends Error {
  statusCode: number;
  error?: any;

  constructor(message: string, statusCode: number = 500, error?: any) {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// Error handler middleware
export const errorMiddleware = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(`Error: ${err.message}`);
  console.error(err.stack);

  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  
  const errorResponse: ErrorResponse = {
    message: err.message || "Internal Server Error",
    statusCode
  };

  // Include error details in development mode only
  if (process.env.NODE_ENV !== "production" && err instanceof ApiError && err.error) {
    errorResponse.error = err.error;
  }

  res.status(statusCode).json(errorResponse);
};

// Not found middleware
export const notFoundMiddleware = (
  _req: Request,
  res: Response
): void => {
  res.status(404).json({
    message: "Route not found",
    statusCode: 404
  });
};