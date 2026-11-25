
import { useEffect, useState } from "react";
import {
  MapPin,
  Plus,
  CreditCard,
  Banknote,
  Truck,
  ShieldCheck,
  ShoppingBag,
  CheckCircle2,
  Package,
} from "lucide-react";

import api from "../../services/api";
import "../../styles/Checkout.css";

const formatPrice = (price) =>
  `${Number(price || 0).toLocaleString("vi-VN")}đ`;

const formatAddress = (address) =>
  [
    address.streetAddress,
    address.ward,
    address.district,
    address.province,
  ]
    .filter(Boolean)
    .join(", ");

function Checkout() {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");

  const [cart, setCart] = useState({
    items: [],
    totalItems: 0,
    totalAmount: 0,
  });

  const [payment, setPayment] = useState("COD");
  const [note, setNote] = useState("");

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    recipientName: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    streetAddress: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [success, setSuccess] = useState(false);
  const [orderResult, setOrderResult] = useState(null);

  // 1. Lấy địa chỉ và giỏ hàng từ Backend
  useEffect(() => {
    const fetchCheckoutData = async () => {
      try {
        setLoading(true);
        setError("");

        const [addressResponse, cartResponse] = await Promise.all([
          api.get("/addresses"),
          api.get("/cart"),
        ]);

        const addressData = addressResponse.data.data || [];
        const cartData = cartResponse.data.data || {};

        setAddresses(addressData);

        const defaultAddress = addressData.find(
          (address) => address.isDefault
        );

        if (defaultAddress) {
          setSelectedAddressId(String(defaultAddress.id));
        } else if (addressData.length > 0) {
          setSelectedAddressId(String(addressData[0].id));
        }

        setCart({
          items: cartData.items || [],
          totalItems: cartData.totalItems || 0,
          totalAmount: Number(cartData.totalAmount || 0),
        });
      } catch (err) {
        console.error("Fetch checkout data error:", err);

        setError(
          err.response?.data?.message ||
            "Không thể tải thông tin thanh toán."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCheckoutData();
  }, []);

  // 2. Địa chỉ đang được chọn
  const selectedAddress = addresses.find(
    (address) => String(address.id) === selectedAddressId
  );

  // 3. Tính tiền dựa trên giỏ hàng thật
  const products = cart.items;

  const subtotal = Number(cart.totalAmount || 0);

  // Backend hiện tại đang để phí vận chuyển bằng 0
  const shippingFee = 0;
  const total = subtotal + shippingFee;

  // 4. Chọn địa chỉ
  const selectAddress = (id) => {
    setSelectedAddressId(String(id));
  };

  // 5. Thêm địa chỉ mới
  const addAddress = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/addresses", {
        ...newAddress,
        isDefault: addresses.length === 0,
      });

      const createdAddress = response.data.data;

      setAddresses((prev) => [...prev, createdAddress]);

      setSelectedAddressId(String(createdAddress.id));

      setNewAddress({
        recipientName: "",
        phone: "",
        province: "",
        district: "",
        ward: "",
        streetAddress: "",
      });

      setShowAddressForm(false);
      setError("");
    } catch (err) {
      console.error("Add address error:", err);

      setError(
        err.response?.data?.message ||
          "Không thể thêm địa chỉ. Vui lòng thử lại."
      );
    }
  };

  // 6. Đặt hàng thật
  const placeOrder = async () => {
    if (!selectedAddress) {
      setError("Vui lòng chọn địa chỉ nhận hàng.");
      return;
    }

    if (products.length === 0) {
      setError("Giỏ hàng đang trống.");
      return;
    }

    if (submitting) return;

    try {
      setSubmitting(true);
      setError("");

      const response = await api.post("/orders/checkout", {
        addressId: selectedAddress.id,
        paymentMethod: payment,
        note: note.trim(),
      });

      setOrderResult(response.data.data);
      setSuccess(true);
    } catch (err) {
      console.error("Place order error:", err);

      setError(
        err.response?.data?.message ||
          "Không thể đặt hàng. Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // 7. Màn hình đặt hàng thành công
  if (success) {
    return (
      <div className="checkout-success">
        <div className="checkout-success-icon">
          <CheckCircle2 size={58} />
        </div>

        <span>CRAFTUP · ĐẶT HÀNG THÀNH CÔNG</span>

        <h2>Cảm ơn bạn đã mua sắm!</h2>

        <p>
          Đơn hàng của bạn đã được ghi nhận thành công.
          Bạn có thể theo dõi trạng thái đơn hàng trong mục
          Đơn hàng của tôi.
        </p>

        <div className="checkout-success-code">
          <span>Mã đơn hàng</span>

          {orderResult?.orders?.map((order) => (
            <strong key={order.id}>
              {order.orderNumber}
            </strong>
          ))}

          <span>
            Tổng thanh toán:{" "}
            {formatPrice(orderResult?.totalAmount)}
          </span>
        </div>

        <button onClick={() => (window.location.href = "/")}>
          <ShoppingBag size={17} />
          Tiếp tục mua sắm
        </button>
      </div>
    );
  }

  // 8. Trạng thái đang tải
  if (loading) {
    return (
      <div className="checkout-page">
        <p>Đang tải thông tin thanh toán...</p>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-heading">
        <div>
          <span className="checkout-eyebrow">
            SECURE CHECKOUT
          </span>

          <h2>Thanh toán đơn hàng</h2>

          <p>
            Hoàn tất thông tin để những sản phẩm thủ công
            đến với bạn.
          </p>
        </div>

        <div className="checkout-secure">
          <ShieldCheck size={20} />
          <span>Thanh toán an toàn</span>
        </div>
      </div>

      {error && (
        <div className="checkout-error">
          {error}
        </div>
      )}

      <div className="checkout-layout">
        <div className="checkout-main">
          {/* ĐỊA CHỈ NHẬN HÀNG */}
          <section className="checkout-section">
            <div className="checkout-section-title">
              <div className="checkout-title-icon">
                <MapPin size={20} />
              </div>

              <div>
                <h3>Địa chỉ nhận hàng</h3>
                <p>
                  Chọn địa chỉ bạn muốn nhận đơn hàng.
                </p>
              </div>
            </div>

            <div className="checkout-address-list">
              {addresses.map((address) => (
                <label
                  className={`checkout-address-card ${
                    selectedAddressId === String(address.id)
                      ? "selected"
                      : ""
                  }`}
                  key={address.id}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={
                      selectedAddressId === String(address.id)
                    }
                    onChange={() => selectAddress(address.id)}
                  />

                  <div className="checkout-address-info">
                    <div className="checkout-address-top">
                      <strong>{address.recipientName}</strong>

                      {address.isDefault && (
                        <span>Mặc định</span>
                      )}
                    </div>

                    <p>{address.phone}</p>
                    <p>{formatAddress(address)}</p>
                  </div>
                </label>
              ))}

              {addresses.length === 0 && (
                <p>
                  Bạn chưa có địa chỉ giao hàng. Hãy thêm
                  địa chỉ mới bên dưới.
                </p>
              )}
            </div>

            <button
              type="button"
              className="checkout-add-address"
              onClick={() =>
                setShowAddressForm(!showAddressForm)
              }
            >
              <Plus size={17} />
              Thêm địa chỉ mới
            </button>

            {showAddressForm && (
              <form
                className="checkout-address-form"
                onSubmit={addAddress}
              >
                <h4>Địa chỉ nhận hàng mới</h4>

                <input
                  placeholder="Họ và tên người nhận"
                  value={newAddress.recipientName}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      recipientName: e.target.value,
                    })
                  }
                  required
                />

                <input
                  placeholder="Số điện thoại"
                  value={newAddress.phone}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      phone: e.target.value,
                    })
                  }
                  required
                />

                <input
                  placeholder="Tỉnh / Thành phố"
                  value={newAddress.province}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      province: e.target.value,
                    })
                  }
                  required
                />

                <input
                  placeholder="Quận / Huyện"
                  value={newAddress.district}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      district: e.target.value,
                    })
                  }
                  required
                />

                <input
                  placeholder="Phường / Xã"
                  value={newAddress.ward}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      ward: e.target.value,
                    })
                  }
                  required
                />

                <textarea
                  placeholder="Số nhà, tên đường..."
                  value={newAddress.streetAddress}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      streetAddress: e.target.value,
                    })
                  }
                  required
                />

                <div>
                  <button type="submit">
                    Lưu địa chỉ
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* PHƯƠNG THỨC THANH TOÁN */}
          <section className="checkout-section">
            <div className="checkout-section-title">
              <div className="checkout-title-icon">
                <CreditCard size={20} />
              </div>

              <div>
                <h3>Phương thức thanh toán</h3>
                <p>
                  Chọn cách thanh toán phù hợp với bạn.
                </p>
              </div>
            </div>

            <div className="checkout-payment-list">
              <label
                className={`checkout-payment-card ${
                  payment === "COD" ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={payment === "COD"}
                  onChange={(e) => setPayment(e.target.value)}
                />

                <Banknote size={22} />

                <div>
                  <strong>
                    Thanh toán khi nhận hàng (COD)
                  </strong>

                  <span>
                    Thanh toán trực tiếp khi nhận được sản phẩm.
                  </span>
                </div>
              </label>

              <label
                className={`checkout-payment-card ${
                  payment === "BANK_TRANSFER" ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="BANK_TRANSFER"
                  checked={payment === "BANK_TRANSFER"}
                  onChange={(e) => setPayment(e.target.value)}
                />

                <CreditCard size={22} />

                <div>
                  <strong>
                    Chuyển khoản ngân hàng
                  </strong>

                  <span>
                    Thanh toán bằng tài khoản ngân hàng.
                  </span>
                </div>
              </label>
            </div>
          </section>

          {/* GHI CHÚ */}
          <section className="checkout-section">
            <div className="checkout-section-title">
              <div className="checkout-title-icon">
                <Package size={20} />
              </div>

              <div>
                <h3>Ghi chú đơn hàng</h3>
                <p>
                  Để lại lời nhắn cho người bán nếu cần.
                </p>
              </div>
            </div>

            <textarea
              className="checkout-note"
              placeholder="Ví dụ: Vui lòng gọi trước khi giao hàng..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </section>
        </div>

        {/* TÓM TẮT ĐƠN HÀNG */}
        <aside className="checkout-summary">
          <h3>Đơn hàng của bạn</h3>

          <div className="checkout-products">
            {products.map((item) => (
              <div className="checkout-product" key={item.id}>
                <div className="checkout-product-image">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                    />
                  ) : (
                    <span>🛍️</span>
                  )}

                  <small>{item.quantity}</small>
                </div>

                <div className="checkout-product-info">
                  <strong>{item.productName}</strong>

                  <span>{item.storeName}</span>

                  <b>
                    {formatPrice(item.subtotal)}
                  </b>
                </div>
              </div>
            ))}

            {products.length === 0 && (
              <p>Giỏ hàng của bạn đang trống.</p>
            )}
          </div>

          <div className="checkout-divider" />

          <div className="checkout-price-row">
            <span>Tạm tính</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>

          <div className="checkout-price-row">
            <span>Vận chuyển</span>
            <strong>
              {shippingFee === 0
                ? "Miễn phí"
                : formatPrice(shippingFee)}
            </strong>
          </div>

          <div className="checkout-divider" />

          <div className="checkout-total">
            <span>Tổng thanh toán</span>
            <strong>{formatPrice(total)}</strong>
          </div>

          <button
            className="checkout-place-order"
            onClick={placeOrder}
            disabled={
              submitting ||
              products.length === 0 ||
              !selectedAddress
            }
          >
            {submitting
              ? "Đang xử lý..."
              : "Xác nhận đặt hàng"}

            <Plus size={18} />
          </button>

          <p className="checkout-terms">
            Bằng việc đặt hàng, bạn đồng ý với các điều
            khoản mua sắm của CraftUp.
          </p>

          <div className="checkout-delivery-note">
            <Truck size={18} />

            <span>
              Đơn hàng sẽ được xử lý sau khi xác nhận.
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Checkout;
