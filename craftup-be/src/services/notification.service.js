import { Notification, User } from "../models/index.js";

// ======================================
// TẠO THÔNG BÁO
// ======================================

export const createNotification = async ({
  userId,
  title,
  message,
  type = "SYSTEM",
  link = null,
  metadata = null,
}) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new Error("Người nhận thông báo không tồn tại");
  }

  // Lưu thông báo vào database
  const notification = await Notification.create({
    userId,
    title,
    message,
    type,
    link,
    metadata,
    isRead: false,
  });

  // Gửi thông báo realtime qua Socket.IO
  const io = global.io;

  if (io) {
    io.to(`user_${userId}`).emit("new_notification", {
      notification: notification.toJSON(),
    });
  }

  return notification;
};

// ======================================
// LẤY DANH SÁCH THÔNG BÁO
// ======================================

export const getNotifications = async (userId, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;

  const { count, rows } = await Notification.findAndCountAll({
    where: { userId },
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

  return {
    notifications: rows,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  };
};

// ======================================
// ĐẾM THÔNG BÁO CHƯA ĐỌC
// ======================================

export const getUnreadNotificationCount = async (userId) => {
  return await Notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
};

// ======================================
// ĐÁNH DẤU MỘT THÔNG BÁO ĐÃ ĐỌC
// ======================================

export const markNotificationAsRead = async (userId, notificationId) => {
  const notification = await Notification.findOne({
    where: {
      id: notificationId,
      userId,
    },
  });

  if (!notification) {
    throw new Error("Không tìm thấy thông báo");
  }

  if (!notification.isRead) {
    await notification.update({
      isRead: true,
      readAt: new Date(),
    });
  }

  return notification;
};

// ======================================
// ĐÁNH DẤU TẤT CẢ ĐÃ ĐỌC
// ======================================

export const markAllNotificationsAsRead = async (userId) => {
  await Notification.update(
    {
      isRead: true,
      readAt: new Date(),
    },
    {
      where: {
        userId,
        isRead: false,
      },
    }
  );

  return true;
};