"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "hrcompetition_secret_key";
const protect = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                success: false,
                message: "Not authorized! Please login first.",
            });
            return;
        }
        // Verify token
        const token = authHeader.split(" ")[1];
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Add user to request
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: "Invalid token! Please login again.",
        });
    }
};
exports.protect = protect;
//# sourceMappingURL=auth.middleware.js.map