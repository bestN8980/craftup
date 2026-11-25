import {
  getMyOrders,
  getOrderById,
  cancelOrder,
  getSellerOrders,
  getSellerOrderById,
  updateSellerOrderStatus,
  getSellerRevenue,
  getSellerOrderStats,
} from "../services/order.service.js";

import { createNotification } from "../services/notification.service.js";

import Order from "../models/Order.js";
import Favorite from "../models/Favorite.js";
import { Op } from "sequelize";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const sendOrderNotification = async ({
  userId,
  title,
  message,
  type,
  orderId,
}) => {
  if (!userId) return;

  try {
    await createNotification({
      userId,
      title,
      message,
      type,
      link: `/orders/${orderId}`,
      metadata: {
        orderId,
      },
    });
  } catch (error) {
    console.error("Create order notification error:", error);
  }
};

export const getMyOrdersController = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status?.toUpperCase();

    // Kiểm tra phân trang
    if (
      !Number.isInteger(page) ||
      !Number.isInteger(limit) ||
      page < 1 ||
      limit < 1 ||
      limit > 50
    ) {
      return res.status(400).json({
        success: false,
        message: "Thông tin phân trang không hợp lệ",
      });
    }

    // Kiểm tra trạng thái
    if (status && !ORDER_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái đơn hàng không hợp lệ",
      });
    }

    const result = await getMyOrders({
      userId: req.user.id,
      page,
      limit,
      status,
    });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách đơn hàng thành công",
      data: result,
    });
  } catch (error) {
    console.error("Get my orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách đơn hàng",
    });
  }
};


export const getOrderByIdController = async (req, res) => {
  try {
    const orderId = Number(req.params.orderId);

    // Kiểm tra ID đơn hàng
    if (
      !Number.isSafeInteger(orderId) ||
      orderId < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "ID đơn hàng không hợp lệ",
      });
    }

    // Lấy chi tiết đơn hàng
    const order = await getOrderById({
      orderId,
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Lấy chi tiết đơn hàng thành công",
      data: order,
    });
  } catch (error) {
    console.error("Get order detail error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.statusCode
          ? error.message
          : "Không thể lấy chi tiết đơn hàng",
    });
  }
};


export const cancelOrderController = async (req, res) => {
  try {
    const orderId = Number(req.params.orderId);

    if (!Number.isSafeInteger(orderId) || orderId < 1) {
      return res.status(400).json({
        success: false,
        message: "ID đơn hàng không hợp lệ",
      });
    }

    const result = await cancelOrder({
      orderId,
      userId: req.user.id,
    });

    // Tìm cửa hàng để xác định Seller nhận thông báo
    const order = await Order.findByPk(orderId);
    const store = order
      ? await Store.findByPk(order.storeId)
      : null;

    // Thông báo cho Seller
    if (store?.userId) {
      await sendOrderNotification({
        userId: store.userId,
        title: "Đơn hàng đã bị hủy",
        message: `Khách hàng đã hủy đơn hàng ${result.orderNumber}.`,
        type: "ORDER_CANCELLED",
        orderId,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Hủy đơn hàng thành công",
      data: result,
    });
  } catch (error) {
    console.error("Cancel order error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Không thể hủy đơn hàng",
    });
  }
};


export const getSellerOrdersController = async (req, res) => {
  try {
    // Lấy thông tin phân trang
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    // Kiểm tra phân trang
    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Thông tin phân trang không hợp lệ",
      });
    }

    // Kiểm tra trạng thái nếu có truyền lên
    const allowedStatuses = [
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];

    const status = req.query.status;

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái đơn hàng không hợp lệ",
      });
    }

    // Gọi Service
    const result = await getSellerOrders({
      userId: req.user.id,
      page,
      limit,
      status,
    });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách đơn hàng của cửa hàng thành công",
      data: result,
    });
  } catch (error) {
    console.error("Get seller orders error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Không thể lấy danh sách đơn hàng",
    });
  }
};


