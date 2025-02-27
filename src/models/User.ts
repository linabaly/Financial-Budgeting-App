// src/models/User.ts

export interface User {
    id: string;
    username: string;
    email: string;
    password: string; // Stored as argon2 hash
    firstName?: string;
    lastName?: string;
    createdAt: Date;
    updatedAt: Date;
    lastLogin?: Date;
  }
  
  // Used when returning user data (excludes sensitive information)
  export interface SafeUser {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  // For database operations (using a mock for this implementation)
  export class UserModel {
    private users: User[] = [];
  
    // Find user by username
    async findByUsername(username: string): Promise<User | null> {
      const user = this.users.find(u => u.username === username);
      return user || null;
    }
  
    // Find user by email
    async findByEmail(email: string): Promise<User | null> {
      const user = this.users.find(u => u.email === email);
      return user || null;
    }
  
    // Find user by ID - FIX: This had an incorrect comparison
    async findById(id: string): Promise<User | null> {
      const user = this.users.find(u => u.id === id); // FIXED: was using user.id which is undefined
      return user || null;
    }
  
    // Create a new user
    async create(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
      const now = new Date();
      const newUser: User = {
        id: Math.random().toString(36).substring(2, 15), // Simple ID generation (use UUID in production)
        ...userData,
        createdAt: now,
        updatedAt: now
      };
      
      this.users.push(newUser);
      return newUser;
    }
  
    // Update user's last login time
    async updateLastLogin(userId: string): Promise<void> {
      const userIndex = this.users.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        this.users[userIndex].lastLogin = new Date();
        this.users[userIndex].updatedAt = new Date();
      }
    }
    
    // Convert User to SafeUser (remove sensitive data)
    static toSafeUser(user: User): SafeUser {
      const { password, ...safeUser } = user;
      return safeUser;
    }
  }
  
  // Create a singleton instance
  const userModelInstance = new UserModel();
  export default userModelInstance;