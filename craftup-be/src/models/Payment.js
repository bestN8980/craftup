
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Payment = sequelize.define(
  "Payment",
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

    paymentMethod: {
      type: DataTypes.ENUM(
        "COD",
        "BANK_TRANSFER",
        "VNPAY",
        "MOMO"
      ),
      allowNull: false,
    },

    transactionId: {
      type: DataTypes.STRING(150),
      allowNull: true,
      unique: true,
    },

    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },

    status: {
      type: DataTypes.ENUM(
        "PENDING",
        "PAID",
        "FAILED",
        "REFUNDED",
        "CANCELLED"
      ),
      allowNull: false,
      defaultValue: "PENDING",
    },

    provider: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "payments",
    timestamps: true,
    underscored: true,
  }
);

export default Payment;
