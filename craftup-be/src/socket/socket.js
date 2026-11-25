import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

export const initializeSocket = (httpServer) => {
  const allowedOrigins = (
  process.env.FRONTEND_URL || "http://localhost:5173"
).split(",");

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});
  console.log("Socket.IO server initialized successfully");

  // Xác thực JWT khi client kết nối Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Vui lòng đăng nhập"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findByPk(decoded.id);

      if (!user || !user.isActive) {
        return next(new Error("Tài khoản không hợp lệ"));
      }

      socket.user = user;

      next();
    } catch (error) {
      return next(new Error("Token không hợp lệ hoặc đã hết hạn"));
    }
  });

  // Khi người dùng kết nối thành công
  io.on("connection", (socket) => {
    const userId = socket.user.id;

    // Mỗi người dùng có một phòng riêng
    socket.join(`user_${userId}`);

    console.log(`User ${userId} connected`);

    socket.on("disconnect", () => {
      console.log(`User ${userId} disconnected`);
    });
  });

  return io;
};