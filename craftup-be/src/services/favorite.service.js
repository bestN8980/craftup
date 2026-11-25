
import {
  Favorite,
  Product,
} from "../models/index.js";

const createFavoriteError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// ======================================
// 1. LẤY DANH SÁCH SẢN PHẨM YÊU THÍCH
// ======================================

export const getFavorites = async (userId) => {
  const favorites = await Favorite.findAll({
    where: { userId },

    include: [
      {
        model: Product,
        as: "product",
        attributes: [
          "id",
          "name",
          "slug",
          "price",
          "stock",
          "status",
          "categoryId",
        ],
        include: [
          {
            association: "images",
            attributes: [
              "imageUrl",
              "isPrimary",
              "sortOrder",
            ],
          },
          {
            association: "store",
            attributes: ["id", "storeName"],
          },
          {
            association: "category",
            attributes: ["id", "name"],
          },
        ],
      },
    ],

    order: [["createdAt", "DESC"]],
  });

  return favorites
    .filter((favorite) => favorite.product)
    .map((favorite) => {
      const product = favorite.product;
      const images = product.images || [];

      const primaryImage = images.find(
        (image) => image.isPrimary === true
      );

      return {
        id: favorite.id,
        productId: product.id,
        createdAt: favorite.createdAt,

        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: Number(product.price),
          stock: Number(product.stock),
          status: product.status,

          categoryId: product.categoryId,
          category: product.category?.name || "Khác",

          shop: product.store?.storeName || "Cửa hàng CraftUp",

          imageUrl:
            primaryImage?.imageUrl ||
            images[0]?.imageUrl ||
            null,
        },
      };
    });
};

// ======================================
// 2. THÊM SẢN PHẨM YÊU THÍCH
// ======================================

export const addFavorite = async ({ userId, productId }) => {
  const product = await Product.findByPk(productId);

  if (!product) {
    throw createFavoriteError(
      "Sản phẩm không tồn tại",
      404
    );
  }

  if (product.status !== "PUBLISHED") {
    throw createFavoriteError(
      "Sản phẩm hiện không được bán"
    );
  }

  const [favorite, created] = await Favorite.findOrCreate({
    where: {
      userId,
      productId: product.id,
    },

    defaults: {
      userId,
      productId: product.id,
    },
  });

  return {
    id: favorite.id,
    productId: favorite.productId,
    created,
  };
};

// ======================================
// 3. XÓA SẢN PHẨM YÊU THÍCH
// ======================================

export const removeFavorite = async ({ userId, productId }) => {
  const favorite = await Favorite.findOne({
    where: {
      userId,
      productId,
    },
  });

  if (!favorite) {
    throw createFavoriteError(
      "Sản phẩm không có trong danh sách yêu thích",
      404
    );
  }

  await favorite.destroy();

  return {
    favoriteId: favorite.id,
    productId: favorite.productId,
  };
};
