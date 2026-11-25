import { Message } from "../models/index.js";

import { Op } from "sequelize";

import {
  checkConversationAccess,
} from "./conversation.service.js";

// Lấy lịch sử tin nhắn
export const getMessages = async ({
  conversationId,
  userId,
  role,
  page = 1,
  limit = 30,
}) => {
  const conversation = await checkConversationAccess({
    conversationId,
    userId,
    role,
  });

  const offset = (page - 1) * limit;

  const { rows, count } = await Message.findAndCountAll({
    where: {
      conversationId: conversation.id,
    },
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

  return {
    messages: rows.reverse(),
    pagination: {
      totalItems: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      limit,
    },
  };
};

// Gửi tin nhắn
export const sendMessage = async ({
  conversationId,
  userId,
  role,
  content,
  messageType = "TEXT",
}) => {
  const conversation = await checkConversationAccess({
    conversationId,
    userId,
    role,
  });

  const cleanContent = content?.trim();

  if (!cleanContent) {
    const error = new Error("Nội dung tin nhắn không được để trống");
    error.statusCode = 400;
    throw error;
  }

  if (!["TEXT", "IMAGE", "PRODUCT"].includes(messageType)) {
    const error = new Error("Loại tin nhắn không hợp lệ");
    error.statusCode = 400;
    throw error;
  }

  const message = await Message.create({
    conversationId: conversation.id,
    senderId: userId,
    content: cleanContent,
    messageType,
    isRead: false,
  });

  await conversation.update({
    lastMessageAt: message.createdAt,
  });

  return message;
};

// Đánh dấu tin nhắn đã đọc
export const markMessagesAsRead = async ({
  conversationId,
  userId,
  role,
}) => {
  const conversation = await checkConversationAccess({
    conversationId,
    userId,
    role,
  });

  await Message.update(
    { isRead: true },
    {
      where: {
        conversationId: conversation.id,
        senderId: { [Op.ne]: userId },
        isRead: false,
      },
    }
  );

  return true;
};