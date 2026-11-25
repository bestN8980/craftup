
import { Op } from "sequelize";

import {
  Product,
  ProductImage,
  Store,
  Category,
} from "../models/index.js";

import {
  uploadProductImageToCloudinary,
  deleteImageFromCloudinary,
} from "./upload.service.js";

// Lấy danh sách sản phẩm
export const getProducts = async (filters) => {
  const {
    page = 1,
    limit = 12,
    search,
    categoryId,
    minPrice,
    maxPrice,
    sort = "newest",
  } = filters;

  // Điều kiện tìm kiếm
  const where = {
    status: "PUBLISHED",
  };

  // Tìm theo tên sản phẩm
  if (search) {
    where.name = {
      [Op.like]: `%${search}%`,
    };
  }

  // Lọc theo danh mục
  if (categoryId) {
    where.categoryId = categoryId;
  }

  // Lọc theo khoảng giá
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};

    if (minPrice !== undefined) {
      where.price[Op.gte] = minPrice;
    }

    if (maxPrice !== undefined) {
      where.price[Op.lte] = maxPrice;
    }
  }

  // Sắp xếp
  let order = [["createdAt", "DESC"]];

  if (sort === "price_asc") {
    order = [["price", "ASC"]];
  } else if (sort === "price_desc") {
    order = [["price", "DESC"]];
  }

  // Phân trang
  const offset = (page - 1) * limit;

  const { count, rows } = await Product.findAndCountAll({
    where,
    include: [
  {
    model: ProductImage,
    as: "images",
    attributes: ["id", "imageUrl", "isPrimary", "sortOrder"],
  },
  {
    model: Store,
    as: "store",
    attributes: ["id", "storeName", "slug"],
  },
  {
    model: Category,
    as: "category",
    attributes: ["id", "name", "slug"],
  },
],
    order,
    limit,
    offset,
    distinct: true,
  });

  return {
    products: rows,
    pagination: {
      totalItems: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      itemsPerPage: limit,
    },
  };
};

// Lấy chi tiết sản phẩm
export const getProductById = async (productId) => {
  const product = await Product.findOne({
    where: {
      id: productId,
      status: "PUBLISHED",
    },
    include: [
  {
    model: ProductImage,
    as: "images",
    attributes: [
      "id",
      "imageUrl",
      "publicId",
      "altText",
      "isPrimary",
      "sortOrder",
    ],
  },
  {
    model: Store,
    as: "store",
    attributes: ["id", "storeName", "slug", "description", "logoUrl"],
  },
  {
    model: Category,
    as: "category",
    attributes: ["id", "name", "slug"],
  },
],
  });

  if (!product) {
    throw new Error("Không tìm thấy sản phẩm");
  }

  return product;
};

// Tạo slug từ tên sản phẩm
const createSlug = (name) => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

