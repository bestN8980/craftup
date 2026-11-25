
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Favorite = sequelize.define(
  "Favorite",
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

    productId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
  },
  {
    tableName: "favorites",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "product_id"],
      },
    ],
  }
);

export default Favorite;
