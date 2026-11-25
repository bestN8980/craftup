
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  CalendarDays,
  ShoppingBag,
} from "lucide-react";

import api from "../../services/api";
import "../../styles/MyOrders.css";

// ======================================
// 1. CẤU HÌNH TRẠNG THÁI
// ======================================

const statusConfig = {
  pending: {
    label: "Chờ xác nhận",
    className: "pending",
    icon: Clock,
  },
  processing: {
    label: "Đang xử lý",
    className: "processing",
    icon: Package,
  },
  shipping: {
    label: "Đang giao",
    className: "shipping",
    icon: Truck,
  },
  completed: {
    label: "Đã hoàn thành",
    className: "completed",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Đã hủy",
    className: "cancelled",
    icon: XCircle,
  },
};

const filters = [
  { id: "all", label: "Tất cả" },
  { id: "pending", label: "Chờ xác nhận" },
  { id: "processing", label: "Đang xử lý" },
  { id: "shipping", label: "Đang giao" },
  { id: "completed", label: "Đã hoàn thành" },
  { id: "cancelled", label: "Đã hủy" },
];

const trackingSteps = [
  { id: "pending", label: "Đặt hàng thành công" },
  { id: "confirmed", label: "Người bán xác nhận" },
  { id: "shipping", label: "Đang vận chuyển" },
  { id: "completed", label: "Giao hàng thành công" },
];

// ======================================
// 2. CHUYỂN ĐỔI DỮ LIỆU BACKEND
// ======================================

const mapOrderStatus = (status) => {
  const statusMap = {
    PENDING: "pending",
    CONFIRMED: "processing",
    PROCESSING: "processing",
    SHIPPED: "shipping",
    DELIVERED: "completed",
    CANCELLED: "cancelled",
  };

  return statusMap[status] || "pending";
};

const formatOrderDate = (date) => {
  if (!date) return "Chưa xác định";

  return new Date(date).toLocaleDateString("vi-VN");
};

const mapOrderData = (order) => {
  const items = order.items || [];

  return {
    id: order.orderNumber,

    product: items.length
      ? items.map((item) => item.productName).join(", ")
      : "Đơn hàng",

    shop: order.store?.storeName || "Cửa hàng CraftUp",

    price: Number(order.totalAmount || 0),

    quantity: items.reduce(
      (total, item) => total + Number(item.quantity || 0),
      0
    ),

    date: formatOrderDate(order.createdAt),

    status: mapOrderStatus(order.status),

    payment: "Chưa có thông tin thanh toán",

    address: order.shippingAddress || "",

    customer: order.recipientName || "",

    phone: order.recipientPhone || "",

    note: order.note || "",

    image: "📦",

    items,
  };
};

// ======================================
// 3. MODAL CHI TIẾT ĐƠN HÀNG
// ======================================

