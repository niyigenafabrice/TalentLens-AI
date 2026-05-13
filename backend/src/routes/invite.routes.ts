import express from "express";
import { inviteUser } from "../controllers/invite.controller";
const router = express.Router();
router.post("/", inviteUser);
export default router;
