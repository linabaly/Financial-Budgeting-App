import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { ApiError } from "../middleware/error.middleware";
import { AuthRequest, LoginRequest, RegisterRequest } from "../..";

export class AuthController {
  /**
   * Register a new user
   * @route POST /api/auth/register
   */
  static async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userData: RegisterRequest = req.body;
      
      // Validate request body
      if (!userData.username || !userData.email || !userData.password) {
        throw new ApiError("Username, email, and password are required", 400);
      }
      
      // Basic validation
      if (userData.password.length < 8) {
        throw new ApiError("Password must be at least 8 characters long", 400);
      }
      
      // Register the user
      const authResponse = await AuthService.register(userData);
      
      // Return auth response
      res.status(201).json(authResponse);
    } catch (error) {
      // If error is specific to registration
      if (error instanceof Error) {
        if (error.message.includes("already")) {
          next(new ApiError(error.message, 409));
          return;
        }
      }
      next(error);
    }
  }

  /**
   * Login a user
   * @route POST /api/auth/login
   */
  static async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const loginData: LoginRequest = req.body;
      
      // Validate request body
      if (!loginData.username || !loginData.password) {
        throw new ApiError("Username and password are required", 400);
      }
      
      // Login the user
      const authResponse = await AuthService.login(loginData);
      
      // Return auth response
      res.status(200).json(authResponse);
    } catch (error) {
      // If error is related to invalid credentials
      if (error instanceof Error && error.message.includes("Invalid")) {
        next(new ApiError("Invalid username or password", 401));
        return;
      }
      next(error);
    }
  }


  /**
   * Get current user's profile
   * @route GET /api/auth/me
   */
  static async getProfile(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user || !req.user.id) {
        throw new ApiError("User not authenticated", 401);
      }
      
      // Get user details
      const userDetails = await AuthService.getUserDetails(req.user.id);
      
      if (!userDetails) {
        throw new ApiError("User not found", 404);
      }
      
      // Return user details
      res.status(200).json(userDetails);
    } catch (error) {
      next(error);
    }
  }
}