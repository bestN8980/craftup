import express from "express";

import {
  getMyNotifications,
  getMyUnreadCount,
  readNotification,
  readAllNotifications,
} from "../controllers/notification.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getMyNotifications);
router.get("/unread-count", getMyUnreadCount);
router.patch("/read-all", readAllNotifications);
router.patch("/:id/read", readNotification);

export default router;