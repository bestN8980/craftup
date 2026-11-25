
import {
  getAddresses,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
} from "../services/address.service.js";

const validateAddress = (data) => {
  const requiredFields = [
    "recipientName",
    "phone",
    "province",
    "district",
    "ward",
    "streetAddress",
  ];

  for (const field of requiredFields) {
    if (
      typeof data[field] !== "string" ||
      !data[field].trim()
    ) {
      return `Trường ${field} không được để trống`;
    }
  }

  if (!/^[0-9]{10,11}$/.test(data.phone.trim())) {
    return "Số điện thoại phải gồm 10 hoặc 11 chữ số";
  }

  if (
    data.isDefault !== undefined &&
    typeof data.isDefault !== "boolean"
  ) {
    return "isDefault phải là true hoặc false";
  }

  return null;
};

// GET /api/addresses
export const getAddressesController = async (req, res) => {
  try {
    const addresses = await getAddresses(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách địa chỉ thành công",
      data: addresses,
    });
  } catch (error) {
    console.error("Get addresses error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách địa chỉ",
    });
  }
};

// POST /api/addresses
export const createAddressController = async (req, res) => {
  try {
    const validationError = validateAddress(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const address = await createAddress(req.user.id, req.body);

    return res.status(201).json({
      success: true,
      message: "Thêm địa chỉ thành công",
      data: address,
    });
  } catch (error) {
    console.error("Create address error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể thêm địa chỉ",
    });
  }
};

// PUT /api/addresses/:id
export const updateAddressController = async (req, res) => {
  try {
    const addressId = Number(req.params.id);

    if (!Number.isSafeInteger(addressId) || addressId < 1) {
      return res.status(400).json({
        success: false,
        message: "ID địa chỉ không hợp lệ",
      });
    }

    const validationError = validateAddress(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const address = await updateAddress(
      req.user.id,
      addressId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Cập nhật địa chỉ thành công",
      data: address,
    });
  } catch (error) {
    console.error("Update address error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Không thể cập nhật địa chỉ",
    });
  }
};

// PATCH /api/addresses/:id/default
export const setDefaultAddressController = async (req, res) => {
  try {
    const addressId = Number(req.params.id);

    if (!Number.isSafeInteger(addressId) || addressId < 1) {
      return res.status(400).json({
        success: false,
        message: "ID địa chỉ không hợp lệ",
      });
    }

    const address = await setDefaultAddress(
      req.user.id,
      addressId
    );

    return res.status(200).json({
      success: true,
      message: "Đặt địa chỉ mặc định thành công",
      data: address,
    });
  } catch (error) {
    console.error("Set default address error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Không thể đặt địa chỉ mặc định",
    });
  }
};

// DELETE /api/addresses/:id
export const deleteAddressController = async (req, res) => {
  try {
    const addressId = Number(req.params.id);

    if (!Number.isSafeInteger(addressId) || addressId < 1) {
      return res.status(400).json({
        success: false,
        message: "ID địa chỉ không hợp lệ",
      });
    }

    const result = await deleteAddress(req.user.id, addressId);

    return res.status(200).json({
      success: true,
      message: "Xóa địa chỉ thành công",
      data: result,
    });
  } catch (error) {
    console.error("Delete address error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Không thể xóa địa chỉ",
    });
  }
};
