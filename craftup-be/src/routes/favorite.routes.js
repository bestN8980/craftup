
import express from "express";

import { authenticate } from "../middleware/auth.middleware.js";

import {
  getFavoritesController,
  addFavoriteController,
  removeFavoriteController,
} from "../controllers/favorite.controller.js";

const router = express.Router();

// Lấy danh sách yêu thích
router.get("/", authenticate, getFavoritesController);

// Thêm sản phẩm yêu thích
router.post("/", authenticate, addFavoriteController);

// Xóa sản phẩm yêu thích
router.delete("/:productId", authenticate, removeFavoriteController);

export default router;
