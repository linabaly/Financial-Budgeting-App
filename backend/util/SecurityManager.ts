import jwt from "jsonwebtoken";
import argon2 from "argon2";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

/**
 * @author Jacob D
 */
export default class SecurityManager {
  /**
   * Hashes a password using Argon2.
   * Ensures compliance with security best practices by using a strong hashing algorithm.
   * @author Jacob D
   * @param {string} password - Plaintext password.
   * @returns {Promise<string>} - Securely hashed password.
   */
  public static async hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }

  /**
   * Verifies if a password matches a hashed password.
   * @author Jacob D
   * @param {string} hashedPassword - Stored hashed password.
   * @param {string} password - Provided plaintext password.
   * @returns {Promise<boolean>} - True if passwords match, else false.
   */
  public static async verifyPassword(hashedPassword: string, password: string): Promise<boolean> {
    return argon2.verify(hashedPassword, password);
  }

  /**
   * Generates a JWT token for a user.
   * Ensures security by using HS256 algorithm and an expiration time.
   * @author Jacob D
   * @param {Object} user - Contains user ID and name.
   * @returns {string} - JWT token valid for 1 hour.
   */
  public static generateToken(user: { id: string; name: string }): string {
    return jwt.sign({ id: user.id, name: user.name }, JWT_SECRET, {
      expiresIn: "1h",
      algorithm: "HS384",
    });
  }

  /**
   * Verifies and decodes a JWT token.
   * Ensures that only valid tokens are used for authentication.
   * @author Jacob D
   * @param {string} token - JWT token to verify.
   * @returns {Object | null} - Decoded token if valid, else null.
   */
  public static verifyToken(token: string): { id: string; name: string } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; name: string };
      if (typeof decoded === "object") {
        return decoded;
      }
      return null;
    } catch (error) {
      console.error(`Error: ${error}`);
      return null;
    }
  }
}