const OrderDetailModal = ({ order, onClose }) => {
  if (!order) return null;

  const progressByStatus = {
    pending: 0,
    processing: 1,
    shipping: 2,
    completed: 4,
    cancelled: 0,
  };

  const progress = progressByStatus[order.status] ?? 0;

  return (
    <div
      className="my-order-modal-overlay"
      onClick={onClose}
    >
      <div
        className="my-order-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="my-order-modal-header">
          <div>
            <span>CHI TIẾT ĐƠN HÀNG</span>
            <h2>#{order.id}</h2>
          </div>

          <button onClick={onClose} aria-label="Đóng">
            <X size={21} />
          </button>
        </div>

        <div className="my-order-modal-body">
          <div className="my-order-detail-product">
            <div className="my-order-product-emoji">
              {order.image}
            </div>

            <div>
              <strong>{order.product}</strong>
              <span>{order.shop}</span>
              <small>Số lượng: {order.quantity}</small>
            </div>
          </div>

          <div className="my-order-detail-status">
            <span>Trạng thái đơn hàng</span>

            <strong
              className={`my-order-status ${
                statusConfig[order.status].className
              }`}
            >
              {statusConfig[order.status].label}
            </strong>
          </div>

          {order.status !== "cancelled" && (
            <div className="my-order-tracking">
              <h3>Tiến trình đơn hàng</h3>

              {trackingSteps.map((step, index) => {
                const done = index < progress;
                const active = index === progress;

                return (
                  <div
                    className={`my-order-tracking-step ${
                      done ? "done" : ""
                    } ${active ? "active" : ""}`}
                    key={step.id}
                  >
                    <div className="my-order-tracking-marker">
                      {done ? (
                        <CheckCircle2 size={17} />
                      ) : (
                        index + 1
                      )}
                    </div>

                    <div>
                      <strong>{step.label}</strong>

                      {active && (
                        <span>Đang cập nhật</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {order.status === "cancelled" && (
            <div className="my-order-cancel-note">
              <XCircle size={19} />
              Đơn hàng này đã bị hủy.
            </div>
          )}

          <div className="my-order-detail-info">
            <h3>Thông tin giao hàng</h3>

            <p>
              <strong>Người nhận:</strong> {order.customer}
            </p>

            <p>
              <strong>Số điện thoại:</strong> {order.phone}
            </p>

            <p>
              <strong>Địa chỉ:</strong> {order.address}
            </p>

            <p>
              <strong>Thanh toán:</strong> {order.payment}
            </p>

            <p>
              <strong>Ngày đặt:</strong> {order.date}
            </p>

            {order.note && (
              <p>
                <strong>Ghi chú:</strong> {order.note}
              </p>
            )}
          </div>

          <div className="my-order-detail-total">
            <span>Tổng thanh toán</span>

            <strong>
              {order.price.toLocaleString("vi-VN")}đ
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};

// ======================================
// 4. MY ORDERS COMPONENT
// ======================================

const MyOrders = () => {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Lấy đơn hàng từ Backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/orders/my-orders", {
          params: {
            page: 1,
            limit: 50,
          },
        });

        const orderData = response.data.data.orders || [];

        setOrders(orderData.map(mapOrderData));
      } catch (error) {
        console.error("Fetch orders error:", error);

        setError(
          error.response?.data?.message ||
          "Không thể tải danh sách đơn hàng"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Lọc và tìm kiếm
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesFilter =
        activeFilter === "all" ||
        order.status === activeFilter;

      const keyword = search.trim().toLowerCase();

      const matchesSearch =
        !keyword ||
        order.id.toLowerCase().includes(keyword) ||
        order.product.toLowerCase().includes(keyword) ||
        order.shop.toLowerCase().includes(keyword);

      return matchesFilter && matchesSearch;
    });
  }, [orders, activeFilter, search]);

  // Đếm số lượng đơn hàng theo trạng thái
  const countByStatus = (status) => {
    if (status === "all") return orders.length;

    return orders.filter(
      (order) => order.status === status
    ).length;
  };

  // ======================================
  // 5. GIAO DIỆN
  // ======================================

  return (
    <div className="my-orders-page">
      <div className="my-orders-heading">
        <div>
          <span className="my-orders-eyebrow">
            LỊCH SỬ MUA SẮM
          </span>

          <h2>Đơn hàng của tôi</h2>

          <p>
            Theo dõi và quản lý tất cả đơn hàng của bạn.
          </p>
        </div>

        <div className="my-orders-heading-icon">
          <ShoppingBag size={29} />
        </div>
      </div>

      <div className="my-orders-summary">
        <div>
          <Package size={20} />
          <span>Tổng đơn hàng</span>
          <strong>{orders.length}</strong>
        </div>

        <div>
          <Clock size={20} />
          <span>Đang xử lý</span>

          <strong>
            {orders.filter((order) =>
              ["pending", "processing"].includes(order.status)
            ).length}
          </strong>
        </div>

        <div>
          <Truck size={20} />
          <span>Đang giao</span>
          <strong>{countByStatus("shipping")}</strong>
        </div>

        <div>
          <CheckCircle2 size={20} />
          <span>Hoàn thành</span>
          <strong>{countByStatus("completed")}</strong>
        </div>
      </div>

      <div className="my-orders-toolbar">
        <div className="my-orders-search">
          <Search size={18} />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm mã đơn hàng, sản phẩm hoặc cửa hàng..."
          />
        </div>
      </div>

      <div className="my-orders-filters">
        {filters.map((filter) => (
          <button
            key={filter.id}
            className={
              activeFilter === filter.id ? "active" : ""
            }
            onClick={() => setActiveFilter(filter.id)}
          >
            {filter.label}
            <span>{countByStatus(filter.id)}</span>
          </button>
        ))}
      </div>

      <div className="my-orders-list">
        {loading ? (
          <div className="my-orders-empty">
            <Package size={38} />
            <h3>Đang tải đơn hàng...</h3>
            <p>Vui lòng chờ trong giây lát.</p>
          </div>
        ) : error ? (
          <div className="my-orders-empty">
            <XCircle size={38} />
            <h3>Không thể tải đơn hàng</h3>
            <p>{error}</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const status = statusConfig[order.status];
            const StatusIcon = status.icon;

            return (
              <div
                className="my-order-card"
                key={order.id}
              >
                <div className="my-order-card-top">
                  <div>
                    <span>MÃ ĐƠN HÀNG</span>
                    <strong>#{order.id}</strong>
                  </div>

                  <span
                    className={`my-order-status ${status.className}`}
                  >
                    <StatusIcon size={14} />
                    {status.label}
                  </span>
                </div>

                <div className="my-order-card-product">
                  <div className="my-order-product-emoji">
                    {order.image}
                  </div>

                  <div className="my-order-card-info">
                    <strong>{order.product}</strong>
                    <span>{order.shop}</span>
                    <small>
                      Số lượng: {order.quantity}
                    </small>
                  </div>

                  <div className="my-order-card-price">
                    <span>Thành tiền</span>

                    <strong>
                      {order.price.toLocaleString("vi-VN")}đ
                    </strong>
                  </div>
                </div>

                <div className="my-order-card-bottom">
                  <div className="my-order-date">
                    <CalendarDays size={15} />
                    Ngày đặt: {order.date}
                  </div>

                  <button
                    onClick={() => setSelectedOrder(order)}
                  >
                    <Eye size={16} />
                    Xem chi tiết
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="my-orders-empty">
            <Package size={38} />

            <h3>
              {orders.length === 0
                ? "Bạn chưa có đơn hàng nào"
                : "Không tìm thấy đơn hàng"}
            </h3>

            <p>
              {orders.length === 0
                ? "Các đơn hàng bạn đặt sẽ xuất hiện tại đây."
                : "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc."}
            </p>

            {(search || activeFilter !== "all") && (
              <button
                onClick={() => {
                  setSearch("");
                  setActiveFilter("all");
                }}
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default MyOrders;
    