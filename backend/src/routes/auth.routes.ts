import express from "express";
import { register, login, getMe, acceptInvite } from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

// POST /api/auth/register
router.post("/register", register);

// POST /api/auth/login
router.post("/login", login);

// POST /api/auth/accept-invite
router.post("/accept-invite", acceptInvite);

// GET /api/auth/me
router.get("/me", protect, getMe);

export default router;

