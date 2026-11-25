import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import {
  Search,
  ShoppingBag,
  Eye,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
} from "lucide-react";

import OrderDetailModal from "./OrderDetailModal";
import "../../styles/SellerOrders.css";

const statusConfig = {
  PENDING: { label: "Chờ xác nhận", className: "pending" },
  CONFIRMED: { label: "Đã xác nhận", className: "pending" },
  PROCESSING: { label: "Đang xử lý", className: "processing" },
  SHIPPED: { label: "Đang giao", className: "shipping" },
  DELIVERED: { label: "Đã giao", className: "completed" },
  CANCELLED: { label: "Đã hủy", className: "cancelled" },
};

function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/orders/seller?page=1&limit=100"
      );

      setOrders(response.data.data.orders || []);
    } catch (err) {
      console.error("Lỗi tải đơn hàng:", err);

      setError(
        err.response?.data?.message ||
          "Không thể tải danh sách đơn hàng."
      );
    } finally {
      setLoading(false);
    }
  };

  fetchOrders();
}, []);

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN").format(price) + " ₫";

  const filteredOrders = useMemo(() => {
  return orders.filter((order) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      String(order.orderNumber || "")
        .toLowerCase()
        .includes(keyword) ||
      (order.customer?.fullName || "")
        .toLowerCase()
        .includes(keyword);

    const matchesFilter =
      filter === "all" || order.status === filter;

    return matchesSearch && matchesFilter;
  });
}, [orders, search, filter]);

  const updateStatus = async (id, newStatus) => {
  try {
    await api.patch(
      `/orders/seller/${id}/status`,
      { status: newStatus }
    );

    setOrders((prev) =>
      prev.map((order) =>
        order.id === id
          ? { ...order, status: newStatus }
          : order
      )
    );

    setSelectedOrder((prev) =>
      prev?.id === id
        ? { ...prev, status: newStatus }
        : prev
    );
  } catch (err) {
    console.error("Lỗi cập nhật trạng thái:", err);

    alert(
      err.response?.data?.message ||
        "Không thể cập nhật trạng thái đơn hàng."
    );
  }
};

  const counts = {
  all: orders.length,
  pending: orders.filter((o) => o.status === "PENDING").length,
  processing: orders.filter(
    (o) => ["CONFIRMED", "PROCESSING"].includes(o.status)
  ).length,
  shipping: orders.filter((o) => o.status === "SHIPPED").length,
  completed: orders.filter((o) => o.status === "DELIVERED").length,
  cancelled: orders.filter((o) => o.status === "CANCELLED").length,
};

  return (
    <div className="seller-orders">
      <div className="orders-heading">
        <div>
          <h2>Quản lý đơn hàng</h2>
          <p>Theo dõi và xử lý các đơn hàng từ khách hàng.</p>
        </div>
      </div>

      <div className="orders-stat-grid">
        <div className="orders-stat-card">
          <ShoppingBag size={20} />
          <span>Tổng đơn hàng</span>
          <strong>{counts.all}</strong>
        </div>

        <div className="orders-stat-card">
          <Clock size={20} />
          <span>Chờ xác nhận</span>
          <strong>{counts.pending}</strong>
        </div>

        <div className="orders-stat-card">
          <Package size={20} />
          <span>Đang giao</span>
          <strong>{counts.shipping}</strong>
        </div>

        <div className="orders-stat-card">
          <CheckCircle size={20} />
          <span>Đã giao</span>
          <strong>{counts.completed}</strong>
        </div>
      </div>

      <div className="orders-filter-tabs">
        {[
          ["all", "Tất cả"],
          ["pending", "Chờ xác nhận"],
          ["processing", "Đang xử lý"],
          ["shipping", "Đang giao"],
          ["completed", "Đã giao"],
          ["cancelled", "Đã hủy"],
        ].map(([value, label]) => (
          <button
            key={value}
            className={filter === value ? "active" : ""}
            onClick={() => setFilter(value)}
          >
            {label}
            <span>{counts[value]}</span>
          </button>
        ))}
      </div>

      <div className="orders-toolbar">
        <div className="orders-search">
          <Search size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm mã đơn hàng hoặc tên khách hàng..."
          />
        </div>

        <div className="orders-filter-select">
          <Filter size={17} />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="processing">Đang xử lý</option>
            <option value="shipping">Đang giao</option>
            <option value="completed">Đã giao</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      <div className="orders-table-wrapper">
        {loading && (
        <div className="orders-empty">
          Đang tải danh sách đơn hàng...
        </div>
      )}

      {!loading && error && (
        <div className="orders-empty">
          {error}
        </div>
      )}
        <table className="orders-table">
          <thead>
            <tr>
              <th>MÃ ĐƠN</th>
              <th>KHÁCH HÀNG</th>
              <th>NGÀY ĐẶT</th>
              <th>TỔNG TIỀN</th>
              <th>TRẠNG THÁI</th>
              <th>CHI TIẾT</th>
            </tr>
          </thead>

          <tbody>
            {!loading && !error && filteredOrders.map((order) => {
              const status = statusConfig[order.status];

              return (
                <tr key={order.id}>
                  <td className="order-id">#{order.orderNumber}</td>
                  <td>
                  <div className="order-customer">
                    <strong>
                      {order.customer?.fullName || "Chưa cập nhật"}
                    </strong>
                    <span>
                      {order.recipientPhone || order.customer?.phone || "—"}
                    </span>
                  </div>
                </td>
                  <td>
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="order-total">
                    {formatPrice(order.totalAmount)}
                  </td>
                  <td>
                    <span className={`order-status ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                  <td>
                    <button
                      className="order-view-btn"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye size={16} />
                      Xem
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!loading && !error && filteredOrders.length === 0 && (
          <div className="orders-empty">
            <ShoppingBag size={35} />
            <h3>Không tìm thấy đơn hàng</h3>
            <p>Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.</p>
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={updateStatus}
        />
      )}
    </div>
  );
}

export default SellerOrders;
