import {
  Conversation,
  Message,
  User,
  Store,
} from "../models/index.js";

import { Op } from "sequelize";

// Lấy danh sách hội thoại
export const getConversations = async ({ userId, role }) => {
  let where = {};

  if (role === "SELLER") {
    const store = await Store.findOne({
      where: { userId },
    });

    if (!store) {
      const error = new Error("Bạn chưa có cửa hàng");
      error.statusCode = 404;
      throw error;
    }

    where.storeId = store.id;
  } else if (role === "CUSTOMER") {
    where.userId = userId;
  } else {
    const error = new Error("Bạn không có quyền truy cập");
    error.statusCode = 403;
    throw error;
  }

  const conversations = await Conversation.findAll({
    where,
    include: [
      {
        model: User,
        as: "customer",
        attributes: ["id", "fullName", "avatarUrl"],
      },
      {
        model: Store,
        as: "store",
        attributes: ["id", "storeName", "logoUrl"],
      },
    ],
    order: [
      ["lastMessageAt", "DESC"],
      ["updatedAt", "DESC"],
    ],
  });

  const result = await Promise.all(
    conversations.map(async (conversation) => {
      const lastMessage = await Message.findOne({
        where: { conversationId: conversation.id },
        order: [["createdAt", "DESC"]],
      });

      const unreadCount = await Message.count({
        where: {
          conversationId: conversation.id,
          senderId: { [Op.ne]: userId },
          isRead: false,
        },
      });

      return {
        ...conversation.toJSON(),
        lastMessage,
        unreadCount,
      };
    })
  );

  return result;
};

// Tạo hoặc lấy hội thoại với cửa hàng
export const createConversation = async ({
  userId,
  storeId,
}) => {
  const store = await Store.findOne({
    where: {
      id: storeId,
      status: "ACTIVE",
    },
  });

  if (!store) {
    const error = new Error("Cửa hàng không tồn tại hoặc chưa hoạt động");
    error.statusCode = 404;
    throw error;
  }

  if (Number(store.userId) === Number(userId)) {
    const error = new Error("Bạn không thể nhắn tin với chính cửa hàng của mình");
    error.statusCode = 400;
    throw error;
  }

  const [conversation] = await Conversation.findOrCreate({
    where: {
      userId,
      storeId,
    },
    defaults: {
      userId,
      storeId,
    },
  });

  return conversation;
};

// Kiểm tra quyền truy cập hội thoại
export const checkConversationAccess = async ({
  conversationId,
  userId,
  role,
}) => {
  const conversation = await Conversation.findByPk(conversationId);

  if (!conversation) {
    const error = new Error("Không tìm thấy hội thoại");
    error.statusCode = 404;
    throw error;
  }

  let hasAccess = false;

  if (role === "CUSTOMER") {
    hasAccess = Number(conversation.userId) === Number(userId);
  }

  if (role === "SELLER") {
    const store = await Store.findOne({
      where: { userId },
    });

    hasAccess =
      !!store &&
      Number(conversation.storeId) === Number(store.id);
  }

  if (!hasAccess) {
    const error = new Error("Bạn không có quyền truy cập hội thoại này");
    error.statusCode = 403;
    throw error;
  }

  return conversation;
};