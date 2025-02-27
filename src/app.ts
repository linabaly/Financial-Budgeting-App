// Application initialization
console.log("Starting application...");

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import fs from "fs";
import config from "./config/config";
import authRoutes from "./routes/auth.routes";
import { 
  httpsMiddleware, 
  securityHeadersMiddleware 
} from "./middleware/auth.middleware";
import { 
  errorMiddleware, 
  notFoundMiddleware 
} from "./middleware/error.middleware";

// Create Express app
const app = express();

// Apply security middleware
app.use(httpsMiddleware);
app.use(securityHeadersMiddleware);

// Apply CORS
app.use(cors({
  origin: process.env.NODE_ENV === "production" 
    ? "https://yourdomain.com" // Replace with your production domain
    : "http://localhost:3000",
  credentials: true
}));

// Parse request body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser(config.security.sessionSecret));

// Define routes
app.use("/api/auth", authRoutes);

// Define health check route
app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Root route for quick testing
app.get("/", (_req, res) => {
  res.status(200).json({ 
    message: "Finance Budgeting App API is running!", 
    endpoints: {
      health: "/api/health",
      auth: {
        register: "/api/auth/register [POST]",
        login: "/api/auth/login [POST]",
        profile: "/api/auth/me [GET] (requires authentication)"
      }
    }
  });
});

// Apply error handling middleware
app.use(notFoundMiddleware);
app.use(errorMiddleware);

// Start server with improved error handling
const PORT = config.server.port;
console.log("Attempting to start server on port", PORT);

const server = app.listen(PORT, '127.0.0.1')
  .on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Trying alternative...`);
      
      // Option 1: Try a different port
      const alternativePort = PORT + 1000;
      console.log(`Attempting to use port ${alternativePort} instead...`);
      app.listen(alternativePort, '127.0.0.1', () => {
        console.log("=================================");
        console.log(`Server running on http://127.0.0.1:${alternativePort}`);
        console.log(`Environment: ${config.server.nodeEnv}`);
        console.log("=================================");
      });
      
      // Option 2: Fall back to named pipes if ports continue to fail
      if (process.env.USE_NAMED_PIPE === 'true') {
        const PIPE_PATH = '\\\\.\\pipe\\finance-budget-app';
        try {
          if (fs.existsSync(PIPE_PATH)) {
            fs.unlinkSync(PIPE_PATH);
          }
          app.listen(PIPE_PATH, () => {
            console.log("=================================");
            console.log(`Server running on named pipe: ${PIPE_PATH}`);
            console.log(`Environment: ${config.server.nodeEnv}`);
            console.log("=================================");
          });
        } catch (pipeError) {
          console.error('Failed to use named pipe:', pipeError);
        }
      }
    } else {
      console.error('Server error:', error);
    }
  });

server.on('listening', () => {
  console.log("=================================");
  console.log(`Server running on http://127.0.0.1:${PORT}`);
  console.log(`Environment: ${config.server.nodeEnv}`);
  console.log("=================================");
});

export default app;