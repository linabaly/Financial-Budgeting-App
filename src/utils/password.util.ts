import * as argon2 from "argon2";

/**
 * Password utilities using Argon2id for secure password hashing
 * Argon2id is a password-hashing function that was selected as the winner
 * of the Password Hashing Competition in July 2015
 */
export class PasswordUtil {
  // Argon2 configuration
  private static readonly options: argon2.Options = {
    // Argon2id variant provides protection against both side-channel and GPU attacks
    type: argon2.argon2id,
    // Memory cost - higher means more secure but slower (16MB)
    memoryCost: 16384,
    // Time cost - higher means more secure but slower
    timeCost: 3,
    // Parallelism factor - usually set to number of CPU cores
    parallelism: 2,
    // Output hash length
    hashLength: 32
  };

  /**
   * Hash a password using Argon2id
   * @param password The plain text password to hash
   * @returns The hashed password
   */
  static async hash(password: string): Promise<string> {
    try {
      return await argon2.hash(password, this.options);
    } catch (error) {
      console.error("Error hashing password:", error);
      throw new Error("Password hashing failed");
    }
  }

  /**
   * Verify a password against a hash
   * @param hash The stored hash
   * @param password The plain text password to verify
   * @returns True if the password matches the hash, false otherwise
   */
  static async verify(hash: string, password: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch (error) {
      console.error("Error verifying password:", error);
      return false;
    }
  }
}