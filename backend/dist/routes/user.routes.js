"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const router = express_1.default.Router();
// GET /api/users - Get all users
router.get("/", user_controller_1.getAllUsers);
// GET /api/users/role/:role - Get users by role
router.get("/role/:role", user_controller_1.getUsersByRole);
// GET /api/users/:id - Get single user
router.get("/:id", user_controller_1.getUserById);
// PATCH /api/users/:id/role - Update user role
router.patch("/:id/role", user_controller_1.updateUserRole);
// PUT /api/users/:id - Update user profile
router.put("/:id", user_controller_1.updateUserProfile);
// DELETE /api/users/:id - Delete user
router.delete("/:id", user_controller_1.deleteUser);
exports.default = router;
//# sourceMappingURL=user.routes.js.map