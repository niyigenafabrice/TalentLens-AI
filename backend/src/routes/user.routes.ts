import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserProfile,
  deleteUser,
  getUsersByRole,
} from "../controllers/user.controller";

const router = express.Router();

// GET /api/users - Get all users
router.get("/", getAllUsers);

// GET /api/users/role/:role - Get users by role
router.get("/role/:role", getUsersByRole);

// GET /api/users/:id - Get single user
router.get("/:id", getUserById);

// PATCH /api/users/:id/role - Update user role
router.patch("/:id/role", updateUserRole);

// PUT /api/users/:id - Update user profile
router.put("/:id", updateUserProfile);

// DELETE /api/users/:id - Delete user
router.delete("/:id", deleteUser);

export default router;
