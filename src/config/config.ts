import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Load environment variables from .env file
dotenv.config();

interface Config {
  server: {
    port: number;
    nodeEnv: string;
  };
  jwt: {
    secret: string;
    expiration: number;
  };
  security: {
    requireHttps: boolean;
    sessionSecret: string;
  };
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
}

// Read the JWT secret from a file if it exists
const getJwtSecret = (): string => {
  const secretFilePath = process.env.JWT_SECRET_FILE;
  
  if (secretFilePath && fs.existsSync(secretFilePath)) {
    return fs.readFileSync(secretFilePath, "utf8").trim();
  }
  
  // Fallback to environment variable
  const envSecret = process.env.JWT_SECRET;
  
  if (!envSecret) {
    throw new Error("JWT_SECRET or JWT_SECRET_FILE must be provided");
  }
  
  return envSecret;
};

const config: Config = {
  server: {
    port: parseInt(process.env.PORT || "3000", 10),
    nodeEnv: process.env.NODE_ENV || "development"
  },
  jwt: {
    secret: getJwtSecret(),
    expiration: parseInt(process.env.JWT_EXPIRATION || "3600", 10) // 1 hour in seconds
  },
  security: {
    requireHttps: process.env.REQUIRE_HTTPS === "true",
    sessionSecret: process.env.SESSION_SECRET || "default_session_secret_change_me"
  },
  database: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    name: process.env.DB_NAME || "finance_budgeting",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "password"
  }
};

// Validate critical configuration
if (config.server.nodeEnv === "production") {
  // In production, ensure proper security measures
  if (config.jwt.secret === "your_super_secure_secret_key_change_this_in_production") {
    throw new Error("Default JWT secret detected in production. Please change it.");
  }
  
  if (!config.security.requireHttps) {
    console.warn("WARNING: HTTPS is not required in production mode!");
  }
}

export default config;