import {
  getProducts,
  getSellerProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  publishProduct,
  uploadProductImages,
  deleteProductImage,
  setPrimaryProductImage,
} from "../services/product.service.js";

import {
  getProductsSchema,
  createProductSchema,
  updateProductSchema,
} from "../utils/product-validation.js";

// Lấy danh sách sản phẩm
export const getAllProducts = async (req, res) => {
  try {
    // Kiểm tra query parameters
    const validation = getProductsSchema.safeParse(req.query);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Tham số tìm kiếm không hợp lệ",
        errors: validation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    // Gọi Service
    const result = await getProducts(validation.data);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách sản phẩm thành công",
      data: result.products,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách sản phẩm",
    });
  }
};

// Lấy chi tiết sản phẩm
export const getProductDetail = async (req, res) => {
  try {
    const productId = Number(req.params.id);

    if (!Number.isSafeInteger(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID sản phẩm không hợp lệ",
      });
    }

    const product = await getProductById(productId);

    return res.status(200).json({
      success: true,
      message: "Lấy thông tin sản phẩm thành công",
      data: product,
    });
  } catch (error) {
    if (error.message === "Không tìm thấy sản phẩm") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Get product detail error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể lấy thông tin sản phẩm",
    });
  }
};


// Tạo sản phẩm mới
export const createNewProduct = async (req, res) => {
  try {
    const validation = createProductSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu sản phẩm không hợp lệ",
        errors: validation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const product = await createProduct(
      validation.data,
      req.user.id
    );

    return res.status(201).json({
      success: true,
      message: "Tạo sản phẩm thành công",
      data: product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Không thể tạo sản phẩm",
    });
  }
};

// Cập nhật sản phẩm
export const updateExistingProduct = async (req, res) => {
  try {
    const productId = Number(req.params.id);

    if (!Number.isSafeInteger(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID sản phẩm không hợp lệ",
      });
    }

    const validation = updateProductSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu cập nhật không hợp lệ",
        errors: validation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    if (Object.keys(validation.data).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Bạn chưa cung cấp thông tin cần cập nhật",
      });
    }

    const product = await updateProduct(
      productId,
      validation.data,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Cập nhật sản phẩm thành công",
      data: product,
    });
  } catch (error) {
    console.error("Update product error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Không thể cập nhật sản phẩm",
    });
  }
};

// Xóa sản phẩm
export const deleteExistingProduct = async (req, res) => {
  try {
    const productId = Number(req.params.id);

    if (!Number.isSafeInteger(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID sản phẩm không hợp lệ",
      });
    }

    await deleteProduct(productId, req.user.id);

    return res.status(200).json({
      success: true,
      message: "Xóa sản phẩm thành công",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Không thể xóa sản phẩm",
    });
  }
};

export const publishExistingProduct = async (req, res) => {
  try {
    const productId = Number(req.params.id);

    if (!Number.isSafeInteger(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID sản phẩm không hợp lệ",
      });
    }

    const product = await publishProduct(
      productId,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Xuất bản sản phẩm thành công",
      data: product,
    });
  } catch (error) {
    console.error("Publish product error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Không thể xuất bản sản phẩm",
    });
  }
};


// Upload ảnh cho sản phẩm
export const uploadProductImagesController = async (req, res) => {
  try {
    const productId = Number(req.params.id);

    if (!Number.isSafeInteger(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID sản phẩm không hợp lệ",
      });
    }

    const images = await uploadProductImages(
      productId,
      req.files,
      req.user.id
    );

    return res.status(201).json({
      success: true,
      message: "Upload ảnh sản phẩm thành công",
      data: images,
    });
  } catch (error) {
    console.error("Upload product images error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Không thể upload ảnh sản phẩm",
    });
  }
};


// Xóa ảnh sản phẩm
export const deleteProductImageController = async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const imageId = Number(req.params.imageId);

    if (
      !Number.isSafeInteger(productId) ||
      productId <= 0 ||
      !Number.isSafeInteger(imageId) ||
      imageId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "ID sản phẩm hoặc ID ảnh không hợp lệ",
      });
    }

    const result = await deleteProductImage(
      productId,
      imageId,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Xóa ảnh sản phẩm thành công",
      data: result,
    });
  } catch (error) {
    console.error("Delete product image error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Không thể xóa ảnh sản phẩm",
    });
  }
};


// Chọn ảnh chính cho sản phẩm
export const setPrimaryProductImageController = async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const imageId = Number(req.params.imageId);

    if (
      !Number.isSafeInteger(productId) ||
      productId <= 0 ||
      !Number.isSafeInteger(imageId) ||
      imageId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "ID sản phẩm hoặc ID ảnh không hợp lệ",
      });
    }

    const image = await setPrimaryProductImage(
      productId,
      imageId,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Đặt ảnh chính thành công",
      data: image,
    });
  } catch (error) {
    console.error("Set primary product image error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Không thể đặt ảnh chính",
    });
  }
};


export const getSellerProductsController = async (req, res) => {
  try {
    const result = await getSellerProducts(
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách sản phẩm của cửa hàng thành công",
      data: result.products,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Get seller products error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Không thể lấy danh sách sản phẩm của cửa hàng",
    });
  }
};
