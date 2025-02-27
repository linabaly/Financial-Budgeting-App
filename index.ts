import { Request } from "express";
import { User } from "./src/models/User";

// JWT payload structure
export interface JwtPayload {
  userId: string;
  username: string;
  email: string;
}

// Extend Express Request to include authenticated user
export interface AuthRequest extends Request {
  user?: User;
}

// Login request body
export interface LoginRequest {
  username: string;
  password: string;
}

// Registration request body
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// Authentication response
export interface AuthResponse {
  token: string;
  expiresIn: number;
  user: {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

// Error response
export interface ErrorResponse {
  message: string;
  statusCode: number;
  error?: any;
}