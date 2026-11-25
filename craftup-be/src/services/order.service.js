import {
  Order,
  Store,
  OrderItem,
  Product,
  User,
} from "../models/index.js";

import { Op, fn, col, literal } from "sequelize";

// Lấy danh sách đơn hàng của khách hàng
export const getMyOrders = async ({
  userId,
  page = 1,
  limit = 10,
  status,
}) => {
  const where = { userId };

  if (status) {
    where.status = status;
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await Order.findAndCountAll({
    where,
    include: [
      {
        model: Store,
        as: "store",
        attributes: ["id", "storeName", "logoUrl"],
      },
      {
        model: OrderItem,
        as: "items",
        attributes: [
          "id",
          "productId",
          "productName",
          "unitPrice",
          "quantity",
          "subtotal",
        ],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
    distinct: true,
  });

  return {
    orders: rows,
    pagination: {
      totalItems: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      limit,
    },
  };
};

// Lấy chi tiết một đơn hàng
export const getOrderById = async ({ orderId, userId }) => {
  const order = await Order.findOne({
    where: {
      id: orderId,
      userId,
    },
    include: [
      {
        model: Store,
        as: "store",
        attributes: [
          "id",
          "storeName",
          "logoUrl",
          "address",
        ],
      },
      {
        model: OrderItem,
        as: "items",
        attributes: [
          "id",
          "productId",
          "productName",
          "unitPrice",
          "quantity",
          "subtotal",
        ],
      },
    ],
  });

  if (!order) {
    const error = new Error("Không tìm thấy đơn hàng");
    error.statusCode = 404;
    throw error;
  }

  return order;
};

// Hủy đơn hàng
export const cancelOrder = async ({ orderId, userId }) => {
  return Order.sequelize.transaction(async (transaction) => {
    // 1. Tìm đơn hàng thuộc khách hàng
    const order = await Order.findOne({
      where: {
        id: orderId,
        userId,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!order) {
      const error = new Error("Không tìm thấy đơn hàng");
      error.statusCode = 404;
      throw error;
    }

    // 2. Chỉ cho phép hủy đơn PENDING
    if (order.status !== "PENDING") {
      const error = new Error(
        "Chỉ có thể hủy đơn hàng đang chờ xác nhận"
      );
      error.statusCode = 400;
      throw error;
    }

    // 3. Lấy danh sách sản phẩm trong đơn hàng
    const orderItems = await OrderItem.findAll({
      where: {
        orderId: order.id,
      },
      transaction,
    });

    if (!orderItems.length) {
      const error = new Error(
        "Đơn hàng không có sản phẩm để hoàn kho"
      );
      error.statusCode = 400;
      throw error;
    }

    // 4. Hoàn lại số lượng sản phẩm vào kho
    for (const item of orderItems) {
      const product = await Product.findByPk(item.productId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!product) {
        const error = new Error(
          `Không tìm thấy sản phẩm có ID ${item.productId}`
        );
        error.statusCode = 409;
        throw error;
      }

      await product.increment("stock", {
        by: Number(item.quantity),
        transaction,
      });
    }

    // 5. Cập nhật trạng thái đơn hàng
    await order.update(
      {
        status: "CANCELLED",
      },
      { transaction }
    );

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      message: "Đơn hàng đã được hủy và tồn kho đã được hoàn lại",
    };
  });
};


// Lấy danh sách đơn hàng của Seller
export const getSellerOrders = async ({
  userId,
  page = 1,
  limit = 10,
  status,
}) => {
  // 1. Tìm cửa hàng thuộc Seller đang đăng nhập
  const store = await Store.findOne({
    where: { userId },
  });

  if (!store) {
    const error = new Error("Bạn chưa có cửa hàng");
    error.statusCode = 404;
    throw error;
  }

  // 2. Điều kiện tìm kiếm đơn hàng
  const where = {
    storeId: store.id,
  };

  if (status) {
    where.status = status;
  }

  // 3. Phân trang
  const offset = (page - 1) * limit;

  // 4. Lấy danh sách đơn hàng
  const { count, rows } = await Order.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: "customer",
        attributes: ["id", "fullName", "phone", "email"],
      },
      {
        model: OrderItem,
        as: "items",
        attributes: [
          "id",
          "productId",
          "productName",
          "unitPrice",
          "quantity",
          "subtotal",
        ],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
    distinct: true,
  });

  return {
    orders: rows,
    pagination: {
      totalItems: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      limit,
    },
  };
};



export const getSellerOrderById = async ({
  orderId,
  userId,
}) => {
  // 1. Tìm cửa hàng của Seller
  const store = await Store.findOne({
    where: { userId },
  });

  if (!store) {
    const error = new Error("Bạn chưa có cửa hàng");
    error.statusCode = 404;
    throw error;
  }

  // 2. Tìm đơn hàng thuộc cửa hàng
  const order = await Order.findOne({
    where: {
      id: orderId,
      storeId: store.id,
    },
    include: [
      {
        model: User,
        as: "customer",
        attributes: [
          "id",
          "fullName",
          "phone",
          "email",
        ],
      },
      {
        model: Store,
        as: "store",
        attributes: [
          "id",
          "storeName",
          "logoUrl",
          "address",
        ],
      },
      {
        model: OrderItem,
        as: "items",
        attributes: [
          "id",
          "productId",
          "productName",
          "unitPrice",
          "quantity",
          "subtotal",
        ],
      },
    ],
  });

  if (!order) {
    const error = new Error("Không tìm thấy đơn hàng");
    error.statusCode = 404;
    throw error;
  }

  return order;
};


export const updateSellerOrderStatus = async ({
  orderId,
  userId,
  status,
}) => {
  return Order.sequelize.transaction(async (transaction) => {
    // 1. Tìm cửa hàng của Seller
    const store = await Store.findOne({
      where: { userId },
      transaction,
    });

    if (!store) {
      const error = new Error("Bạn chưa có cửa hàng");
      error.statusCode = 404;
      throw error;
    }

    // 2. Tìm đơn hàng thuộc cửa hàng
    const order = await Order.findOne({
      where: {
        id: orderId,
        storeId: store.id,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!order) {
      const error = new Error("Không tìm thấy đơn hàng");
      error.statusCode = 404;
      throw error;
    }

    // 3. Quy định trạng thái tiếp theo
    const allowedTransitions = {
      PENDING: "CONFIRMED",
      CONFIRMED: "PROCESSING",
      PROCESSING: "SHIPPED",
      SHIPPED: "DELIVERED",
    };

    const nextStatus = allowedTransitions[order.status];

    // 4. Kiểm tra chuyển trạng thái
    if (!nextStatus || status !== nextStatus) {
      const error = new Error(
        `Không thể chuyển từ ${order.status} sang ${status}`
      );
      error.statusCode = 400;
      throw error;
    }

    // 5. Cập nhật trạng thái
    await order.update(
      { status },
      { transaction }
    );

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      previousStatus: allowedTransitions[order.status] 
        ? Object.keys(allowedTransitions).find(
            (key) => allowedTransitions[key] === status
          )
        : null,
      status: order.status,
    };
  });
};

// Thống kê doanh thu của Seller
export const getSellerRevenue = async ({
  userId,
  period = 7,
}) => {
  // 1. Tìm cửa hàng của Seller
  const store = await Store.findOne({
    where: { userId },
  });

  if (!store) {
    const error = new Error("Bạn chưa có cửa hàng");
    error.statusCode = 404;
    throw error;
  }

  // 2. Xác định khoảng thời gian
  const endDate = new Date();
  const startDate = new Date();

  startDate.setDate(startDate.getDate() - period + 1);
  startDate.setHours(0, 0, 0, 0);

  const previousEndDate = new Date(startDate);
  previousEndDate.setMilliseconds(-1);

  const previousStartDate = new Date(previousEndDate);
  previousStartDate.setDate(
    previousStartDate.getDate() - period + 1
  );
  previousStartDate.setHours(0, 0, 0, 0);

  // 3. Điều kiện thống kê
  const baseWhere = {
    storeId: store.id,
    status: "DELIVERED",
  };

  // 4. Doanh thu kỳ hiện tại
  const currentOrders = await Order.findAll({
    where: {
      ...baseWhere,
      createdAt: {
        [Op.between]: [startDate, endDate],
      },
    },
    attributes: [
      [fn("DATE", col("created_at")), "date"],
      [fn("SUM", col("total_amount")), "revenue"],
    ],
    group: [literal("DATE(created_at)")],
    order: [[literal("DATE(created_at)"), "ASC"]],
    raw: true,
  });

  // 5. Doanh thu kỳ trước
  const previousRevenue = await Order.sum("totalAmount", {
    where: {
      ...baseWhere,
      createdAt: {
        [Op.between]: [previousStartDate, previousEndDate],
      },
    },
  });

  // 6. Tổng doanh thu kỳ hiện tại
  const totalRevenue = currentOrders.reduce(
    (sum, item) => sum + Number(item.revenue || 0),
    0
  );

  const oldRevenue = Number(previousRevenue || 0);

  // 7. Tính phần trăm tăng trưởng
  let growth = 0;

  if (oldRevenue > 0) {
    growth = ((totalRevenue - oldRevenue) / oldRevenue) * 100;
  } else if (totalRevenue > 0) {
    growth = 100;
  }

  // 8. Tạo dữ liệu đủ ngày cho biểu đồ
  const chartData = [];

  for (let i = 0; i < period; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    const dateString = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");

    const found = currentOrders.find(
      (item) =>
        new Date(item.date).toISOString().slice(0, 10) ===
        dateString
    );

    chartData.push({
      date: dateString,
      revenue: Number(found?.revenue || 0),
    });
  }

  return {
    period,
    totalRevenue,
    previousRevenue: oldRevenue,
    growth: Number(growth.toFixed(2)),
    chartData,
  };
};

// Thống kê số đơn hàng của Seller trong 7 ngày
export const getSellerOrderStats = async ({
  userId,
  period = 7,
}) => {
  const store = await Store.findOne({
    where: { userId },
  });

  if (!store) {
    const error = new Error("Bạn chưa có cửa hàng");
    error.statusCode = 404;
    throw error;
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - period + 1);
  startDate.setHours(0, 0, 0, 0);

  const totalOrders = await Order.count({
    where: {
      storeId: store.id,
      createdAt: {
        [Op.gte]: startDate,
        [Op.lte]: new Date(),
      },
    },
  });

  return {
    period,
    totalOrders,
  };
};