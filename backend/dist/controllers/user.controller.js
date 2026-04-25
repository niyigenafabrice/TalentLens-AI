"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsersByRole = exports.deleteUser = exports.updateUserProfile = exports.updateUserRole = exports.getUserById = exports.getAllUsers = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await user_model_1.default.find().select("-password").sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: users.length,
            data: users,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get users",
            error: error,
        });
    }
};
exports.getAllUsers = getAllUsers;
// Get single user
const getUserById = async (req, res) => {
    try {
        const user = await user_model_1.default.findById(req.params.id).select("-password");
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get user",
            error: error,
        });
    }
};
exports.getUserById = getUserById;
// Update user role
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const validRoles = ["admin", "hr_manager", "recruiter"];
        if (!validRoles.includes(role)) {
            res.status(400).json({
                success: false,
                message: "Invalid role. Must be: admin, hr_manager, or recruiter",
            });
            return;
        }
        const user = await user_model_1.default.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: `User role updated to ${role}!`,
            data: user,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update role",
            error: error,
        });
    }
};
exports.updateUserRole = updateUserRole;
// Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await user_model_1.default.findByIdAndUpdate(req.params.id, { name, email }, { new: true }).select("-password");
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Profile updated successfully!",
            data: user,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update profile",
            error: error,
        });
    }
};
exports.updateUserProfile = updateUserProfile;
// Delete user
const deleteUser = async (req, res) => {
    try {
        const user = await user_model_1.default.findByIdAndDelete(req.params.id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "User deleted successfully!",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete user",
            error: error,
        });
    }
};
exports.deleteUser = deleteUser;
// Get users by role
const getUsersByRole = async (req, res) => {
    try {
        const { role } = req.params;
        const users = await user_model_1.default.find({ role }).select("-password");
        res.status(200).json({
            success: true,
            count: users.length,
            data: users,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get users",
            error: error,
        });
    }
};
exports.getUsersByRole = getUsersByRole;
//# sourceMappingURL=user.controller.js.map