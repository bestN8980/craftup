
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    fullName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },

    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    avatarUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    // Thông tin hồ sơ bổ sung
    birthday: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    gender: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    occupation: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    role: {
      type: DataTypes.ENUM("CUSTOMER", "SELLER", "ADMIN"),
      allowNull: false,
      defaultValue: "CUSTOMER",
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    underscored: true,
  }
);

export default User;
