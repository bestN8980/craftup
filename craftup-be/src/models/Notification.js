import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Notification = sequelize.define(
  "Notification",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    // Người nhận thông báo
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    // Tiêu đề
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    // Nội dung
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    // Loại thông báo: ORDER, MESSAGE, SYSTEM...
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "SYSTEM",
    },

    // Đường dẫn khi người dùng bấm vào thông báo
    link: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    // Dữ liệu bổ sung nếu cần
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    // Trạng thái đã đọc
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "notifications",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["user_id", "is_read"],
      },
      {
        fields: ["user_id", "created_at"],
      },
    ],
  }
);

export default Notification;