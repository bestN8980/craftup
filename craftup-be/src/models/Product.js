
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    storeId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    categoryId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },

    slug: {
      type: DataTypes.STRING(220),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },

    stock: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },

    sku: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM(
        "DRAFT",
        "PUBLISHED",
        "ARCHIVED"
      ),
      allowNull: false,
      defaultValue: "DRAFT",
    },
  },
  {
    tableName: "products",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["store_id", "slug"],
      },
      {
        unique: true,
        fields: ["store_id", "sku"],
      },
    ],
  }
);

export default Product;