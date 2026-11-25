
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    orderId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    productId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    productName: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },

    unitPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },

    quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      validate: {
        min: 1,
      },
    },

    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
  },
  {
    tableName: "order_items",
    timestamps: true,
    underscored: true,
  }
);

export default OrderItem;
