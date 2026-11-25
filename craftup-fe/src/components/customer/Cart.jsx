
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Truck,
  ShieldCheck,
  ArrowRight,
  ShoppingBag,
  CheckCircle2,
} from "lucide-react";

import api from "../../services/api";
import "../../styles/Cart.css";

const DEFAULT_IMAGE = "https://placehold.co/700x700?text=CraftUp";

const Cart = ({ onCheckout, onContinueShopping }) => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busyItemId, setBusyItemId] = useState(null);

  // Định dạng giá tiền
  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN").format(Number(price || 0)) + "đ";

  // Lấy giỏ hàng từ Backend
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/cart");

      const data = response.data.data;

      setCartItems(data?.items || []);
    } catch (err) {
      console.error("Lỗi tải giỏ hàng:", err);

      setError(
        err.response?.data?.message ||
          "Không thể tải giỏ hàng. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Tính tổng tiền
  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) =>
          total + Number(item.price) * Number(item.quantity),
        0
      ),
    [cartItems]
  );

  const totalItems = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + Number(item.quantity),
        0
      ),
    [cartItems]
  );

  const shippingFee =
    subtotal === 0 || subtotal >= 500000 ? 0 : 30000;

  const total = subtotal + shippingFee;

  // Cập nhật số lượng
  const updateQuantity = async (item, amount) => {
    const newQuantity = item.quantity + amount;

    if (newQuantity < 1) return;

    if (newQuantity > item.stock) {
      setMessage(`Sản phẩm chỉ còn ${item.stock} sản phẩm trong kho.`);
      return;
    }

    try {
      setBusyItemId(item.id);
      setMessage("");

      await api.patch(`/cart/items/${item.id}`, {
        quantity: newQuantity,
      });

      await fetchCart();
    } catch (err) {
      console.error("Lỗi cập nhật số lượng:", err);

      setMessage(
        err.response?.data?.message ||
          "Không thể cập nhật số lượng sản phẩm."
      );
    } finally {
      setBusyItemId(null);
    }
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const removeItem = async (itemId) => {
    try {
      setBusyItemId(itemId);
      setMessage("");

      await api.delete(`/cart/items/${itemId}`);

      setCartItems((items) =>
        items.filter((item) => item.id !== itemId)
      );

      setMessage("Đã xóa sản phẩm khỏi giỏ hàng.");
    } catch (err) {
      console.error("Lỗi xóa sản phẩm:", err);

      setMessage(
        err.response?.data?.message ||
          "Không thể xóa sản phẩm khỏi giỏ hàng."
      );
    } finally {
      setBusyItemId(null);
    }
  };

  // Chuyển đến trang thanh toán
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      setMessage("Giỏ hàng của bạn đang trống.");
      return;
    }

    onCheckout?.();
  };

  return (
    <div className="cart-page">
      <div className="cart-heading">
        <div>
          <span className="cart-eyebrow">YOUR SHOPPING SPACE</span>
          <h2>Giỏ hàng của tôi</h2>
          <p>
            Kiểm tra những món đồ thủ công bạn đã chọn trước khi thanh toán.
          </p>
        </div>

        <div className="cart-heading-icon">
          <ShoppingCart size={30} />
          <span>{totalItems}</span>
        </div>
      </div>

      {message && (
        <p className="cart-coupon-message">{message}</p>
      )}

      {loading ? (
        <div className="empty-state">
          Đang tải giỏ hàng...
        </div>
      ) : error ? (
        <div className="cart-empty">
          <h3>Không thể tải giỏ hàng</h3>
          <p>{error}</p>
          <button onClick={fetchCart}>
            Thử lại
          </button>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="cart-empty">
          <div className="cart-empty-icon">
            <ShoppingBag size={42} />
          </div>

          <h3>Giỏ hàng đang trống</h3>

          <p>
            Hãy khám phá những sản phẩm thủ công độc đáo từ các nghệ nhân Việt Nam.
          </p>

          <button onClick={onContinueShopping}>
            Khám phá sản phẩm <ArrowRight size={17} />
          </button>
        </div>
      ) : (
        <div className="cart-layout">
          <section className="cart-items-panel">
            <div className="cart-panel-header">
              <span>
                Giỏ hàng ({cartItems.length} sản phẩm)
              </span>

              <span className="cart-header-note">
                Sản phẩm
              </span>
            </div>

            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div className="cart-product-image">
                    <img
                      src={item.imageUrl || DEFAULT_IMAGE}
                      alt={item.productName}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = DEFAULT_IMAGE;
                      }}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>

                  <div className="cart-product-info">
                    <span className="cart-product-category">
                      Sản phẩm thủ công
                    </span>

                    <h3>{item.productName}</h3>

                    <p>
                      {item.storeName || "Cửa hàng CraftUp"}
                    </p>

                    <div className="cart-mobile-price">
                      {formatPrice(item.price)}
                    </div>

                    <div className="cart-item-bottom">
                      <div className="cart-quantity">
                        <button
                          onClick={() => updateQuantity(item, -1)}
                          disabled={
                            item.quantity <= 1 ||
                            busyItemId === item.id
                          }
                          aria-label="Giảm số lượng"
                        >
                          <Minus size={14} />
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          onClick={() => updateQuantity(item, 1)}
                          disabled={
                            item.quantity >= item.stock ||
                            busyItemId === item.id
                          }
                          aria-label="Tăng số lượng"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        className="cart-remove-btn"
                        onClick={() => removeItem(item.id)}
                        disabled={busyItemId === item.id}
                      >
                        <Trash2 size={15} />
                        Xóa
                      </button>
                    </div>

                    {item.stock <= 0 && (
                      <small>Sản phẩm hiện đã hết hàng.</small>
                    )}
                  </div>

                  <div className="cart-product-price">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-continue">
              <button onClick={onContinueShopping}>
                <ArrowRight size={16} />
                Tiếp tục mua sắm
              </button>
            </div>
          </section>

          <aside className="cart-summary">
            <h3>Tóm tắt đơn hàng</h3>

            <div className="cart-summary-count">
              {totalItems} sản phẩm
            </div>

            <div className="cart-summary-divider" />

            <div className="cart-summary-row">
              <span>Tạm tính</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>

            <div className="cart-summary-row">
              <span>Phí vận chuyển</span>
              <strong>
                {shippingFee === 0
                  ? "Miễn phí"
                  : formatPrice(shippingFee)}
              </strong>
            </div>

            <div className="cart-summary-divider" />

            <div className="cart-total-row">
              <span>Tổng thanh toán</span>
              <strong>{formatPrice(total)}</strong>
            </div>

            <button
              className="cart-checkout-btn"
              onClick={handleCheckout}
            >
              Tiến hành thanh toán
              <ArrowRight size={18} />
            </button>

            <div className="cart-benefits">
              <div>
                <Truck size={18} />
                <span>Miễn phí vận chuyển từ 500.000đ</span>
              </div>

              <div>
                <ShieldCheck size={18} />
                <span>Thanh toán an toàn và bảo mật</span>
              </div>

              <div>
                <CheckCircle2 size={18} />
                <span>Sản phẩm thủ công được tuyển chọn</span>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default Cart;
