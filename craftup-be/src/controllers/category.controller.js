
import { Category } from "../models/index.js";

export const getCategoriesController = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: {
        isActive: true,
      },
      attributes: [
        "id",
        "parentId",
        "name",
        "slug",
        "description",
        "imageUrl",
      ],
      order: [["name", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách danh mục thành công",
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách danh mục",
    });
  }
};
