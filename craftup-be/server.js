import "dotenv/config";
import http from "http";

import app from "./src/app.js";
import { sequelize } from "./src/models/index.js";
import { initializeSocket } from "./src/socket/socket.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Kết nối MySQL
    await sequelize.authenticate();

    console.log("MySQL connected successfully!");

    // 2. Hiển thị danh sách Model
    const modelNames = Object.keys(sequelize.models);

    console.log("Registered Models:");

    modelNames.forEach((modelName) => {
      console.log(`- ${modelName}`);
    });

    console.log(`Total Models: ${modelNames.length}`);

    // 3. Đồng bộ database
    await sequelize.sync();

    console.log("Database synchronized successfully!");

    // 4. Tạo HTTP Server từ Express
    const server = http.createServer(app);

    // 5. Khởi tạo Socket.IO
    const io = initializeSocket(server);

    // 6. Cho phép backend sử dụng Socket.IO
    global.io = io;
    app.set("io", io);

    console.log("Socket.IO server initialized successfully!");

    // 7. Khởi động HTTP Server
    server.listen(PORT, () => {
      console.log(`CraftUp Backend running at http://localhost:${PORT}`);
      console.log(`Socket.IO endpoint: http://localhost:${PORT}/socket.io/`);
    });

  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();