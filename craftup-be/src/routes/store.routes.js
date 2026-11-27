import express from "express";

import { uploadStoreImages } from "../middleware/upload.middleware.js";

import {
  createStoreController,
  getMyStoreController,
  updateMyStoreController,
  uploadMyStoreImagesController,
} from "../controllers/store.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// Tất cả API bên dưới yêu cầu đăng nhập Seller
router.use(authenticate);
router.use(authorizeRoles("SELLER"));

router.post(
  "/my-store/images",
  uploadStoreImages,
  uploadMyStoreImagesController
);

// Tạo cửa hàng
router.post("/", createStoreController);

// Lấy thông tin cửa hàng của Seller
router.get("/my-store", getMyStoreController);

// Cập nhật thông tin cửa hàng
router.put("/my-store", updateMyStoreController);

export default router;