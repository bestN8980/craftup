
import { Address } from "../models/index.js";

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Lấy danh sách địa chỉ của người dùng
export const getAddresses = async (userId) => {
  return Address.findAll({
    where: { userId },
    order: [
      ["isDefault", "DESC"],
      ["createdAt", "DESC"],
    ],
  });
};

// Thêm địa chỉ
export const createAddress = async (userId, data) => {
  return Address.sequelize.transaction(async (transaction) => {
    const totalAddresses = await Address.count({
      where: { userId },
      transaction,
    });

    const isDefault =
      data.isDefault === true || totalAddresses === 0;

    if (isDefault) {
      await Address.update(
        { isDefault: false },
        {
          where: { userId },
          transaction,
        }
      );
    }

    return Address.create(
      {
        userId,
        recipientName: data.recipientName,
        phone: data.phone,
        province: data.province,
        district: data.district,
        ward: data.ward,
        streetAddress: data.streetAddress,
        isDefault,
      },
      { transaction }
    );
  });
};

// Cập nhật địa chỉ
export const updateAddress = async (userId, addressId, data) => {
  return Address.sequelize.transaction(async (transaction) => {
    const address = await Address.findOne({
      where: {
        id: addressId,
        userId,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!address) {
      throw createError("Không tìm thấy địa chỉ", 404);
    }

    if (data.isDefault === true) {
      await Address.update(
        { isDefault: false },
        {
          where: { userId },
          transaction,
        }
      );
    }

    await address.update(
      {
        recipientName: data.recipientName,
        phone: data.phone,
        province: data.province,
        district: data.district,
        ward: data.ward,
        streetAddress: data.streetAddress,
        isDefault:
          data.isDefault === undefined
            ? address.isDefault
            : data.isDefault,
      },
      { transaction }
    );

    return address;
  });
};

// Đặt địa chỉ mặc định
export const setDefaultAddress = async (userId, addressId) => {
  return Address.sequelize.transaction(async (transaction) => {
    const address = await Address.findOne({
      where: {
        id: addressId,
        userId,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!address) {
      throw createError("Không tìm thấy địa chỉ", 404);
    }

    await Address.update(
      { isDefault: false },
      {
        where: { userId },
        transaction,
      }
    );

    await address.update(
      { isDefault: true },
      { transaction }
    );

    return address;
  });
};

// Xóa địa chỉ
export const deleteAddress = async (userId, addressId) => {
  return Address.sequelize.transaction(async (transaction) => {
    const address = await Address.findOne({
      where: {
        id: addressId,
        userId,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!address) {
      throw createError("Không tìm thấy địa chỉ", 404);
    }

    const wasDefault = address.isDefault;

    await address.destroy({ transaction });

    // Nếu xóa địa chỉ mặc định, chọn địa chỉ đầu tiên còn lại
    if (wasDefault) {
      const nextAddress = await Address.findOne({
        where: { userId },
        order: [["createdAt", "ASC"]],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (nextAddress) {
        await nextAddress.update(
          { isDefault: true },
          { transaction }
        );
      }
    }

    return {
      id: addressId,
      message: "Xóa địa chỉ thành công",
    };
  });
};
