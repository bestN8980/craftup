import express from "express";

import {
  getMessagesController,
  sendMessageController,
  markMessagesAsReadController,
} from "../controllers/message.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/:id", authenticate, getMessagesController);

router.post("/:id", authenticate, sendMessageController);

router.patch("/:id/read", authenticate, markMessagesAsReadController);

export default router;