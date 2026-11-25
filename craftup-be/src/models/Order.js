
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    orderNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },

    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    storeId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    recipientName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    recipientPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },

    shippingAddress: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },

    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },

    shippingFee: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },

    discountAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },

    totalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },

    status: {
      type: DataTypes.ENUM(
        "PENDING",
        "CONFIRMED",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED"
      ),
      allowNull: false,
      defaultValue: "PENDING",
    },

    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "orders",
    timestamps: true,
    underscored: true,
  }
);

export default Order;
