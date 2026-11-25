
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Conversation = sequelize.define(
  "Conversation",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    storeId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    lastMessageAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "conversations",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "store_id"],
      },
      {
        fields: ["last_message_at"],
      },
    ],
  }
);

export default Conversation;
