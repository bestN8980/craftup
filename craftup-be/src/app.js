
import express from "express";
import cors from "cors";
import helmet from "helmet";
import multer from "multer";

import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import addressRoutes from "./routes/address.routes.js";
import favoriteRoutes from "./routes/favorite.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import messageRoutes from "./routes/message.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import storeRoutes from "./routes/store.routes.js";


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware
app.use(helmet());
const allowedOrigins = (
  process.env.FRONTEND_URL || "http://localhost:5173"
).split(",");

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/favorites", favoriteRoutes);

// Tin nhắn
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

// Thông báo
app.use("/api/notifications", notificationRoutes);




// API kiểm tra Server
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to CraftUp API!",
  });
});

// Kiểm tra trạng thái Server
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "CraftUp Backend is running!",
  });
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Ảnh đại diện không được vượt quá 5MB",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Không thể xử lý tệp ảnh",
    });
  }

  if (
    error.message === "Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP"
  ) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  next(error);
});

export default app;
