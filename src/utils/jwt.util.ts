import jwt from "jsonwebtoken";
import config from "../config/config";
import { JwtPayload } from "../..";
import { User } from "../models/User";

export class JwtUtil {
  private static readonly secret = config.jwt.secret;
  private static readonly expiresIn = config.jwt.expiration;

  /**
   * Generate a JWT token for a user
   * @param user The user to generate a token for
   * @returns The generated token and expiration time
   */
  static generateToken(user: User): { token: string; expiresIn: number } {
    const payload: JwtPayload = {
      userId: user.id,
      username: user.username,
      email: user.email
    };

    const token = jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn
    });

    return {
      token,
      expiresIn: this.expiresIn
    };
  }

  /**
   * Verify and decode a JWT token
   * @param token The token to verify
   * @returns The decoded payload if valid, null otherwise
   */
  static verifyToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, this.secret) as JwtPayload;
    } catch (error) {
      return null;
    }
  }
}