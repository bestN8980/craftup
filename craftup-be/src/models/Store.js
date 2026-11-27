
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Store = sequelize.define(
  "Store",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      unique: true,
    },

    storeName: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    slug: {
      type: DataTypes.STRING(180),
      allowNull: false,
      unique: true,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    logoUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    bannerUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    logoPublicId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    bannerPublicId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("PENDING", "ACTIVE", "SUSPENDED"),
      allowNull: false,
      defaultValue: "PENDING",
    },
    
  },
  {
    tableName: "stores",
    timestamps: true,
    underscored: true,
  }

  
);



export default Store;
