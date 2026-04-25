"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectDatabase = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        await mongoose_1.default.connect(mongoURI);
        console.log("MongoDB Connected Successfully!");
    }
    catch (error) {
        console.error("MongoDB Connection Failed:", error);
        process.exit(1);
    }
};
exports.default = connectDatabase;
//# sourceMappingURL=database.js.map