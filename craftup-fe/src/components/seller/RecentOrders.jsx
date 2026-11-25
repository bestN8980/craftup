
import { useEffect, useState } from "react";
import { ArrowRight, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const formatPrice = (price) =>
  `${Number(price || 0).toLocaleString("vi-VN")}đ`;

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const statusConfig = {
  PENDING: {
    label: "Chờ xác nhận",
    className: "pending",
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    className: "pending",
  },
  PROCESSING: {
    label: "Đang xử lý",
    className: "shipping",
  },
  SHIPPED: {
    label: "Đang giao",
    className: "shipping",
  },
  DELIVERED: {
    label: "Đã giao",
    className: "delivered",
  },
  CANCELLED: {
    label: "Đã hủy",
    className: "cancelled",
  },
};

function RecentOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          "/orders/seller?page=1&limit=5"
        );

        setOrders(response.data.data.orders || []);
      } catch (err) {
        console.error("Lỗi lấy đơn hàng gần đây:", err);

        setError(
          err.response?.data?.message ||
            "Không thể tải danh sách đơn hàng"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="seller-panel orders-panel">
      <div className="seller-panel-header">
        <div>
          <h3>Đơn hàng gần đây</h3>
          <p>Theo dõi các đơn hàng mới nhất</p>
        </div>

        <button
          className="seller-text-btn"
          onClick={() => navigate("/seller/dashboard")}
        >
          Xem tất cả <ArrowRight size={15} />
        </button>
      </div>

      {loading ? (
        <p>Đang tải đơn hàng...</p>
      ) : error ? (
        <p className="revenue-error">{error}</p>
      ) : orders.length === 0 ? (
        <p>Chưa có đơn hàng nào.</p>
      ) : (
        <div className="seller-table-wrapper">
          <table className="seller-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Sản phẩm</th>
                <th>Ngày đặt</th>
                <th>Giá trị</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => {
                const status =
                  statusConfig[order.status] || {
                    label: order.status,
                    className: "pending",
                  };

                const productNames =
                  order.items
                    ?.map((item) => item.productName)
                    .filter(Boolean) || [];

                const productText =
                  productNames.length > 0
                    ? productNames.join(", ")
                    : "Không có sản phẩm";

                return (
                  <tr key={order.id}>
                    <td className="order-id">
                      {order.orderNumber}
                    </td>

                    <td>
                      {order.customer?.fullName || "Khách hàng"}
                    </td>

                    <td>{productText}</td>

                    <td>{formatDate(order.createdAt)}</td>

                    <td className="order-price">
                      {formatPrice(order.totalAmount)}
                    </td>

                    <td>
                      <span
                        className={`order-status ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>

                    <td>
                      <button
                        className="order-more"
                        aria-label="Xem chi tiết đơn hàng"
                        onClick={() =>
                          navigate(`/seller/orders/${order.id}`)
                        }
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default RecentOrders;
