import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post("/register", AuthController.register);

/**
 * @route POST /api/auth/login
 * @desc Login a user
 * @access Public
 */
router.post("/login", AuthController.login);

/**
 * @route GET /api/auth/me
 * @desc Get current user's profile
 * @access Private
 */
router.get("/me", authMiddleware, AuthController.getProfile);

export default router;