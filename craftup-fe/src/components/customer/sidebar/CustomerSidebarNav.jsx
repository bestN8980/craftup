import { useCallback, useEffect, useState } from "react";
import { menuItems } from "./customerMenu";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import { connectSocket } from "../../../socket/socket";

const CustomerSidebarNav = ({
  activePage,
  setActivePage,
  onNavigate,
}) => {
  const { user } = useAuth();

  const [unreadMessages, setUnreadMessages] = useState(0);

  // Lấy tổng số tin nhắn chưa đọc
  const loadUnreadMessages = useCallback(async () => {
    try {
      const response = await api.get("/conversations");

      const data = response.data?.data;

      const conversations = Array.isArray(data)
        ? data
        : data?.conversations || [];

      const totalUnread = conversations.reduce(
        (total, conversation) =>
          total + Number(conversation.unreadCount || 0),
        0
      );

      setUnreadMessages(totalUnread);
    } catch (error) {
      console.error(
        "Không thể lấy số tin nhắn chưa đọc:",
        error.response?.data || error.message
      );
    }
  }, []);

  // Lấy số tin nhắn khi mở sidebar hoặc chuyển trang
  useEffect(() => {
    if (!user?.id) return;

    loadUnreadMessages();

    // Khi vào trang tin nhắn, chờ API đánh dấu đã đọc
    // rồi cập nhật lại số lượng
    let timer;

    if (activePage === "messages") {
      timer = setTimeout(() => {
        loadUnreadMessages();
      }, 700);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [user?.id, activePage, loadUnreadMessages]);

  // Kết nối và lắng nghe Socket.IO
  useEffect(() => {
    if (!user?.id) return;

    const token = localStorage.getItem("accessToken");

    if (!token) return;

    const socket = connectSocket(token);

    const handleNewMessage = () => {
      // Đợi backend lưu tin nhắn và cập nhật trạng thái đọc
      setTimeout(() => {
        loadUnreadMessages();
      }, 500);
    };

    const handleMessagesRead = () => {
      loadUnreadMessages();
    };

    socket.on("new_message", handleNewMessage);
    socket.on("messages_read", handleMessagesRead);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("messages_read", handleMessagesRead);
    };
  }, [user?.id, loadUnreadMessages]);

  return (
    <>
      <p className="customer-menu-label">MENU CHÍNH</p>

      <nav className="customer-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              className={`customer-nav-item ${
                activePage === item.id ? "active" : ""
              }`}
              onClick={() => {
                setActivePage(item.id);
                onNavigate?.();
              }}
              style={
                item.id === "messages"
                  ? { position: "relative" }
                  : undefined
              }
            >
              <Icon size={19} />

              <span>{item.label}</span>

              {/* Số tin nhắn chưa đọc */}
              {item.id === "messages" && unreadMessages > 0 && (
                <span
                  style={{
                    marginLeft: "auto",
                    minWidth: "19px",
                    height: "19px",
                    padding: "0 5px",
                    borderRadius: "20px",
                    backgroundColor: "#ef4444",
                    color: "#ffffff",
                    fontSize: "11px",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: 1,
                    flexShrink: 0,
                  }}
                >
                  {unreadMessages > 99 ? "99+" : unreadMessages}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};

export default CustomerSidebarNav;