
import express from "express";

import {
  getAllProducts,
  getSellerProductsController,
  getProductDetail,
  createNewProduct,
  updateExistingProduct,
  deleteExistingProduct,
  publishExistingProduct,
  uploadProductImagesController,
  deleteProductImageController,
  setPrimaryProductImageController,
} from "../controllers/product.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { uploadProductImages } from "../middleware/upload.middleware.js";

const router = express.Router();

// PUBLIC ROUTES

// Lấy danh sách sản phẩm
router.get("/", getAllProducts);

router.get(
  "/seller",
  authenticate,
  authorizeRoles("SELLER"),
  getSellerProductsController
);

// Upload ảnh sản phẩm - Seller
router.post(
  "/:id/images",
  authenticate,
  authorizeRoles("SELLER"),
  uploadProductImages,
  uploadProductImagesController
);

// Xem chi tiết sản phẩm
router.get("/:id", getProductDetail);

// PROTECTED ROUTES

// Tạo sản phẩm - Seller và Admin
router.post(
  "/",
  authenticate,
  authorizeRoles("SELLER", "ADMIN"),
  createNewProduct
);

// Cập nhật sản phẩm - Seller và Admin
router.put(
  "/:id",
  authenticate,
  authorizeRoles("SELLER", "ADMIN"),
  updateExistingProduct
);

// Xóa sản phẩm - Seller và Admin
router.delete(
  "/:id",
  authenticate,
  authorizeRoles("SELLER", "ADMIN"),
  deleteExistingProduct
);

// Xuất bản sản phẩm
router.patch(
  "/:id/publish",
  authenticate,
  authorizeRoles("SELLER"),
  publishExistingProduct
);

// Xóa ảnh sản phẩm - Seller
router.delete(
  "/:id/images/:imageId",
  authenticate,
  authorizeRoles("SELLER"),
  deleteProductImageController
);

// Chọn ảnh chính - Seller
router.patch(
  "/:id/images/:imageId/primary",
  authenticate,
  authorizeRoles("SELLER"),
  setPrimaryProductImageController
);

export default router;
