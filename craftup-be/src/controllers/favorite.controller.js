
import {
  getFavorites,
  addFavorite,
  removeFavorite,
} from "../services/favorite.service.js";

// ======================================
// 1. LẤY DANH SÁCH YÊU THÍCH
// ======================================

export const getFavoritesController = async (req, res) => {
  try {
    const result = await getFavorites(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách yêu thích thành công",
      data: result,
    });
  } catch (error) {
    console.error("Get favorites error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Không thể lấy danh sách yêu thích",
    });
  }
};

// ======================================
// 2. THÊM SẢN PHẨM YÊU THÍCH
// ======================================

export const addFavoriteController = async (req, res) => {
  try {
    const productId = Number(req.body.productId);

    if (
      !Number.isSafeInteger(productId) ||
      productId < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "productId phải là số nguyên dương",
      });
    }

    const result = await addFavorite({
      userId: req.user.id,
      productId,
    });

    return res.status(200).json({
      success: true,
      message: result.created
        ? "Thêm sản phẩm vào yêu thích thành công"
        : "Sản phẩm đã có trong danh sách yêu thích",
      data: result,
    });
  } catch (error) {
    console.error("Add favorite error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Không thể thêm sản phẩm yêu thích",
    });
  }
};

// ======================================
// 3. XÓA SẢN PHẨM YÊU THÍCH
// ======================================

export const removeFavoriteController = async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    if (
      !Number.isSafeInteger(productId) ||
      productId < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "productId không hợp lệ",
      });
    }

    const result = await removeFavorite({
      userId: req.user.id,
      productId,
    });

    return res.status(200).json({
      success: true,
      message: "Xóa sản phẩm khỏi danh sách yêu thích thành công",
      data: result,
    });
  } catch (error) {
    console.error("Remove favorite error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Không thể xóa sản phẩm yêu thích",
    });
  }
};
