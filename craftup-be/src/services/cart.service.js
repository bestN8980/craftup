
import { Cart, CartItem, Product } from "../models/index.js";

const createCartError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Thêm sản phẩm vào giỏ hàng
export const addToCart = async ({ userId, productId, quantity }) => {
  return Cart.sequelize.transaction(async (transaction) => {
    const product = await Product.findByPk(productId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!product) {
      throw createCartError("Sản phẩm không tồn tại", 404);
    }

    if (product.status !== "PUBLISHED") {
      throw createCartError("Sản phẩm hiện không được bán");
    }

    if (Number(product.stock) < 1) {
      throw createCartError("Sản phẩm đã hết hàng");
    }

    let cart = await Cart.findOne({
      where: { userId, status: "ACTIVE" },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!cart) {
      cart = await Cart.create(
        { userId, status: "ACTIVE" },
        { transaction }
      );
    }

    let cartItem = await CartItem.findOne({
      where: {
        cartId: cart.id,
        productId: product.id,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    const currentQuantity = cartItem
      ? Number(cartItem.quantity)
      : 0;

    const newQuantity = currentQuantity + quantity;

    if (newQuantity > Number(product.stock)) {
      throw createCartError(
        `Chỉ còn ${product.stock} sản phẩm trong kho`
      );
    }

    if (cartItem) {
      await cartItem.update(
        { quantity: newQuantity },
        { transaction }
      );
    } else {
      cartItem = await CartItem.create(
        {
          cartId: cart.id,
          productId: product.id,
          quantity,
        },
        { transaction }
      );
    }

    return {
      cartId: cart.id,
      item: {
        id: cartItem.id,
        productId: product.id,
        productName: product.name,
        price: Number(product.price),
        quantity: newQuantity,
        subtotal: Number(product.price) * newQuantity,
      },
    };
  });
};

// Lấy giỏ hàng của người dùng
export const getCart = async (userId) => {
  const cart = await Cart.findOne({
    where: {
      userId,
      status: "ACTIVE",
    },
    
include: [
  {
    model: CartItem,
    as: "items",
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
        ],
      },
    ],
  },
],

    order: [[{ model: CartItem, as: "items" }, "createdAt", "DESC"]],
  });

  // Người dùng chưa có giỏ hàng
  if (!cart) {
    return {
      cartId: null,
      items: [],
      totalItems: 0,
      totalAmount: 0,
    };
  }

  const items = cart.items.map((item) => {
    const product = item.product;
    const quantity = Number(item.quantity);
    const price = Number(product?.price || 0);

    
const images = product?.images || [];

const primaryImage = images.find(
  (image) => image.isPrimary === true
);

return {
  id: item.id,
  productId: item.productId,
  productName: product?.name || "Sản phẩm không còn tồn tại",
  slug: product?.slug || null,
  imageUrl:
    primaryImage?.imageUrl ||
    images[0]?.imageUrl ||
    null,
  storeName: product?.store?.storeName || "Cửa hàng CraftUp",
  price,
  stock: Number(product?.stock || 0),
  productStatus: product?.status || null,
  quantity,
  subtotal: price * quantity,
};

  });

  const totalItems = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const totalAmount = items.reduce(
    (total, item) => total + item.subtotal,
    0
  );

  return {
    cartId: cart.id,
    items,
    totalItems,
    totalAmount,
  };
};


export const updateCartItem = async ({
  userId,
  itemId,
  quantity,
}) => {
  return Cart.sequelize.transaction(async (transaction) => {
    const cart = await Cart.findOne({
      where: {
        userId,
        status: "ACTIVE",
      },
      transaction,
    });

    if (!cart) {
      throw createCartError("Không tìm thấy giỏ hàng", 404);
    }

    const cartItem = await CartItem.findOne({
      where: {
        id: itemId,
        cartId: cart.id,
      },
      include: [
        {
          model: Product,
          as: "product",
        },
      ],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!cartItem || !cartItem.product) {
      throw createCartError("Không tìm thấy sản phẩm trong giỏ hàng", 404);
    }

    const product = cartItem.product;

    if (product.status !== "PUBLISHED") {
      throw createCartError("Sản phẩm hiện không được bán");
    }

    if (quantity > Number(product.stock)) {
      throw createCartError(
        `Chỉ còn ${product.stock} sản phẩm trong kho`
      );
    }

    await cartItem.update(
      { quantity },
      { transaction }
    );

    return {
      id: cartItem.id,
      productId: product.id,
      productName: product.name,
      price: Number(product.price),
      quantity,
      subtotal: Number(product.price) * quantity,
    };
  });
};


export const removeCartItem = async ({ userId, itemId }) => {
  const cart = await Cart.findOne({
    where: {
      userId,
      status: "ACTIVE",
    },
  });

  if (!cart) {
    throw createCartError("Không tìm thấy giỏ hàng", 404);
  }

  const cartItem = await CartItem.findOne({
    where: {
      id: itemId,
      cartId: cart.id,
    },
  });

  if (!cartItem) {
    throw createCartError(
      "Không tìm thấy sản phẩm trong giỏ hàng",
      404
    );
  }

  await cartItem.destroy();

  return {
    itemId: cartItem.id,
  };
};
