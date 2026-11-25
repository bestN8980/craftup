
import express from "express";

import { authenticate } from "../middleware/auth.middleware.js";

import {
  getAddressesController,
  createAddressController,
  updateAddressController,
  setDefaultAddressController,
  deleteAddressController,
} from "../controllers/address.controller.js";

const router = express.Router();

// Tất cả API địa chỉ đều yêu cầu đăng nhập
router.use(authenticate);

// Lấy danh sách địa chỉ
router.get("/", getAddressesController);

// Thêm địa chỉ
router.post("/", createAddressController);

// Cập nhật địa chỉ
router.put("/:id", updateAddressController);

// Đặt địa chỉ mặc định
router.patch("/:id/default", setDefaultAddressController);

// Xóa địa chỉ
router.delete("/:id", deleteAddressController);

export default router;
