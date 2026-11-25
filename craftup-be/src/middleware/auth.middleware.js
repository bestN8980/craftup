
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

export const authenticate = async (req, res, next) => {
  try {
    // Lấy token từ Authorization Header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập để tiếp tục",
      });
    }

    // Tách token khỏi chuỗi Bearer
    const token = authHeader.split(" ")[1];

    // Giải mã và xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Tìm người dùng trong database
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["passwordHash"] },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Tài khoản không tồn tại",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Tài khoản đã bị vô hiệu hóa",
      });
    }

    // Gắn thông tin người dùng vào request
    req.user = user;

    // Chuyển sang Middleware hoặc Controller tiếp theo
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Phiên đăng nhập đã hết hạn",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ",
    });
  }
};
