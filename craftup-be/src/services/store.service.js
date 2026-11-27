import { Store } from "../models/index.js";
import {
  uploadStoreImageToCloudinary,
  deleteImageFromCloudinary,
} from "../services/upload.service.js";

// Tạo lỗi nghiệp vụ có mã HTTP
const createServiceError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Chuyển tên cửa hàng thành slug
const slugify = (text) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Tạo slug duy nhất
const generateUniqueStoreSlug = async (storeName) => {
  const baseSlug = slugify(storeName);

  let slug = baseSlug;
  let count = 1;

  while (await Store.findOne({ where: { slug } })) {
    slug = `${baseSlug}-${count}`;
    count++;
  }

  return slug;
};

// ======================================
// TẠO CỬA HÀNG
// ======================================

export const createStore = async (userId, data) => {
  // Kiểm tra Seller đã có cửa hàng chưa
  const existingStore = await Store.findOne({
    where: { userId },
  });

  if (existingStore) {
    throw createServiceError(
      "Bạn đã có cửa hàng",
      409
    );
  }

  if (!data.storeName || !data.storeName.trim()) {
    throw createServiceError(
      "Tên cửa hàng không được để trống",
      400
    );
  }

  const storeName = data.storeName.trim();

  if (storeName.length > 150) {
    throw createServiceError(
      "Tên cửa hàng không được vượt quá 150 ký tự",
      400
    );
  }

  const slug = await generateUniqueStoreSlug(storeName);

  const store = await Store.create({
    userId,
    storeName,
    slug,
    description: data.description || null,
    logoUrl: data.logoUrl || null,
    bannerUrl: data.bannerUrl || null,
    address: data.address || null,
    status: "ACTIVE",
  });

  return store;
};

// ======================================
// LẤY CỬA HÀNG CỦA SELLER
// ======================================

export const getMyStore = async (userId) => {
  const store = await Store.findOne({
    where: { userId },
  });

  if (!store) {
    throw createServiceError(
      "Bạn chưa có cửa hàng",
      404
    );
  }

  return store;
};

// ======================================
// CẬP NHẬT CỬA HÀNG
// ======================================

export const updateMyStore = async (userId, data) => {
  const store = await Store.findOne({
    where: { userId },
  });

  if (!store) {
    throw createServiceError(
      "Bạn chưa có cửa hàng",
      404
    );
  }

  const allowedFields = [
    "storeName",
    "description",
    "logoUrl",
    "bannerUrl",
    "address",
  ];

  const updateData = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  }

  if (updateData.storeName !== undefined) {
    updateData.storeName = updateData.storeName.trim();

    if (!updateData.storeName) {
      throw createServiceError(
        "Tên cửa hàng không được để trống",
        400
      );
    }

    if (updateData.storeName.length > 150) {
      throw createServiceError(
        "Tên cửa hàng không được vượt quá 150 ký tự",
        400
      );
    }
  }

  await store.update(updateData);

  return store;
};

export const uploadMyStoreImages = async (userId, files) => {
  const store = await Store.findOne({ where: { userId } });

  if (!store) {
    throw createServiceError("Bạn chưa có cửa hàng", 404);
  }

  if (!files || (!files.logo?.[0] && !files.banner?.[0])) {
    throw createServiceError("Vui lòng chọn ít nhất một ảnh", 400);
  }

  // Lưu ID ảnh cũ để xóa sau khi cập nhật thành công
  const oldLogoPublicId = store.logoPublicId;
  const oldBannerPublicId = store.bannerPublicId;

  const uploadedImages = {};

  try {
    // Upload logo
    if (files.logo?.[0]) {
      uploadedImages.logo = await uploadStoreImageToCloudinary(
        files.logo[0],
        "logo"
      );
    }

    // Upload banner
    if (files.banner?.[0]) {
      uploadedImages.banner = await uploadStoreImageToCloudinary(
        files.banner[0],
        "banner"
      );
    }

    const updateData = {};

    if (uploadedImages.logo) {
      updateData.logoUrl = uploadedImages.logo.url;
      updateData.logoPublicId = uploadedImages.logo.publicId;
    }

    if (uploadedImages.banner) {
      updateData.bannerUrl = uploadedImages.banner.url;
      updateData.bannerPublicId = uploadedImages.banner.publicId;
    }

    // Lưu URL và publicId vào database
    await store.update(updateData);
  } catch (error) {
    // Nếu có lỗi, xóa những ảnh mới đã upload thành công
    for (const image of Object.values(uploadedImages)) {
      if (image.publicId) {
        await deleteImageFromCloudinary(image.publicId).catch(
          (deleteError) => {
            console.error("Không thể xóa ảnh mới:", deleteError);
          }
        );
      }
    }

    throw error;
  }

  // Xóa ảnh cũ sau khi database đã cập nhật thành công
  if (uploadedImages.logo && oldLogoPublicId) {
    await deleteImageFromCloudinary(oldLogoPublicId).catch(console.error);
  }

  if (uploadedImages.banner && oldBannerPublicId) {
    await deleteImageFromCloudinary(oldBannerPublicId).catch(console.error);
  }

  return store;
};