// Đảm bảo slug không bị trùng trong cùng cửa hàng
const generateUniqueSlug = async (name, storeId, excludeProductId = null) => {
  const baseSlug = createSlug(name);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const where = {
      storeId,
      slug,
    };

    if (excludeProductId !== null) {
      where.id = { [Op.ne]: excludeProductId };
    }

    const existingProduct = await Product.findOne({ where });

    if (!existingProduct) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

// Tạo lỗi nghiệp vụ có mã HTTP
const createServiceError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Tạo sản phẩm
export const createProduct = async (data, userId) => {
  const store = await Store.findOne({
    where: { userId },
  });

  if (!store) {
    throw createServiceError(
      "Bạn chưa có cửa hàng",
      404
    );
  }

  if (store.status === "SUSPENDED") {
    throw createServiceError(
      "Cửa hàng đã bị đình chỉ",
      403
    );
  }

  const category = await Category.findByPk(data.categoryId);

  if (!category || !category.isActive) {
    throw createServiceError(
      "Danh mục không tồn tại hoặc đã bị vô hiệu hóa",
      400
    );
  }

  const slug = await generateUniqueSlug(
    data.name,
    store.id
  );

  const product = await Product.create({
    storeId: store.id,
    categoryId: data.categoryId,
    name: data.name,
    slug,
    description: data.description || null,
    price: data.price,
    stock: data.stock,
    sku: data.sku || null,
    status: "DRAFT",
  });

  return product;
};

// Cập nhật sản phẩm
export const updateProduct = async (productId, data, userId) => {
  const store = await Store.findOne({
    where: { userId },
  });

  if (!store) {
    throw createServiceError(
      "Bạn chưa có cửa hàng",
      404
    );
  }

  if (store.status === "SUSPENDED") {
    throw createServiceError(
      "Cửa hàng đã bị đình chỉ",
      403
    );
  }

  const product = await Product.findOne({
    where: {
      id: productId,
      storeId: store.id,
    },
  });

  if (!product) {
    throw createServiceError(
      "Không tìm thấy sản phẩm trong cửa hàng của bạn",
      404
    );
  }

  if (data.categoryId !== undefined) {
    const category = await Category.findByPk(data.categoryId);

    if (!category || !category.isActive) {
      throw createServiceError(
        "Danh mục không tồn tại hoặc đã bị vô hiệu hóa",
        400
      );
    }
  }

  const updateData = { ...data };

  if (data.name !== undefined) {
    updateData.slug = await generateUniqueSlug(
      data.name,
      store.id,
      product.id
    );
  }

  if (data.sku === "") {
    updateData.sku = null;
  }

  if (data.description === "") {
    updateData.description = null;
  }

  await product.update(updateData);

  return product;
};

// Xóa sản phẩm (chuyển trạng thái sang ARCHIVED)
export const deleteProduct = async (productId, userId) => {
  const store = await Store.findOne({
    where: { userId },
  });

  if (!store) {
    throw createServiceError(
      "Bạn chưa có cửa hàng",
      404
    );
  }

  const product = await Product.findOne({
    where: {
      id: productId,
      storeId: store.id,
    },
  });

  if (!product) {
    throw createServiceError(
      "Không tìm thấy sản phẩm trong cửa hàng của bạn",
      404
    );
  }

  await product.update({
    status: "ARCHIVED",
  });

  return product;
};


export const publishProduct = async (productId, userId) => {
  const store = await Store.findOne({
    where: { userId },
  });

  if (!store) {
    throw createServiceError("Bạn chưa có cửa hàng", 404);
  }

  if (store.status !== "ACTIVE") {
    throw createServiceError(
      "Cửa hàng chưa được kích hoạt",
      403
    );
  }

  const product = await Product.findOne({
    where: {
      id: productId,
      storeId: store.id,
    },
  });

  if (!product) {
    throw createServiceError(
      "Không tìm thấy sản phẩm",
      404
    );
  }

  if (product.status === "ARCHIVED") {
    throw createServiceError(
      "Không thể xuất bản sản phẩm đã lưu trữ",
      400
    );
  }

  product.status = "PUBLISHED";
  await product.save();

  return product;
};


/**
 * Upload nhiều ảnh cho sản phẩm
 */
export const uploadProductImages = async (
  productId,
  files,
  userId
) => {
  if (!files || files.length === 0) {
    throw createServiceError(
      "Vui lòng chọn ít nhất một ảnh",
      400
    );
  }

  const store = await Store.findOne({
    where: { userId },
  });

  if (!store) {
    throw createServiceError(
      "Bạn chưa có cửa hàng",
      404
    );
  }

  if (store.status === "SUSPENDED") {
    throw createServiceError(
      "Cửa hàng đã bị đình chỉ",
      403
    );
  }

  // Kiểm tra sản phẩm có thuộc cửa hàng của Seller không
  const product = await Product.findOne({
    where: {
      id: productId,
      storeId: store.id,
    },
  });

  if (!product) {
    throw createServiceError(
      "Không tìm thấy sản phẩm trong cửa hàng của bạn",
      404
    );
  }

  // Đếm số ảnh hiện có
  const currentImageCount = await ProductImage.count({
    where: { productId },
  });

  const remainingSlots = 5 - currentImageCount;

  if (files.length > remainingSlots) {
    throw createServiceError(
      `Sản phẩm chỉ được có tối đa 5 ảnh. Hiện còn có thể thêm ${Math.max(remainingSlots, 0)} ảnh`,
      400
    );
  }

  // Lấy thứ tự ảnh tiếp theo
  const lastImage = await ProductImage.findOne({
    where: { productId },
    order: [["sortOrder", "DESC"]],
  });

  const startOrder = lastImage
    ? lastImage.sortOrder + 1
    : 0;

  // Nếu chưa có ảnh thì ảnh đầu tiên sẽ là ảnh chính
  const hasPrimaryImage = await ProductImage.count({
    where: {
      productId,
      isPrimary: true,
    },
  });

  const uploadedImages = [];

  try {
    // Upload lần lượt để dễ xử lý nếu có lỗi
    for (let i = 0; i < files.length; i++) {
      const uploaded = await uploadProductImageToCloudinary(
        files[i]
      );

      uploadedImages.push({
        productId: product.id,
        imageUrl: uploaded.url,
        publicId: uploaded.publicId,
        isPrimary:
          hasPrimaryImage === 0 && i === 0,
        sortOrder: startOrder + i,
      });
    }

    // Lưu thông tin ảnh vào MySQL
    const savedImages = await ProductImage.bulkCreate(
      uploadedImages
    );

    return savedImages;
  } catch (error) {
    // Nếu lưu thất bại, xóa các ảnh đã upload trên Cloudinary
    await Promise.allSettled(
      uploadedImages.map((image) =>
        deleteImageFromCloudinary(image.publicId)
      )
    );

    throw error;
  }
};


/**
 * Xóa ảnh khỏi sản phẩm
 */
export const deleteProductImage = async (
  productId,
  imageId,
  userId
) => {
  // Tìm cửa hàng của Seller
  const store = await Store.findOne({
    where: { userId },
  });

  if (!store) {
    throw createServiceError(
      "Bạn chưa có cửa hàng",
      404
    );
  }

  // Kiểm tra sản phẩm thuộc cửa hàng
  const product = await Product.findOne({
    where: {
      id: productId,
      storeId: store.id,
    },
  });

  if (!product) {
    throw createServiceError(
      "Không tìm thấy sản phẩm trong cửa hàng của bạn",
      404
    );
  }

  // Tìm ảnh thuộc sản phẩm
  const image = await ProductImage.findOne({
    where: {
      id: imageId,
      productId: product.id,
    },
  });

  if (!image) {
    throw createServiceError(
      "Không tìm thấy ảnh sản phẩm",
      404
    );
  }

  // Xóa ảnh trên Cloudinary trước
  if (image.publicId) {
    await deleteImageFromCloudinary(image.publicId);
  }

  // Xóa bản ghi ảnh trong MySQL
  const wasPrimary = image.isPrimary;

  await image.destroy();

  // Nếu ảnh vừa xóa là ảnh chính, chọn ảnh khác thay thế
  if (wasPrimary) {
    const nextImage = await ProductImage.findOne({
      where: {
        productId: product.id,
      },
      order: [
        ["sortOrder", "ASC"],
        ["id", "ASC"],
      ],
    });

    if (nextImage) {
      await nextImage.update({
        isPrimary: true,
      });
    }
  }

  return {
    deletedImageId: imageId,
    productId: productId,
    message: "Xóa ảnh sản phẩm thành công",
  };
};


/**
 * Chọn ảnh chính cho sản phẩm
 */
export const setPrimaryProductImage = async (
  productId,
  imageId,
  userId
) => {
  const store = await Store.findOne({
    where: { userId },
  });

  if (!store) {
    throw createServiceError(
      "Bạn chưa có cửa hàng",
      404
    );
  }

  // Kiểm tra sản phẩm thuộc cửa hàng
  const product = await Product.findOne({
    where: {
      id: productId,
      storeId: store.id,
    },
  });

  if (!product) {
    throw createServiceError(
      "Không tìm thấy sản phẩm trong cửa hàng của bạn",
      404
    );
  }

  // Kiểm tra ảnh thuộc sản phẩm
  const image = await ProductImage.findOne({
    where: {
      id: imageId,
      productId: product.id,
    },
  });

  if (!image) {
    throw createServiceError(
      "Không tìm thấy ảnh sản phẩm",
      404
    );
  }

  // Chuyển tất cả ảnh của sản phẩm thành không phải ảnh chính
  await ProductImage.update(
    {
      isPrimary: false,
    },
    {
      where: {
        productId: product.id,
      },
    }
  );

  // Chọn ảnh được yêu cầu làm ảnh chính
  await image.update({
    isPrimary: true,
  });

  return image;
};


/**
 * Lấy danh sách sản phẩm thuộc cửa hàng của Seller đang đăng nhập
 */
export const getSellerProducts = async (userId, filters = {}) => {
  const store = await Store.findOne({
    where: { userId },
  });

  if (!store) {
    throw createServiceError(
      "Bạn chưa có cửa hàng",
      404
    );
  }

  const {
    page = 1,
    limit = 100,
    search,
  } = filters;

  const where = {
    storeId: store.id,
    status: {
      [Op.ne]: "ARCHIVED",
    },
  };

  if (search) {
    where.name = {
      [Op.like]: `%${search}%`,
    };
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await Product.findAndCountAll({
    where,
    include: [
      {
        model: ProductImage,
        as: "images",
        attributes: [
          "id",
          "imageUrl",
          "isPrimary",
          "sortOrder",
        ],
      },
      {
        model: Store,
        as: "store",
        attributes: ["id", "storeName", "slug"],
      },
      {
        model: Category,
        as: "category",
        attributes: ["id", "name", "slug"],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
    distinct: true,
  });

  return {
    products: rows,
    pagination: {
      totalItems: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      itemsPerPage: limit,
    },
  };
};
