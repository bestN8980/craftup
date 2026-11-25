
import sequelize from "../config/database.js";

// Import tất cả Models
import User from "./User.js";
import Store from "./Store.js";
import Category from "./Category.js";
import Product from "./Product.js";
import ProductImage from "./ProductImage.js";
import Address from "./Address.js";
import Cart from "./Cart.js";
import CartItem from "./CartItem.js";
import Favorite from "./Favorite.js";
import Order from "./Order.js";
import OrderItem from "./OrderItem.js";
import Payment from "./Payment.js";
import Review from "./Review.js";
import Conversation from "./Conversation.js";
import Message from "./Message.js";
import Notification from "./Notification.js";

// ======================================
// 1. USER - STORE
// ======================================

User.hasOne(Store, {
  foreignKey: "userId",
  as: "store",
});

Store.belongsTo(User, {
  foreignKey: "userId",
  as: "owner",
});

// ======================================
// 2. CATEGORY - CATEGORY
// Danh mục cha và danh mục con
// ======================================

Category.hasMany(Category, {
  foreignKey: "parentId",
  as: "children",
});

Category.belongsTo(Category, {
  foreignKey: "parentId",
  as: "parent",
});

// ======================================
// 3. STORE - PRODUCT
// ======================================

Store.hasMany(Product, {
  foreignKey: "storeId",
  as: "products",
});

Product.belongsTo(Store, {
  foreignKey: "storeId",
  as: "store",
});

// ======================================
// 4. CATEGORY - PRODUCT
// ======================================

Category.hasMany(Product, {
  foreignKey: "categoryId",
  as: "products",
});

Product.belongsTo(Category, {
  foreignKey: "categoryId",
  as: "category",
});

// ======================================
// 5. PRODUCT - PRODUCT IMAGE
// ======================================

Product.hasMany(ProductImage, {
  foreignKey: "productId",
  as: "images",
});

ProductImage.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
});

// ======================================
// 6. USER - ADDRESS
// ======================================

User.hasMany(Address, {
  foreignKey: "userId",
  as: "addresses",
});

Address.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// ======================================
// 7. USER - CART
// ======================================

User.hasMany(Cart, {
  foreignKey: "userId",
  as: "carts",
});

Cart.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// ======================================
// 8. CART - CART ITEM
// ======================================

Cart.hasMany(CartItem, {
  foreignKey: "cartId",
  as: "items",
});

CartItem.belongsTo(Cart, {
  foreignKey: "cartId",
  as: "cart",
});

// ======================================
// 9. PRODUCT - CART ITEM
// ======================================

Product.hasMany(CartItem, {
  foreignKey: "productId",
  as: "cartItems",
});

CartItem.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
});

// ======================================
// 10. USER - FAVORITE
// ======================================

User.hasMany(Favorite, {
  foreignKey: "userId",
  as: "favorites",
});

Favorite.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// ======================================
// 11. PRODUCT - FAVORITE
// ======================================

Product.hasMany(Favorite, {
  foreignKey: "productId",
  as: "favorites",
});

Favorite.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
});

// ======================================
// 12. USER - ORDER
// ======================================

User.hasMany(Order, {
  foreignKey: "userId",
  as: "customerOrders",
});

Order.belongsTo(User, {
  foreignKey: "userId",
  as: "customer",
});

// ======================================
// 13. STORE - ORDER
// ======================================

Store.hasMany(Order, {
  foreignKey: "storeId",
  as: "orders",
});

Order.belongsTo(Store, {
  foreignKey: "storeId",
  as: "store",
});

// ======================================
// 14. ORDER - ORDER ITEM
// ======================================

Order.hasMany(OrderItem, {
  foreignKey: "orderId",
  as: "items",
});

OrderItem.belongsTo(Order, {
  foreignKey: "orderId",
  as: "order",
});

// ======================================
// 15. PRODUCT - ORDER ITEM
// ======================================

Product.hasMany(OrderItem, {
  foreignKey: "productId",
  as: "orderItems",
});

OrderItem.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
});

// ======================================
// 16. ORDER - PAYMENT
// ======================================

Order.hasMany(Payment, {
  foreignKey: "orderId",
  as: "payments",
});

Payment.belongsTo(Order, {
  foreignKey: "orderId",
  as: "order",
});

// ======================================
// 17. USER - REVIEW
// ======================================

User.hasMany(Review, {
  foreignKey: "userId",
  as: "reviews",
});

Review.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// ======================================
// 18. PRODUCT - REVIEW
// ======================================

Product.hasMany(Review, {
  foreignKey: "productId",
  as: "reviews",
});

Review.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
});

// ======================================
// 19. ORDER ITEM - REVIEW
// ======================================

OrderItem.hasOne(Review, {
  foreignKey: "orderItemId",
  as: "review",
});

Review.belongsTo(OrderItem, {
  foreignKey: "orderItemId",
  as: "orderItem",
});

// ======================================
// 20. USER - CONVERSATION
// ======================================

User.hasMany(Conversation, {
  foreignKey: "userId",
  as: "conversations",
});

Conversation.belongsTo(User, {
  foreignKey: "userId",
  as: "customer",
});

// ======================================
// 21. STORE - CONVERSATION
// ======================================

Store.hasMany(Conversation, {
  foreignKey: "storeId",
  as: "conversations",
});

Conversation.belongsTo(Store, {
  foreignKey: "storeId",
  as: "store",
});

// ======================================
// 22. CONVERSATION - MESSAGE
// ======================================

Conversation.hasMany(Message, {
  foreignKey: "conversationId",
  as: "messages",
});

Message.belongsTo(Conversation, {
  foreignKey: "conversationId",
  as: "conversation",
});

// ======================================
// 23. USER - MESSAGE
// ======================================

User.hasMany(Message, {
  foreignKey: "senderId",
  as: "sentMessages",
});

Message.belongsTo(User, {
  foreignKey: "senderId",
  as: "sender",
});

// ======================================
// EXPORT
// ======================================

// ======================================
// 24. USER - NOTIFICATION
// ======================================

// ======================================
// 24. USER - NOTIFICATION
// ======================================

User.hasMany(Notification, {
  foreignKey: "userId",
  as: "notifications",
});

Notification.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});
export {
  sequelize,
  User,
  Store,
  Category,
  Product,
  ProductImage,
  Address,
  Cart,
  CartItem,
  Favorite,
  Order,
  OrderItem,
  Payment,
  Review,
  Conversation,
  Message,
  Notification,
};