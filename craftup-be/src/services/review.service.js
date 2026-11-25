import {
  Review,
  OrderItem,
  Order,
  Product,
  User,
} from "../models/index.js";

// Tạo lỗi nghiệp vụ
const createReviewError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Customer đánh giá sản phẩm
export const createReview = async ({
  userId,
  orderItemId,
  rating,
  comment,
}) => {
  // 1. Kiểm tra số sao
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw createReviewError("Điểm đánh giá phải từ 1 đến 5");
  }

  // 2. Tìm sản phẩm trong đơn hàng đã giao thành công
  const orderItem = await OrderItem.findOne({
    where: {
      id: orderItemId,
    },
    include: [
      {
        model: Order,
        as: "order",
        where: {
          userId,
          status: "DELIVERED",
        },
        required: true,
      },
    ],
  });

  if (!orderItem) {
    throw createReviewError(
      "Bạn chỉ có thể đánh giá sản phẩm trong đơn hàng đã nhận"
    );
  }

  // 3. Kiểm tra đã đánh giá sản phẩm này trong đơn hàng chưa
  const existingReview = await Review.findOne({
    where: {
      orderItemId,
    },
  });

  if (existingReview) {
    throw createReviewError(
      "Bạn đã đánh giá sản phẩm này trong đơn hàng",
      409
    );
  }

  // 4. Tạo đánh giá
  try {
    const review = await Review.create({
      userId,
      productId: orderItem.productId,
      orderItemId,
      rating,
      comment: comment?.trim() || null,
    });

    return review;
  } catch (error) {
    // Xử lý trường hợp hai yêu cầu đánh giá được gửi đồng thời
    if (error.name === "SequelizeUniqueConstraintError") {
      throw createReviewError(
        "Bạn đã đánh giá sản phẩm này trong đơn hàng",
        409
      );
    }

    throw error;
  }
};


export const getProductReviews = async ({
  productId,
  page = 1,
  limit = 10,
}) => {
  // 1. Kiểm tra sản phẩm tồn tại
  const product = await Product.findByPk(productId);

  if (!product) {
    const error = new Error("Không tìm thấy sản phẩm");
    error.statusCode = 404;
    throw error;
  }

  // 2. Phân trang
  const offset = (page - 1) * limit;

  // 3. Lấy danh sách đánh giá
  const { count, rows } = await Review.findAndCountAll({
    where: {
      productId,
    },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "fullName", "avatarUrl"],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
    distinct: true,
  });

  // 4. Tính điểm đánh giá trung bình
  const ratingStats = await Review.findOne({
    where: {
      productId,
    },
    attributes: [
      [
        Review.sequelize.fn(
          "AVG",
          Review.sequelize.col("rating")
        ),
        "averageRating",
      ],
      [
        Review.sequelize.fn(
          "COUNT",
          Review.sequelize.col("id")
        ),
        "totalReviews",
      ],
    ],
    raw: true,
  });

  
  // 5. Thống kê số lượng đánh giá theo số sao
  const ratingDistribution = await Review.findAll({
    where: {
      productId,
    },
    attributes: [
      "rating",
      [
        Review.sequelize.fn(
          "COUNT",
          Review.sequelize.col("id")
        ),
        "count",
      ],
    ],
    group: ["rating"],
    raw: true,
  });

  // Khởi tạo đủ 5 mức sao
  const ratingBreakdown = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  // Gán số lượng thực tế
  for (const item of ratingDistribution) {
    ratingBreakdown[item.rating] = Number(item.count);
  }

  return {
    productId,
    averageRating: Number(
      Number(ratingStats.averageRating || 0).toFixed(1)
    ),
    totalReviews: Number(ratingStats.totalReviews || 0),
    ratingBreakdown,
    reviews: rows,
    pagination: {
      totalItems: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      limit,
    },
  };

};


export const replyToReview = async ({
  reviewId,
  userId,
  sellerReply,
}) => {
  const { Review, Product, Store } = await import("../models/index.js");

  // 1. Kiểm tra đánh giá có tồn tại không
  const review = await Review.findByPk(reviewId);

  if (!review || !review.isVisible) {
    const error = new Error("Không tìm thấy đánh giá");
    error.statusCode = 404;
    throw error;
  }

  // 2. Tìm cửa hàng của người bán
  const store = await Store.findOne({
    where: { userId },
  });

  if (!store) {
    const error = new Error("Bạn chưa có cửa hàng");
    error.statusCode = 403;
    throw error;
  }

  // 3. Kiểm tra sản phẩm có thuộc cửa hàng không
  const product = await Product.findOne({
    where: {
      id: review.productId,
      storeId: store.id,
    },
  });

  if (!product) {
    const error = new Error(
      "Bạn không có quyền phản hồi đánh giá này"
    );
    error.statusCode = 403;
    throw error;
  }

  // 4. Không cho phép phản hồi lần thứ hai
  if (review.sellerReply) {
    const error = new Error(
      "Đánh giá này đã được người bán phản hồi"
    );
    error.statusCode = 409;
    throw error;
  }

  // 5. Lưu phản hồi
  review.sellerReply = sellerReply.trim();
  review.sellerRepliedAt = new Date();

  await review.save();

  return review;
};
