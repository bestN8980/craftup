
import {
  X,
  Package,
  MapPin,
  User,
  Phone,
} from "lucide-react";

const formatPrice = (price) =>
  `${Number(price || 0).toLocaleString("vi-VN")} ₫`;

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleString("vi-VN");
};

const statusConfig = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang xử lý",
  SHIPPED: "Đang giao",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã hủy",
};

const nextStatus = {
  PENDING: "CONFIRMED",
  CONFIRMED: "PROCESSING",
  PROCESSING: "SHIPPED",
  SHIPPED: "DELIVERED",
};

function OrderDetailModal({
  order,
  onClose,
  onUpdateStatus,
  updating = false,
}) {
  if (!order) return null;

  const items = order.items || [];
  const currentStatus = order.status;

  const next = nextStatus[currentStatus];

  return (
    <div
      className="order-modal-overlay"
      onMouseDown={onClose}
    >
      <div
        className="order-detail-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="order-modal-header">
          <div>
            <h2>Chi tiết đơn hàng</h2>
            <p>Mã đơn: {order.orderNumber}</p>
          </div>

          <button
            onClick={onClose}
            className="order-modal-close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="order-detail-body">
          <section className="order-detail-section">
            <h3>
              <User size={17} /> Thông tin khách hàng
            </h3>

            <p>
              <strong>Họ tên:</strong>{" "}
              {order.customer?.fullName || "Chưa cập nhật"}
            </p>

            <p>
              <strong>Số điện thoại:</strong>{" "}
              {order.recipientPhone ||
                order.customer?.phone ||
                "Chưa cập nhật"}
            </p>

            <p>
              <strong>Email:</strong>{" "}
              {order.customer?.email || "Chưa cập nhật"}
            </p>
          </section>

          <section className="order-detail-section">
            <h3>
              <Package size={17} /> Sản phẩm đặt mua
            </h3>

            {items.length > 0 ? (
              items.map((item) => (
                <div
                  className="order-detail-product"
                  key={item.id}
                >
                  <div>
                    <strong>{item.productName}</strong>
                    <span>
                      Số lượng: {item.quantity}
                    </span>
                    <span>
                      Đơn giá: {formatPrice(item.unitPrice)}
                    </span>
                  </div>

                  <strong>
                    {formatPrice(item.subtotal)}
                  </strong>
                </div>
              ))
            ) : (
              <p>Không có thông tin sản phẩm.</p>
            )}
          </section>

          <section className="order-detail-section">
            <h3>
              <MapPin size={17} /> Thông tin giao hàng
            </h3>

            <p>
              <strong>Địa chỉ:</strong>{" "}
              {order.shippingAddress || "Chưa cập nhật"}
            </p>

            <p>
              <strong>Ngày đặt:</strong>{" "}
              {formatDate(order.createdAt)}
            </p>

            <p>
              <strong>Ghi chú:</strong>{" "}
              {order.note || "Không có"}
            </p>
          </section>

          <section className="order-detail-section">
            <h3>
              <Phone size={17} /> Chi tiết thanh toán
            </h3>

            <p>
              <strong>Tiền hàng:</strong>{" "}
              {formatPrice(order.subtotal)}
            </p>

            <p>
              <strong>Phí vận chuyển:</strong>{" "}
              {formatPrice(order.shippingFee)}
            </p>

            <p>
              <strong>Giảm giá:</strong>{" "}
              {formatPrice(order.discountAmount)}
            </p>
          </section>

          <div className="order-detail-total">
            <span>Tổng thanh toán</span>
            <strong>
              {formatPrice(order.totalAmount)}
            </strong>
          </div>

          <div className="order-status-update">
            <label>Trạng thái đơn hàng</label>

            <p>
              {statusConfig[currentStatus] || currentStatus}
            </p>

            {next && (
              <button
                type="button"
                disabled={updating}
                onClick={() =>
                  onUpdateStatus(order.id, next)
                }
              >
                {updating
                  ? "Đang cập nhật..."
                  : `Chuyển sang: ${statusConfig[next]}`}
              </button>
            )}

            {currentStatus === "DELIVERED" && (
              <p className="order-terminal-note">
                Đơn hàng đã được giao thành công.
              </p>
            )}

            {currentStatus === "CANCELLED" && (
              <p className="order-terminal-note">
                Đơn hàng đã bị hủy.
              </p>
            )}
          </div>
        </div>

        <div className="order-modal-footer">
          <button onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailModal;
