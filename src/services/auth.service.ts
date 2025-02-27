// src/services/auth.service.ts
import userModelInstance, { User, SafeUser, UserModel } from "../models/User";
import { PasswordUtil } from "../utils/password.util";
import { JwtUtil } from "../utils/jwt.util";
import { AuthResponse, LoginRequest, RegisterRequest } from "../..";

export class AuthService {
  /**
   * Register a new user
   * @param userData User registration data
   * @returns Authentication response with token and user details
   */
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    // Check if username already exists
    const existingUsername = await userModelInstance.findByUsername(userData.username);
    if (existingUsername) {
      throw new Error("Username already taken");
    }

    // Check if email already exists
    const existingEmail = await userModelInstance.findByEmail(userData.email);
    if (existingEmail) {
      throw new Error("Email already registered");
    }

    // Hash the password
    const hashedPassword = await PasswordUtil.hash(userData.password);

    // Create the user
    const newUser = await userModelInstance.create({
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName
    });

    // Generate JWT token
    const { token, expiresIn } = JwtUtil.generateToken(newUser);

    // Return auth response
    return {
      token,
      expiresIn,
      user: UserModel.toSafeUser(newUser)
    };
  }

  /**
   * Authenticate a user
   * @param loginData Login credentials
   * @returns Authentication response with token and user details
   */
  static async login(loginData: LoginRequest): Promise<AuthResponse> {
    // Find user by username
    const user = await userModelInstance.findByUsername(loginData.username);
    if (!user) {
      throw new Error("Invalid username or password");
    }

    // Verify password
    const passwordValid = await PasswordUtil.verify(user.password, loginData.password);
    if (!passwordValid) {
      throw new Error("Invalid username or password");
    }

    // Update last login time
    await userModelInstance.updateLastLogin(user.id);

    // Generate JWT token
    const { token, expiresIn } = JwtUtil.generateToken(user);

    // Return auth response
    return {
      token,
      expiresIn,
      user: UserModel.toSafeUser(user) // FIXED: was using undefined newUser
    };
  }

  /**
   * Get user details by ID
   * @param userId User ID
   * @returns User details (excluding sensitive information)
   */
  static async getUserDetails(userId: string): Promise<SafeUser | null> {
    const user = await userModelInstance.findById(userId);
    if (!user) {
      return null;
    }
    return UserModel.toSafeUser(user); // FIXED: incorrect return statement
  }
}