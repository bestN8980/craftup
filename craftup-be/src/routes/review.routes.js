
import express from "express";

import { authenticate } from "../middleware/auth.middleware.js";

import {
  createReviewController,
  getProductReviewsController,
  replyToReviewController,
} from "../controllers/review.controller.js";

const router = express.Router();

// Khách hàng tạo đánh giá
router.post("/", authenticate, createReviewController);

// Lấy danh sách đánh giá của sản phẩm
router.get("/product/:productId", getProductReviewsController);

// Người bán phản hồi đánh giá
router.patch("/:reviewId/reply", authenticate, replyToReviewController);

export default router;
