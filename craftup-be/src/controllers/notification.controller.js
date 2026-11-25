import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notification.service.js";

// Lấy danh sách thông báo
export const getMyNotifications = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

    const data = await getNotifications(req.user.id, page, limit);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Đếm thông báo chưa đọc
export const getMyUnreadCount = async (req, res) => {
  try {
    const count = await getUnreadNotificationCount(req.user.id);

    res.json({
      success: true,
      data: {
        unreadCount: count,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Đánh dấu một thông báo đã đọc
export const readNotification = async (req, res) => {
  try {
    const notification = await markNotificationAsRead(
      req.user.id,
      req.params.id
    );

    res.json({
      success: true,
      message: "Đã đánh dấu thông báo đã đọc",
      data: notification,
    });
  } catch (error) {
    res.status(error.message === "Không tìm thấy thông báo" ? 404 : 500).json({
      success: false,
      message: error.message,
    });
  }
};

// Đánh dấu tất cả đã đọc
export const readAllNotifications = async (req, res) => {
  try {
    await markAllNotificationsAsRead(req.user.id);

    res.json({
      success: true,
      message: "Đã đánh dấu tất cả thông báo đã đọc",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};