import { Response, NextFunction } from "express";
import { AuthRequest } from "../..";
import { JwtUtil } from "../utils/jwt.util";
import UserModel from "../models/User";

/**
 * Authentication middleware to validate JWT tokens
 * Attaches the user to the request if authenticated
 */
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify token
    const payload = JwtUtil.verifyToken(token);
    if (!payload) {
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }

    // Get user from database
    const user = await UserModel.findById(payload.userId);
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Authentication failed" });
  }
};

/**
 * Middleware to enforce HTTPS in production
 */
export const httpsMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  // Check if we're in production and the request is not secure
  if (
    process.env.NODE_ENV === "production" &&
    process.env.REQUIRE_HTTPS === "true" &&
    !req.secure &&
    req.headers["x-forwarded-proto"] !== "https"
  ) {
    // Redirect to HTTPS
    res.redirect(`https://${req.headers.host}${req.url}`);
  } else {
    next();
  }
};

/**
 * Middleware to set secure headers
 */
export const securityHeadersMiddleware = (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  // Set security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.setHeader("Content-Security-Policy", "default-src 'self'");
  
  next();
};