
import {
  getMessages,
  sendMessage,
  markMessagesAsRead,
} from "../services/message.service.js";

import {
  Conversation,
  Store,
} from "../models/index.js";

// Lấy lịch sử tin nhắn
export const getMessagesController = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number(req.query.limit) || 30)
    );

    const data = await getMessages({
      conversationId: req.params.id,
      userId: req.user.id,
      role: req.user.role,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// Gửi tin nhắn
export const sendMessageController = async (req, res) => {
  try {
    const { content, messageType = "TEXT" } = req.body;

    // Lưu tin nhắn vào database trước
    const data = await sendMessage({
      conversationId: req.params.id,
      userId: req.user.id,
      role: req.user.role,
      content,
      messageType,
    });

    // Xác định hội thoại
    const conversation = await Conversation.findByPk(req.params.id);

    let receiverId;

    if (req.user.role === "CUSTOMER") {
      // Khách hàng gửi -> người nhận là chủ cửa hàng
      const store = await Store.findByPk(conversation.storeId);
      receiverId = store?.userId;
    } else if (req.user.role === "SELLER") {
      // Người bán gửi -> người nhận là khách hàng
      receiverId = conversation.userId;
    }

    // Gửi sự kiện Socket.IO đến người nhận
    const io = req.app.get("io");

    if (io && receiverId) {
      io.to(`user_${receiverId}`).emit("new_message", {
        conversationId: conversation.id,
        message: data,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Gửi tin nhắn thành công",
      data,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// Đánh dấu tin nhắn đã đọc
export const markMessagesAsReadController = async (req, res) => {
  try {
    await markMessagesAsRead({
      conversationId: req.params.id,
      userId: req.user.id,
      role: req.user.role,
    });

    const conversation = await Conversation.findByPk(req.params.id);

    let receiverId;

    if (req.user.role === "CUSTOMER") {
      const store = await Store.findByPk(conversation.storeId);
      receiverId = store?.userId;
    } else if (req.user.role === "SELLER") {
      receiverId = conversation.userId;
    }

    // Thông báo cho người còn lại rằng tin nhắn đã được đọc
    const io = req.app.get("io");

    if (io && receiverId) {
      io.to(`user_${receiverId}`).emit("messages_read", {
        conversationId: conversation.id,
        readerId: req.user.id,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Đã đánh dấu tin nhắn đã đọc",
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};