export const getSellerOrderByIdController = async (req, res) => {
  try {
    const orderId = Number(req.params.orderId);

    if (!Number.isSafeInteger(orderId) || orderId < 1) {
      return res.status(400).json({
        success: false,
        message: "ID đơn hàng không hợp lệ",
      });
    }

    const order = await getSellerOrderById({
      orderId,
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Lấy chi tiết đơn hàng thành công",
      data: order,
    });
  } catch (error) {
    console.error("Get seller order detail error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Không thể lấy chi tiết đơn hàng",
    });
  }
};


export const updateSellerOrderStatusController = async (req, res) => {
  try {
    const orderId = Number(req.params.orderId);
    const { status } = req.body;

    if (!Number.isSafeInteger(orderId) || orderId < 1) {
      return res.status(400).json({
        success: false,
        message: "ID đơn hàng không hợp lệ",
      });
    }

    if (typeof status !== "string") {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp trạng thái đơn hàng",
      });
    }

    const normalizedStatus = status.trim().toUpperCase();

    const result = await updateSellerOrderStatus({
      orderId,
      userId: req.user.id,
      status: normalizedStatus,
    });

    // Nội dung thông báo theo từng trạng thái
    const notificationMessages = {
      CONFIRMED: {
        title: "Đơn hàng đã được xác nhận",
        message: `Đơn hàng ${result.orderNumber} đã được cửa hàng xác nhận.`,
      },
      PROCESSING: {
        title: "Đơn hàng đang được chuẩn bị",
        message: `Cửa hàng đang chuẩn bị đơn hàng ${result.orderNumber}.`,
      },
      SHIPPED: {
        title: "Đơn hàng đã được gửi đi",
        message: `Đơn hàng ${result.orderNumber} đã được bàn giao cho đơn vị vận chuyển.`,
      },
      DELIVERED: {
        title: "Đơn hàng đã giao thành công",
        message: `Đơn hàng ${result.orderNumber} đã được giao thành công.`,
      },
    };

    const notification = notificationMessages[normalizedStatus];

    if (notification) {
      // Tìm đơn hàng để lấy ID Customer
      const order = await Order.findByPk(orderId);

      if (order) {
        await sendOrderNotification({
          userId: order.userId,
          title: notification.title,
          message: notification.message,
          type: `ORDER_${normalizedStatus}`,
          orderId,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái đơn hàng thành công",
      data: result,
    });
  } catch (error) {
    console.error("Update seller order status error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Không thể cập nhật trạng thái đơn hàng",
    });
  }
};

// Seller: Thống kê doanh thu
export const getSellerRevenueController = async (req, res) => {
  try {
    const period = Number(req.query.period) || 7;

    // Kiểm tra khoảng thời gian
    if (![7, 30, 90].includes(period)) {
      return res.status(400).json({
        success: false,
        message: "Khoảng thời gian không hợp lệ",
      });
    }

    const result = await getSellerRevenue({
      userId: req.user.id,
      period,
    });

    return res.status(200).json({
      success: true,
      message: "Lấy thống kê doanh thu thành công",
      data: result,
    });
  } catch (error) {
    console.error("Get seller revenue error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Không thể lấy thống kê doanh thu",
    });
  }
};

export const getSellerOrderStatsController = async (req, res) => {
  try {
    const result = await getSellerOrderStats({
      userId: req.user.id,
      period: 7,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get seller order stats error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Không thể thống kê đơn hàng",
    });
  }
};

export const getCustomerStatsController = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log("========== CUSTOMER STATS ==========");
    console.log("User ID:", userId);

    const allOrders = await Order.findAll({
      where: { userId },
      attributes: ["id", "userId", "orderNumber", "status"],
      raw: true,
    });

    console.log("Orders found:", allOrders);

    const totalOrders = await Order.count({
      where: { userId },
    });

    const processingOrders = await Order.count({
      where: {
        userId,
        status: {
          [Op.in]: ["PENDING", "CONFIRMED", "PROCESSING"],
        },
      },
    });

    const favoriteProducts = await Favorite.count({
      where: { userId },
    });

    console.log("Total orders:", totalOrders);
    console.log("Processing orders:", processingOrders);
    console.log("====================================");

    return res.status(200).json({
      success: true,
      data: {
        totalOrders,
        processingOrders,
        favoriteProducts,
      },
    });
  } catch (error) {
    console.error("Get customer stats error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể lấy thống kê khách hàng",
    });
  }
};
