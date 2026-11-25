
import {
  Cart,
  CartItem,
  Product,
  Store,
  Address,
  Order,
  OrderItem,
  Payment,
} from "../models/index.js";

const createOrderNumber = () => {
  const randomCode = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  return `CU${Date.now()}${randomCode}`;
};

const createCheckoutError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const roundMoney = (value) => {
  return Math.round((value + Number.EPSILON) * 100) / 100;
};

export const checkout = async ({
  userId,
  addressId,
  paymentMethod,
  note,
}) => {
  return Order.sequelize.transaction(async (transaction) => {
    // 1. Kiểm tra phương thức thanh toán
    const allowedPaymentMethods = [
      "COD",
      "BANK_TRANSFER",
    ];

    if (!allowedPaymentMethods.includes(paymentMethod)) {
      throw createCheckoutError(
        "Phương thức thanh toán không hợp lệ"
      );
    }

    // 2. Lấy địa chỉ và kiểm tra quyền sở hữu
    const address = await Address.findOne({
      where: {
        id: addressId,
        userId,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!address) {
      throw createCheckoutError(
        "Địa chỉ giao hàng không tồn tại",
        404
      );
    }

    // 3. Lấy giỏ hàng đang hoạt động
    const cart = await Cart.findOne({
      where: {
        userId,
        status: "ACTIVE",
      },
      include: [
        {
          model: CartItem,
          as: "items",
        },
      ],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!cart || !cart.items?.length) {
      throw createCheckoutError("Giỏ hàng đang trống");
    }

    // 4. Kiểm tra sản phẩm và nhóm theo cửa hàng
    const groupedItems = new Map();

    for (const cartItem of cart.items) {
      const product = await Product.findByPk(
        cartItem.productId,
        {
          transaction,
          lock: transaction.LOCK.UPDATE,
        }
      );

      if (!product) {
        throw createCheckoutError(
          "Một sản phẩm trong giỏ hàng không còn tồn tại"
        );
      }

      if (product.status !== "PUBLISHED") {
        throw createCheckoutError(
          `Sản phẩm "${product.name}" hiện không được bán`
        );
      }

      const quantity = Number(cartItem.quantity);
      const stock = Number(product.stock);
      const price = Number(product.price);

      if (!Number.isInteger(quantity) || quantity < 1) {
        throw createCheckoutError(
          "Số lượng sản phẩm không hợp lệ"
        );
      }

      if (stock < quantity) {
        throw createCheckoutError(
          `Sản phẩm "${product.name}" không đủ số lượng tồn kho`
        );
      }

      if (!Number.isFinite(price) || price < 0) {
        throw createCheckoutError(
          `Giá sản phẩm "${product.name}" không hợp lệ`
        );
      }

      if (!product.storeId) {
        throw createCheckoutError(
          `Sản phẩm "${product.name}" chưa thuộc cửa hàng`
        );
      }

      const storeId = String(product.storeId);

      if (!groupedItems.has(storeId)) {
        groupedItems.set(storeId, []);
      }

      groupedItems.get(storeId).push({
        product,
        quantity,
        price,
        subtotal: roundMoney(price * quantity),
      });
    }

    // 5. Chuẩn bị địa chỉ giao hàng
    const shippingAddress = [
      address.streetAddress,
      address.ward,
      address.district,
      address.province,
    ].join(", ");

    const createdOrders = [];

    // 6. Tạo đơn riêng cho từng cửa hàng
    for (const [storeId, items] of groupedItems) {
      const store = await Store.findByPk(storeId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!store || store.status !== "ACTIVE") {
        throw createCheckoutError(
          "Một cửa hàng trong giỏ hàng hiện không hoạt động"
        );
      }

      const subtotal = roundMoney(
        items.reduce(
          (total, item) => total + item.subtotal,
          0
        )
      );

      // Tạm thời miễn phí vận chuyển
      const shippingFee = 0;
      const discountAmount = 0;

      const totalAmount = roundMoney(
        subtotal + shippingFee - discountAmount
      );

      // 7. Tạo Order
      const order = await Order.create(
        {
          orderNumber: createOrderNumber(),
          userId,
          storeId: store.id,
          recipientName: address.recipientName,
          recipientPhone: address.phone,
          shippingAddress,
          subtotal,
          shippingFee,
          discountAmount,
          totalAmount,
          status: "PENDING",
          note: note || null,
        },
        { transaction }
      );

      // 8. Tạo OrderItem
      const orderItems = items.map((item) => ({
        orderId: order.id,
        productId: item.product.id,
        productName: item.product.name,
        unitPrice: item.price,
        quantity: item.quantity,
        subtotal: item.subtotal,
      }));

      await OrderItem.bulkCreate(orderItems, {
        transaction,
      });

      // 9. Trừ tồn kho
      for (const item of items) {
        await item.product.decrement("stock", {
          by: item.quantity,
          transaction,
        });
      }

      // 10. Tạo Payment
      const payment = await Payment.create(
        {
          orderId: order.id,
          paymentMethod,
          amount: totalAmount,
          status: "PENDING",
        },
        { transaction }
      );

      createdOrders.push({
        id: order.id,
        orderNumber: order.orderNumber,
        storeId: store.id,
        storeName: store.storeName,
        subtotal,
        shippingFee,
        totalAmount,
        status: order.status,
        payment: {
          id: payment.id,
          paymentMethod: payment.paymentMethod,
          amount: Number(payment.amount),
          status: payment.status,
        },
      });
    }

    // 11. Chuyển giỏ hàng thành đã đặt hàng
    await cart.update(
      {
        status: "CONVERTED",
      },
      { transaction }
    );

    return {
      orders: createdOrders,
      totalOrders: createdOrders.length,
      totalAmount: roundMoney(
        createdOrders.reduce(
          (total, order) => total + order.totalAmount,
          0
        )
      ),
    };
  });
};
