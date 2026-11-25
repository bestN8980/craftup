
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const ProductImage = sequelize.define(
  "ProductImage",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    productId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },

    publicId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    altText: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    isPrimary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    sortOrder: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "product_images",
    timestamps: true,
    underscored: true,
  }
);

export default ProductImage;
