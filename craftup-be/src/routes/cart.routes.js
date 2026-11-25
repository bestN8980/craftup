
import express from "express";

import { authenticate } from "../middleware/auth.middleware.js";

import {
  addToCartController,
  getCartController,
  updateCartItemController,
  removeCartItemController,
} from "../controllers/cart.controller.js";

const router = express.Router();

// Lấy giỏ hàng
router.get("/", authenticate, getCartController);

// Thêm sản phẩm vào giỏ hàng
router.post("/items", authenticate, addToCartController);

router.patch("/items/:itemId", authenticate, updateCartItemController);

router.delete(
  "/items/:itemId",
  authenticate,
  removeCartItemController
);

export default router;
