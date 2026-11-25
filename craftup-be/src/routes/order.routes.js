
import express from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import {
  getMyOrdersController,
  getOrderByIdController,
  cancelOrderController,
  getSellerOrdersController,
  getSellerOrderByIdController,
  updateSellerOrderStatusController,
  getSellerRevenueController,
  getSellerOrderStatsController,
  getCustomerStatsController, // Thêm dòng này
} from "../controllers/order.controller.js";

import { checkoutController } from "../controllers/checkout.controller.js";

const router = express.Router();

// Lấy danh sách đơn hàng
router.get(
  "/my-orders",
  authenticate,
  getMyOrdersController
);

// Checkout
router.post(
  "/checkout",
  authenticate,
  checkoutController
);

// Seller: Lấy danh sách đơn hàng của cửa hàng
router.get(
  "/seller",
  authenticate,
  getSellerOrdersController
);

// Seller: Thống kê doanh thu
router.get(
  "/seller/revenue",
  authenticate,
  getSellerRevenueController
);

router.get(
  "/seller/stats",
  authenticate,
  getSellerOrderStatsController
);

// Thống kê dành cho Customer
router.get(
  "/customer/stats",
  authenticate,
  getCustomerStatsController
);

router.get(
  "/seller/:orderId",
  authenticate,
  getSellerOrderByIdController
);

router.patch(
  "/seller/:orderId/status",
  authenticate,
  updateSellerOrderStatusController
);

// Lấy chi tiết đơn hàng
router.get(
  "/:orderId",
  authenticate,
  getOrderByIdController
);

// Hủy đơn hàng
router.patch(
  "/:orderId/cancel",
  authenticate,
  cancelOrderController
);

export default router;  