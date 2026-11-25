import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
} from "react";

import { useAuth } from "./AuthContext";
import api from "../services/api";
import {
  connectSocket,
  disconnectSocket,
} from "../socket/socket";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user, token, isAuthenticated, loading } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationLoading, setNotificationLoading] = useState(false);

  // Lấy danh sách thông báo
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setNotificationLoading(true);

      const [notificationRes, countRes] = await Promise.all([
        api.get("/notifications?page=1&limit=20"),
        api.get("/notifications/unread-count"),
      ]);

      setNotifications(
        notificationRes.data.data.notifications || []
      );

      setUnreadCount(
        countRes.data.data.unreadCount || 0
      );
    } catch (error) {
      console.error("Fetch notifications error:", error);
    } finally {
      setNotificationLoading(false);
    }
  }, [isAuthenticated]);

  // Đánh dấu một thông báo đã đọc
  // Đánh dấu một thông báo đã đọc
const markAsRead = async (notificationId) => {
  try {
    await api.patch(`/notifications/${notificationId}/read`);

    const targetWasUnread = notifications.some(
      (item) =>
        String(item.id) === String(notificationId) &&
        !item.isRead
    );

    setNotifications((prev) =>
      prev.map((item) =>
        String(item.id) === String(notificationId)
          ? {
              ...item,
              isRead: true,
              readAt: item.readAt || new Date(),
            }
          : item
      )
    );

    if (targetWasUnread) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  } catch (error) {
    console.error("Mark notification as read error:", error);
    throw error;
  }
};

  // Đánh dấu tất cả thông báo đã đọc
  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          isRead: true,
          readAt: item.readAt || new Date(),
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("Mark all notifications as read error:", error);
      throw error;
    }
  };

  // Kết nối Socket.IO và nhận thông báo realtime
  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated || !token) {
      setNotifications([]);
      setUnreadCount(0);
      disconnectSocket();
      return;
    }

    fetchNotifications();

    const socket = connectSocket(token);

    const handleNewNotification = (data) => {
      const newNotification = data?.notification;

      if (!newNotification) return;

      setNotifications((prev) => {
        const exists = prev.some(
          (item) => String(item.id) === String(newNotification.id)
        );

        if (exists) return prev;

        return [newNotification, ...prev].slice(0, 20);
      });

      if (!newNotification.isRead) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    socket.on("new_notification", handleNewNotification);

    return () => {
      socket.off("new_notification", handleNewNotification);
    };
  }, [
    loading,
    isAuthenticated,
    token,
    user?.id,
    fetchNotifications,
  ]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        notificationLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications phải được sử dụng bên trong NotificationProvider"
    );
  }

  return context;
};