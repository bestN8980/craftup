
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const CartItem = sequelize.define(
  "CartItem",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    cartId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    productId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
  },
  {
    tableName: "cart_items",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["cart_id", "product_id"],
      },
    ],
  }
);

export default CartItem;
