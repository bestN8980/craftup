import express from "express";

import {
  getConversationsController,
  createConversationController,
} from "../controllers/conversation.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();
router.get("/", authenticate, getConversationsController);
router.post("/", authenticate, createConversationController);

export default router;