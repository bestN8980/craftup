import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api";

import { useAuth } from "../../context/AuthContext";

import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  MessageCircle,
  Store,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

const SellerSidebar = ({
  activePage,
  onNavigate,
  collapsed,
  onToggle,
  mobileOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [unreadMessages, setUnreadMessages] = useState(0);

  // Lấy tổng số tin nhắn chưa đọc
  useEffect(() => {
    let isMounted = true;

    const fetchUnreadMessages = async () => {
      try {
        const response = await api.get("/conversations");

        const conversations = response.data.data || [];

        const total = conversations.reduce(
          (sum, item) => sum + Number(item.unreadCount || 0),
          0
        );

        if (isMounted) {
          setUnreadMessages(total);
        }
      } catch (error) {
        console.error(
          "Lỗi lấy số tin nhắn chưa đọc:",
          error
        );
      }
    };

    fetchUnreadMessages();

    // Cập nhật mỗi 10 giây
    const interval = setInterval(fetchUnreadMessages, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const menuItems = [
    { id: "overview", label: "Tổng quan", icon: LayoutDashboard },
    { id: "products", label: "Sản phẩm", icon: Package },
    { id: "orders", label: "Đơn hàng", icon: ShoppingBag, badge: "5" },
    {
      id: "messages",
      label: "Tin nhắn",
      icon: MessageCircle,
      badge: unreadMessages > 0 ? String(unreadMessages) : null,
    },
    { id: "store", label: "Gian hàng", icon: Store },
  ];

  // Xử lý đăng xuất
  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {mobileOpen && (
        <div className="seller-overlay" onClick={onClose} />
      )}

      <aside
        className={`seller-sidebar
          ${collapsed ? "collapsed" : ""}
          ${mobileOpen ? "mobile-open" : ""}`}
      >
        <div className="seller-sidebar-header">
          <a href="/" className="seller-logo">
            Craft<span>Up.</span>
          </a>

          <button
            className="seller-mobile-close"
            onClick={onClose}
            aria-label="Đóng menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="seller-store-info">
          <div className="seller-store-avatar">M</div>

          {!collapsed && (
            <div className="seller-store-text">
              <strong>Gốm Mộc Việt</strong>
              <span>Gian hàng của bạn</span>
            </div>
          )}
        </div>

        <div className="seller-menu-label">
          {!collapsed && "QUẢN LÝ"}
        </div>

        <nav className="seller-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={`seller-menu-item ${
                  activePage === item.id ? "active" : ""
                }`}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                title={collapsed ? item.label : ""}
              >
                <Icon size={19} strokeWidth={1.8} />

                {!collapsed && (
                  <>
                    <span>{item.label}</span>

                    {item.badge && (
                      <span className="seller-menu-badge">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        <div className="seller-menu-label seller-bottom-label">
          {!collapsed && "HỆ THỐNG"}
        </div>

        <nav className="seller-menu">
          <button
            className={`seller-menu-item ${
              activePage === "settings" ? "active" : ""
            }`}
            onClick={() => {
              onNavigate("settings");
              onClose();
            }}
            title={collapsed ? "Cài đặt" : ""}
          >
            <Settings size={19} strokeWidth={1.8} />
            {!collapsed && <span>Cài đặt</span>}
          </button>

          <button
            className="seller-menu-item logout-item"
            onClick={handleLogout}
            title={collapsed ? "Đăng xuất" : ""}
          >
            <LogOut size={19} strokeWidth={1.8} />
            {!collapsed && <span>Đăng xuất</span>}
          </button>
        </nav>

        <button
          className="seller-collapse-btn"
          onClick={onToggle}
          title={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
        >
          {collapsed ? (
            <ChevronRight size={17} />
          ) : (
            <ChevronLeft size={17} />
          )}

          {!collapsed && <span>Thu gọn menu</span>}
        </button>
      </aside>
    </>
  );
};

export default SellerSidebar;