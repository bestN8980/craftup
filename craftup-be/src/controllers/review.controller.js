import {
  createReview,
  getProductReviews,
  replyToReview,
} from "../services/review.service.js";

// Customer tạo đánh giá
export const createReviewController = async (req, res) => {
  try {
    const { orderItemId, rating, comment } = req.body;

    // 1. Kiểm tra orderItemId
    const parsedOrderItemId = Number(orderItemId);

    if (
      !Number.isSafeInteger(parsedOrderItemId) ||
      parsedOrderItemId < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "ID sản phẩm trong đơn hàng không hợp lệ",
      });
    }

    // 2. Kiểm tra rating
    const parsedRating = Number(rating);

    if (
      !Number.isInteger(parsedRating) ||
      parsedRating < 1 ||
      parsedRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Điểm đánh giá phải từ 1 đến 5",
      });
    }

    // 3. Kiểm tra comment
    if (
      comment !== undefined &&
      comment !== null &&
      typeof comment !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Nội dung đánh giá không hợp lệ",
      });
    }

    if (typeof comment === "string" && comment.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Nội dung đánh giá không được vượt quá 1000 ký tự",
      });
    }

    // 4. Gọi Service
    const review = await createReview({
      userId: req.user.id,
      orderItemId: parsedOrderItemId,
      rating: parsedRating,
      comment,
    });

    return res.status(201).json({
      success: true,
      message: "Đánh giá sản phẩm thành công",
      data: review,
    });
  } catch (error) {
    console.error("Create review error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Không thể tạo đánh giá sản phẩm",
    });
  }
};


export const getProductReviewsController = async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    // Kiểm tra ID sản phẩm
    if (!Number.isSafeInteger(productId) || productId < 1) {
      return res.status(400).json({
        success: false,
        message: "ID sản phẩm không hợp lệ",
      });
    }

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

    const result = await getProductReviews({
      productId,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách đánh giá thành công",
      data: result,
    });
  } catch (error) {
    console.error("Get product reviews error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Không thể lấy danh sách đánh giá",
    });
  }
};


export const replyToReviewController = async (req, res, next) => {
  try {
    const reviewId = Number(req.params.reviewId);
    const { sellerReply } = req.body;

    // Kiểm tra reviewId
    if (!Number.isInteger(reviewId) || reviewId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID đánh giá không hợp lệ",
      });
    }

    // Kiểm tra nội dung phản hồi
    if (
      typeof sellerReply !== "string" ||
      !sellerReply.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Nội dung phản hồi không được để trống",
      });
    }

    if (sellerReply.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Nội dung phản hồi không được vượt quá 2000 ký tự",
      });
    }

    const review = await replyToReview({
      reviewId,
      userId: req.user.id,
      sellerReply,
    });

    return res.status(200).json({
      success: true,
      message: "Phản hồi đánh giá thành công",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};
