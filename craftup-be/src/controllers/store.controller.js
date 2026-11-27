import {
  createStore,
  getMyStore,
  updateMyStore,
  uploadMyStoreImages,
} from "../services/store.service.js";

// ======================================
// TẠO CỬA HÀNG
// ======================================

export const createStoreController = async (req, res) => {
  try {
    const store = await createStore(
      req.user.id,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Tạo cửa hàng thành công",
      data: store,
    });
  } catch (error) {
    console.error("Create store error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Không thể tạo cửa hàng",
    });
  }
};

// ======================================
// LẤY CỬA HÀNG CỦA SELLER
// ======================================

export const getMyStoreController = async (req, res) => {
  try {
    const store = await getMyStore(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Lấy thông tin cửa hàng thành công",
      data: store,
    });
  } catch (error) {
    console.error("Get my store error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Không thể lấy thông tin cửa hàng",
    });
  }
};

// ======================================
// CẬP NHẬT CỬA HÀNG
// ======================================

export const updateMyStoreController = async (req, res) => {
  try {
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Bạn chưa cung cấp thông tin cần cập nhật",
      });
    }

    const store = await updateMyStore(
      req.user.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Cập nhật cửa hàng thành công",
      data: store,
    });
  } catch (error) {
    console.error("Update my store error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Không thể cập nhật cửa hàng",
    });
  }
};

export const uploadMyStoreImagesController = async (req, res) => {
  try {
    const store = await uploadMyStoreImages(
      req.user.id,
      req.files
    );

    return res.status(200).json({
      success: true,
      message: "Upload ảnh cửa hàng thành công",
      data: {
        logoUrl: store.logoUrl,
        logoPublicId: store.logoPublicId,
        bannerUrl: store.bannerUrl,
        bannerPublicId: store.bannerPublicId,
      },
    });
  } catch (error) {
    console.error("Upload store images error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Không thể upload ảnh cửa hàng",
    });
  }
};