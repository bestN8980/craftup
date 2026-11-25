
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Address = sequelize.define(
  "Address",
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

    recipientName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },

    province: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    district: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    ward: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    streetAddress: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    isDefault: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "addresses",
    timestamps: true,
    underscored: true,
  }
);

export default Address;
