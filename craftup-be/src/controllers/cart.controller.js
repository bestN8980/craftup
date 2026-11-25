import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
} from "../services/cart.service.js";

// Thêm sản phẩm vào giỏ hàng
export const addToCartController = async (req, res) => {
  try {
    const productId = Number(req.body.productId);
    const quantity = Number(req.body.quantity);

    if (
      !Number.isSafeInteger(productId) ||
      productId < 1 ||
      !Number.isSafeInteger(quantity) ||
      quantity < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "productId và quantity phải là số nguyên dương",
      });
    }

    const result = await addToCart({
      userId: req.user.id,
      productId,
      quantity,
    });

    return res.status(200).json({
      success: true,
      message: "Thêm sản phẩm vào giỏ hàng thành công",
      data: result,
    });
  } catch (error) {
    console.error("Add to cart error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Không thể thêm sản phẩm vào giỏ hàng",
    });
  }
};

// Lấy giỏ hàng
export const getCartController = async (req, res) => {
  try {
    const result = await getCart(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Lấy giỏ hàng thành công",
      data: result,
    });
  } catch (error) {
    console.error("Get cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể lấy giỏ hàng",
    });
  }
};


export const updateCartItemController = async (req, res) => {
  try {
    const itemId = Number(req.params.itemId);
    const quantity = Number(req.body.quantity);

    if (
      !Number.isSafeInteger(itemId) ||
      itemId < 1 ||
      !Number.isSafeInteger(quantity) ||
      quantity < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "itemId và quantity phải là số nguyên dương",
      });
    }

    const result = await updateCartItem({
      userId: req.user.id,
      itemId,
      quantity,
    });

    return res.status(200).json({
      success: true,
      message: "Cập nhật giỏ hàng thành công",
      data: result,
    });
  } catch (error) {
    console.error("Update cart item error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Không thể cập nhật giỏ hàng",
    });
  }
};


export const removeCartItemController = async (req, res) => {
  try {
    const itemId = Number(req.params.itemId);

    if (!Number.isSafeInteger(itemId) || itemId < 1) {
      return res.status(400).json({
        success: false,
        message: "itemId không hợp lệ",
      });
    }

    const result = await removeCartItem({
      userId: req.user.id,
      itemId,
    });

    return res.status(200).json({
      success: true,
      message: "Xóa sản phẩm khỏi giỏ hàng thành công",
      data: result,
    });
  } catch (error) {
    console.error("Remove cart item error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Không thể xóa sản phẩm khỏi giỏ hàng",
    });
  }
};