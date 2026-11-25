
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Message = sequelize.define(
  "Message",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    conversationId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    senderId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    messageType: {
      type: DataTypes.ENUM(
        "TEXT",
        "IMAGE",
        "PRODUCT"
      ),
      allowNull: false,
      defaultValue: "TEXT",
    },

    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "messages",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["conversation_id", "created_at"],
      },
      {
        fields: ["sender_id"],
      },
    ],
  }
);

export default Message;
