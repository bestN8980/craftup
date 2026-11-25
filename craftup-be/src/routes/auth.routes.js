
import express from "express";

import {
  register,
  login,
  getMe,
  updateProfile,
  uploadProfileAvatar,
} from "../controllers/auth.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { uploadAvatar } from "../middleware/upload.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", authenticate, getMe);
router.patch("/me", authenticate, updateProfile);

router.post(
  "/avatar",
  authenticate,
  uploadAvatar,
  uploadProfileAvatar
);

export default router;
