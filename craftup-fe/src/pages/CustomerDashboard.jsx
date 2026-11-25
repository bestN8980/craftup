import { useEffect, useState } from "react";
import api from "../services/api";
import CustomerStatCard from "../components/customer/CustomerStatCard";

import {
  Package,
  Heart,
  Settings as SettingsIcon,
  ChevronRight,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Truck,
  ShoppingBag,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import CustomerSidebar from "../components/customer/sidebar/CustomerSidebar";
import { menuItems } from "../components/customer/sidebar/customerMenu";

import CustomerTopbar from "../components/customer/CustomerTopbar";
import CustomerMessages from "../components/customer/CustomerMessages";

import MyOrders from "../components/customer/MyOrders";
import Favorites from "../components/customer/Favorites";
import Addresses from "../components/customer/Addresses";
import Profile from "../components/customer/Profile";
import Settings from "../components/customer/Settings";
import Cart from "../components/customer/Cart";
import Checkout from "../components/customer/Checkout";
import CustomerShopping from "../components/customer/CustomerShopping";

import "../styles/CustomerDashboard.css";

const statusConfig = {
  PENDING: {
    label: "Chờ xác nhận",
    className: "customer-status-pending",
    icon: Clock,
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    className: "customer-status-pending",
    icon: CheckCircle2,
  },
  PROCESSING: {
    label: "Đang xử lý",
    className: "customer-status-pending",
    icon: Clock,
  },
  SHIPPING: {
    label: "Đang giao",
    className: "customer-status-shipping",
    icon: Truck,
  },
  SHIPPED: {
    label: "Đang giao",
    className: "customer-status-shipping",
    icon: Truck,
  },
  DELIVERED: {
    label: "Đã giao hàng",
    className: "customer-status-completed",
    icon: CheckCircle2,
  },
  COMPLETED: {
    label: "Đã hoàn thành",
    className: "customer-status-completed",
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: "Đã hủy",
    className: "customer-status-pending",
    icon: Clock,
  },
};

const CustomerDashboard = () => {
  const { user } = useAuth();

  const [activePage, setActivePage] = useState("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [stats, setStats] = useState({
    totalOrders: 0,
    processingOrders: 0,
    favoriteProducts: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Lấy thống kê khách hàng
  useEffect(() => {
    const fetchCustomerStats = async () => {
      try {
        const response = await api.get("/orders/customer/stats");

        if (response.data?.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error(
          "Lỗi lấy thống kê khách hàng:",
          error.response?.data || error.message
        );
      }
    };

    if (user?.id) {
      fetchCustomerStats();
    }
  }, [user?.id]);

  // Lấy 3 đơn hàng gần đây
  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        setLoadingOrders(true);

        const response = await api.get(
          "/orders/my-orders?page=1&limit=3"
        );

        if (response.data?.success) {
          setRecentOrders(response.data.data?.orders || []);
        }
      } catch (error) {
        console.error(
          "Lỗi lấy đơn hàng gần đây:",
          error.response?.data || error.message
        );
      } finally {
        setLoadingOrders(false);
      }
    };

    if (user?.id) {
      fetchRecentOrders();
    }
  }, [user?.id]);

  const currentPage =
    menuItems.find((item) => item.id === activePage)?.label ||
    "Tổng quan";

  // Định dạng ngày
  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("vi-VN");
  };

  // Lấy tên sản phẩm trong đơn hàng
  const getProductNames = (items = []) => {
    if (!items.length) return "Đơn hàng CraftUp";

    const names = items.map((item) => item.productName);

    if (names.length > 2) {
      return `${names[0]}, ${names[1]} và ${names.length - 2} sản phẩm khác`;
    }

    return names.join(", ");
  };

  // Lấy tổng tiền đơn hàng
  const getOrderTotal = (order) => {
    if (order.totalAmount != null) {
      return Number(order.totalAmount);
    }

    if (order.totalPrice != null) {
      return Number(order.totalPrice);
    }

    return (order.items || []).reduce(
      (total, item) => total + Number(item.subtotal || 0),
      0
    );
  };

  // Trang tổng quan
  const renderOverview = () => (
    <>
      <div className="customer-welcome">
        <div>
          <span>KHÔNG GIAN MUA SẮM CỦA BẠN</span>

          <h2>Xin chào, {user?.fullName || "bạn"}!</h2>

          <p>
            Cùng khám phá những sản phẩm thủ công độc đáo từ các nghệ nhân
            Việt Nam.
          </p>
        </div>

        <div className="customer-welcome-icon">
          <ShoppingBag size={42} />
        </div>
      </div>

      <div className="customer-stats">
        <CustomerStatCard
          icon={Package}
          color="brown"
          title="Tổng đơn hàng"
          value={stats.totalOrders}
          description="Trong lịch sử mua sắm"
        />

        <CustomerStatCard
          icon={Clock}
          color="orange"
          title="Đang xử lý"
          value={stats.processingOrders}
          description="Đơn hàng đang thực hiện"
        />

        <CustomerStatCard
          icon={Heart}
          color="pink"
          title="Yêu thích"
          value={stats.favoriteProducts}
          description="Sản phẩm đã lưu"
        />
      </div>

      {/* ĐƠN HÀNG GẦN ĐÂY */}
      <section className="customer-section">
        <div className="customer-section-heading">
          <div>
            <h3>Đơn hàng gần đây</h3>
            <p>Theo dõi những đơn hàng mới nhất của bạn.</p>
          </div>

          <button
            className="customer-text-btn"
            onClick={() => setActivePage("orders")}
          >
            Xem tất cả <ChevronRight size={16} />
          </button>
        </div>

        <div className="customer-order-list">
          {loadingOrders ? (
            <p>Đang tải đơn hàng...</p>
          ) : recentOrders.length === 0 ? (
            <div className="customer-empty-orders">
              <Package size={36} />

              <p>Bạn chưa có đơn hàng nào.</p>

              <button onClick={() => setActivePage("shopping")}>
                Khám phá sản phẩm
              </button>
            </div>
          ) : (
            recentOrders.map((order) => {
              const status =
                statusConfig[String(order.status).toUpperCase()] || {
                  label: order.status || "Đang cập nhật",
                  className: "customer-status-pending",
                  icon: Clock,
                };

              const StatusIcon = status.icon;

              return (
                <div
                  className="customer-order-item"
                  key={order.id}
                >
                  <div className="customer-order-image">
                    <Package size={26} />
                  </div>

                  <div className="customer-order-info">
                    <strong>
                      {getProductNames(order.items)}
                    </strong>

                    <span>
                      {order.store?.storeName || "CraftUp"}
                    </span>

                    <small>
                      Mã đơn: {order.orderNumber || order.id}
                      {" · "}
                      {formatDate(order.createdAt)}
                    </small>
                  </div>

                  <div className="customer-order-right">
                    <strong>
                      {getOrderTotal(order).toLocaleString("vi-VN")}đ
                    </strong>

                    <span
                      className={`customer-status ${status.className}`}
                    >
                      <StatusIcon size={13} />
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* KHÁM PHÁ CRAFTUP */}
      <section className="customer-section">
        <div className="customer-section-heading">
          <div>
            <h3>Khám phá CraftUp</h3>
            <p>Những giá trị thủ công đang chờ bạn khám phá.</p>
          </div>
        </div>

        <div className="customer-discover-card">
          <div>
            <span>CRAFTUP · HANDMADE VIETNAM</span>

            <h3>Mỗi sản phẩm là một câu chuyện.</h3>

            <p>
              Khám phá những sản phẩm được tạo nên từ đôi bàn tay và tâm
              huyết của các nghệ nhân Việt.
            </p>

            <button onClick={() => setActivePage("shopping")}>
              Khám phá sản phẩm <ArrowUpRight size={17} />
            </button>
          </div>

          <div className="customer-discover-icon">
            <ShoppingBag size={64} />
          </div>
        </div>
      </section>
    </>
  );

  // Trang placeholder
  const renderPlaceholder = () => (
    <div className="customer-placeholder">
      <div className="customer-placeholder-icon">
        {(() => {
          const Icon =
            menuItems.find((item) => item.id === activePage)?.icon ||
            SettingsIcon;

          return <Icon size={32} />;
        })()}
      </div>

      <h2>{currentPage}</h2>

      <p>
        Khu vực này sẽ được hoàn thiện trong bước tiếp theo.
      </p>

      <button onClick={() => setActivePage("overview")}>
        Quay lại tổng quan
      </button>
    </div>
  );

  return (
    <div className="customer-layout">
      <CustomerSidebar
        user={user}
        activePage={activePage}
        setActivePage={setActivePage}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main className="customer-main">
        <CustomerTopbar
          pageTitle={currentPage}
          onOpenMenu={() => setMobileOpen(true)}
          onProfileClick={() => setActivePage("profile")}
          onSearch={(keyword) => {
            setSearchQuery(keyword);
            setActivePage("shopping");
          }}
        />

        <div className="customer-content">
          {activePage === "overview" && renderOverview()}

          {activePage === "shopping" && (
            <CustomerShopping searchQuery={searchQuery} />
          )}

          {activePage === "cart" && (
            <Cart
              onCheckout={() => setActivePage("checkout")}
              onContinueShopping={() => setActivePage("shopping")}
            />
          )}

          {activePage === "orders" && <MyOrders />}

          {activePage === "messages" && <CustomerMessages />}

          {activePage === "favorites" && <Favorites />}

          {activePage === "addresses" && <Addresses />}

          {activePage === "profile" && <Profile />}

          {activePage === "settings" && <Settings />}

          {activePage === "checkout" && <Checkout />}

          {![
            "overview",
            "shopping",
            "cart",
            "orders",
            "messages",
            "favorites",
            "addresses",
            "profile",
            "settings",
            "checkout",
          ].includes(activePage) && renderPlaceholder()}
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;