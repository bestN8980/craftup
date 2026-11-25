import {
  getConversations,
  createConversation,
} from "../services/conversation.service.js";

export const getConversationsController = async (req, res) => {
  try {
    const data = await getConversations({
      userId: req.user.id,
      role: req.user.role,
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

export const createConversationController = async (req, res) => {
  try {
    const { storeId } = req.body;

    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp ID cửa hàng",
      });
    }

    if (req.user.role !== "CUSTOMER") {
      return res.status(403).json({
        success: false,
        message: "Chỉ khách hàng mới có thể tạo hội thoại",
      });
    }

    const data = await createConversation({
      userId: req.user.id,
      storeId,
    });

    return res.status(200).json({
      success: true,
      message: "Lấy hội thoại thành công",
      data,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};