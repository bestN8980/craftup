
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Review = sequelize.define(
  "Review",
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

    productId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    orderItemId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      unique: true,
    },

    rating: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },

    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    isVisible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    // Phản hồi của người bán
    sellerReply: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // Thời điểm người bán phản hồi
    sellerRepliedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "reviews",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["product_id"],
      },
      {
        fields: ["user_id"],
      },
    ],
  }
);

export default Review;
