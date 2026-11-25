
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Cart = sequelize.define(
  "Cart",
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

    status: {
      type: DataTypes.ENUM(
        "ACTIVE",
        "CONVERTED",
        "ABANDONED"
      ),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
  },
  {
    tableName: "carts",
    timestamps: true,
    underscored: true,
  }
);

export default Cart;
