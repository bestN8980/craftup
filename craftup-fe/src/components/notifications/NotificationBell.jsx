import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Package,
  MessageCircle,
  Info,
  ShoppingBag,
  X,
} from "lucide-react";

import { useNotifications } from "../../context/NotificationContext";
import "../../styles/Notification.css";

const getNotificationIcon = (type) => {
  if (type?.includes("ORDER")) return Package;
  if (type === "MESSAGE") return MessageCircle;
  if (type === "SYSTEM") return Info;

  return ShoppingBag;
};

const formatNotificationTime = (date) => {
  if (!date) return "";

  const now = new Date();
  const createdAt = new Date(date);
  const diff = Math.max(0, now - createdAt);

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;

  return createdAt.toLocaleDateString("vi-VN");
};

const NotificationBell = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);

  const {
    notifications,
    unreadCount,
    notificationLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  // Đóng dropdown khi nhấn bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await markAsRead(notification.id);
      }

      setIsOpen(false);

      if (notification.link) {
        navigate(notification.link);
      }
    } catch (error) {
      console.error("Open notification error:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    try {
      await markAllAsRead();
    } catch (error) {
      console.error("Mark all as read error:", error);
    }
  };

  return (
    <div className="notification-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className={`notification-bell ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Thông báo"
        aria-expanded={isOpen}
      >
        <Bell size={21} />

        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <div>
              <h3>Thông báo</h3>
              <span>
                {unreadCount > 0
                  ? `${unreadCount} thông báo chưa đọc`
                  : "Bạn đã xem hết thông báo"}
              </span>
            </div>

            <button
              type="button"
              className="notification-close"
              onClick={() => setIsOpen(false)}
              aria-label="Đóng"
            >
              <X size={18} />
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              className="notification-mark-all"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck size={16} />
              Đánh dấu tất cả đã đọc
            </button>
          )}

          <div className="notification-list">
            {notificationLoading ? (
              <div className="notification-empty">
                Đang tải thông báo...
              </div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">
                <Bell size={30} />
                <p>Chưa có thông báo nào</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);

                return (
                  <button
                    type="button"
                    key={notification.id}
                    className={`notification-item ${
                      !notification.isRead ? "unread" : ""
                    }`}
                    onClick={() =>
                      handleNotificationClick(notification)
                    }
                  >
                    <div className="notification-item-icon">
                      <Icon size={19} />
                    </div>

                    <div className="notification-item-content">
                      <div className="notification-item-title">
                        <strong>{notification.title}</strong>

                        {!notification.isRead && (
                          <span className="notification-unread-dot" />
                        )}
                      </div>

                      <p>{notification.message}</p>

                      <span className="notification-time">
                        {formatNotificationTime(
                          notification.createdAt
                        )}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="notification-footer">
            <span>Hiển thị tối đa 20 thông báo gần nhất</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;