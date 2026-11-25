import { checkout } from "../services/checkout.service.js";
import { Store } from "../models/index.js";
import { createNotification } from "../services/notification.service.js";

export const checkoutController = async (req, res) => {
  try {
    const {
      addressId,
      paymentMethod,
      note,
    } = req.body || {};

    // 1. Kiểm tra addressId
    const parsedAddressId = Number(addressId);

    if (
      !Number.isSafeInteger(parsedAddressId) ||
      parsedAddressId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Địa chỉ giao hàng không hợp lệ",
      });
    }

    // 2. Kiểm tra phương thức thanh toán
    const allowedPaymentMethods = [
      "COD",
      "BANK_TRANSFER",
    ];

    if (
      typeof paymentMethod !== "string" ||
      !allowedPaymentMethods.includes(paymentMethod)
    ) {
      return res.status(400).json({
        success: false,
        message: "Phương thức thanh toán không hợp lệ",
      });
    }

    // 3. Kiểm tra ghi chú
    if (
      note !== undefined &&
      typeof note !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Ghi chú không hợp lệ",
      });
    }

    const cleanNote = note?.trim() || "";

    if (cleanNote.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Ghi chú không được vượt quá 1000 ký tự",
      });
    }

    // 4. Xử lý đặt hàng
    const result = await checkout({
      userId: req.user.id,
      addressId: parsedAddressId,
      paymentMethod,
      note: cleanNote,
    });

    // 5. Gửi thông báo cho Seller của từng cửa hàng
    for (const order of result.orders) {
      try {
        const store = await Store.findByPk(order.storeId);

        if (!store?.userId) continue;

        await createNotification({
          userId: store.userId,
          title: "Bạn có đơn hàng mới",
          message: `Bạn vừa nhận được đơn hàng ${order.orderNumber}. Vui lòng kiểm tra và xác nhận đơn hàng.`,
          type: "ORDER_NEW",
          link: `/seller/orders/${order.id}`,
          metadata: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            storeId: order.storeId,
            customerId: req.user.id,
          },
        });
      } catch (notificationError) {
        // Lỗi thông báo không được làm ảnh hưởng đến đơn hàng
        console.error(
          `Notification error for order ${order.id}:`,
          notificationError
        );
      }
    }

    // 6. Trả kết quả
    return res.status(201).json({
      success: true,
      message: "Đặt hàng thành công",
      data: result,
    });
  } catch (error) {
    console.error("Checkout error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Không thể đặt hàng. Vui lòng thử lại sau.",
    });
  }
};