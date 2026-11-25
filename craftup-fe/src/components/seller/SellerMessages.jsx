import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Info,
  MessageCircle,
  CheckCheck,
} from "lucide-react";

import api from "../../services/api";
import "../../styles/SellerMessages.css";

import { connectSocket } from "../../socket/socket";

// Lấy ID người dùng đang đăng nhập từ localStorage
function getCurrentUserId() {
  try {
    const user =
      JSON.parse(localStorage.getItem("user") || "null") ||
      JSON.parse(localStorage.getItem("currentUser") || "null");

    if (user?.id) return Number(user.id);

    // Fallback: đọc ID từ JWT
    const token = localStorage.getItem("accessToken");

    if (token) {
      const payload = JSON.parse(
        atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
      );

      return Number(payload.id || payload.userId);
    }
  } catch (error) {
    console.error("Không thể lấy thông tin người dùng:", error);
  }

  return null;
}

function getInitials(name = "") {
  const words = name.trim().split(/\s+/);

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return (
    words[words.length - 2][0] +
    words[words.length - 1][0]
  ).toUpperCase();
}

function formatTime(date) {
  if (!date) return "";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return "";

  return value.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SellerMessages() {
  const currentUserId = getCurrentUserId();

  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);

  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // Kết nối Socket.IO và nhận tin nhắn mới
useEffect(() => {
  const token = localStorage.getItem("accessToken");

  if (!token) return;

  const socket = connectSocket(token);

  const handleNewMessage = async ({ conversationId, message }) => {
    if (!message) return;

    const isActiveConversation =
      String(selectedId) === String(conversationId);

    // Cập nhật danh sách hội thoại
    setConversations((previous) => {
      const updated = previous.map((item) => {
        if (String(item.id) !== String(conversationId)) {
          return item;
        }

        return {
          ...item,
          lastMessage: message,
          lastMessageAt: message.createdAt,
          unreadCount: isActiveConversation
            ? 0
            : Number(item.unreadCount || 0) + 1,
        };
      });

      return updated.sort(
        (a, b) =>
          new Date(b.lastMessageAt || b.updatedAt || 0) -
          new Date(a.lastMessageAt || a.updatedAt || 0)
      );
    });

    // Nếu đang mở hội thoại thì thêm tin nhắn ngay
    if (isActiveConversation) {
      setMessages((previous) => {
        if (previous.some((item) => String(item.id) === String(message.id))) {
          return previous;
        }

        return [...previous, message];
      });

      // Đánh dấu tin nhắn đã đọc
      try {
        await api.patch(`/messages/${conversationId}/read`);

        setConversations((previous) =>
          previous.map((item) =>
            String(item.id) === String(conversationId)
              ? { ...item, unreadCount: 0 }
              : item
          )
        );
      } catch (error) {
        console.error("Không thể đánh dấu tin nhắn đã đọc:", error);
      }
    }
  };

  const handleMessagesRead = ({ conversationId, readerId }) => {
    if (String(readerId) === String(currentUserId)) return;

    setMessages((previous) =>
      previous.map((item) =>
        String(item.conversationId) === String(conversationId)
          ? { ...item, isRead: true }
          : item
      )
    );
  };

  socket.on("new_message", handleNewMessage);
  socket.on("messages_read", handleMessagesRead);

  return () => {
    socket.off("new_message", handleNewMessage);
    socket.off("messages_read", handleMessagesRead);
  };
}, [selectedId, currentUserId]);

  // Lấy danh sách hội thoại
  const loadConversations = useCallback(async () => {
    try {
      setLoadingConversations(true);
      setError("");

      const response = await api.get("/conversations");

      const data = response.data.data || [];

      setConversations(data);

      // Tự động chọn hội thoại đầu tiên
      setSelectedId((currentId) => {
        if (currentId && data.some((item) => item.id === currentId)) {
          return currentId;
        }

        return data.length > 0 ? data[0].id : null;
      });
    } catch (err) {
      console.error("Lỗi lấy danh sách hội thoại:", err);

      setError(
        err.response?.data?.message ||
          "Không thể tải danh sách hội thoại."
      );
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Lấy hội thoại đang được chọn
  const selectedConversation = conversations.find(
    (item) => item.id === selectedId
  );

  // Lấy tin nhắn của hội thoại
  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }

    let isMounted = true;

    const loadMessages = async () => {
      try {
        setLoadingMessages(true);

        const response = await api.get(`/messages/${selectedId}?page=1&limit=100`);

        if (!isMounted) return;

        const data = response.data.data;

        setMessages(data.messages || []);

        // Đánh dấu tin nhắn đã đọc
        await api.patch(`/messages/${selectedId}/read`);

        if (!isMounted) return;

        setConversations((prev) =>
          prev.map((item) =>
            item.id === selectedId
              ? { ...item, unreadCount: 0 }
              : item
          )
        );
      } catch (err) {
        if (!isMounted) return;

        console.error("Lỗi tải tin nhắn:", err);

        setError(
          err.response?.data?.message ||
            "Không thể tải tin nhắn."
        );
      } finally {
        if (isMounted) {
          setLoadingMessages(false);
        }
      }
    };

    loadMessages();

    return () => {
      isMounted = false;
    };
  }, [selectedId]);

  // Tìm kiếm hội thoại
  const filteredConversations = useMemo(() => {
    return conversations.filter((item) => {
      const customerName =
        item.customer?.fullName ||
        item.customer?.username ||
        "Khách hàng";

      return customerName
        .toLowerCase()
        .includes(search.toLowerCase());
    });
  }, [conversations, search]);

  // Tổng số tin nhắn chưa đọc
  const totalUnread = conversations.reduce(
    (total, item) => total + Number(item.unreadCount || 0),
    0
  );

  // Chọn hội thoại
  const selectConversation = (id) => {
    setSelectedId(id);
    setError("");
  };

  // Gửi tin nhắn
  const sendMessage = async (e) => {
    e.preventDefault();

    const content = message.trim();

    if (!content || !selectedId || sending) return;

    try {
      setSending(true);

      const response = await api.post(`/messages/${selectedId}`, {
          content,
          messageType: "TEXT",
        });

      const newMessage = response.data.data;

      setMessages((prev) => {
  if (prev.some((item) => String(item.id) === String(newMessage.id))) {
    return prev;
  }

  return [...prev, newMessage];
});

      setMessage("");

      // Cập nhật tin nhắn cuối cùng trong danh sách
      setConversations((prev) =>
        prev.map((item) =>
          item.id === selectedId
            ? {
                ...item,
                lastMessage: newMessage,
                lastMessageAt: newMessage.createdAt,
                unreadCount: 0,
              }
            : item
        )
      );
    } catch (err) {
  console.error("Lỗi gửi tin nhắn:", {
    status: err.response?.status,
    message: err.response?.data?.message,
    url: err.config?.url,
    method: err.config?.method,
    selectedId,
    currentUserId,
  });

  setError(
    err.response?.data?.message ||
      "Gửi tin nhắn thất bại."
  );
} finally {
      setSending(false);
    }
  };

  // Xác định tin nhắn của người bán
  const isSellerMessage = (item) => {
    if (item.isMine !== undefined) return item.isMine;

    return (
      currentUserId !== null &&
      Number(item.senderId) === currentUserId
    );
  };

  return (
    <div className="messages-page">
      <div className="messages-heading">
        <div>
          <h1>Tin nhắn</h1>
          <p>Trao đổi và hỗ trợ khách hàng của bạn</p>
        </div>

        <div className="messages-heading-count">
          <MessageCircle size={18} />
          <span>{totalUnread} tin chưa đọc</span>
        </div>
      </div>

      <div className="messages-container">
        {/* DANH SÁCH HỘI THOẠI */}
        <aside className="conversation-panel">
          <div className="conversation-header">
            <h2>Hội thoại</h2>
            <span>{conversations.length}</span>
          </div>

          <div className="conversation-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Tìm khách hàng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="conversation-list">
            {loadingConversations ? (
              <div className="conversation-empty">
                Đang tải hội thoại...
              </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => {
                const customer = conversation.customer;

                const customerName =
                  customer?.fullName ||
                  customer?.username ||
                  "Khách hàng";

                const lastMessage = conversation.lastMessage;

                return (
                  <button
                    key={conversation.id}
                    className={`conversation-item ${
                      selectedId === conversation.id ? "active" : ""
                    }`}
                    onClick={() =>
                      selectConversation(conversation.id)
                    }
                  >
                    <div className="conversation-avatar">
                      {customer?.avatarUrl ? (
                        <img
                          src={customer.avatarUrl}
                          alt={customerName}
                        />
                      ) : (
                        getInitials(customerName)
                      )}
                    </div>

                    <div className="conversation-info">
                      <div className="conversation-name-row">
                        <strong>{customerName}</strong>

                        <span>
                          {formatTime(
                            lastMessage?.createdAt ||
                              conversation.lastMessageAt
                          )}
                        </span>
                      </div>

                      <p>
                        {lastMessage?.content ||
                          "Chưa có tin nhắn"}
                      </p>

                      <div className="conversation-bottom">
                        <span>Khách hàng</span>

                        {Number(conversation.unreadCount) > 0 && (
                          <span className="unread-count">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="conversation-empty">
                {error || "Không tìm thấy hội thoại"}
              </div>
            )}
          </div>
        </aside>

        {/* KHUNG CHAT */}
        <section className="chat-panel">
          {selectedConversation ? (
            <>
              <div className="chat-header">
                <div className="chat-user">
                  <div className="conversation-avatar">
                    {selectedConversation.customer?.avatarUrl ? (
                      <img
                        src={selectedConversation.customer.avatarUrl}
                        alt="Avatar"
                      />
                    ) : (
                      getInitials(
                        selectedConversation.customer?.fullName ||
                          selectedConversation.customer?.username ||
                          "Khách hàng"
                      )
                    )}
                  </div>

                  <div>
                    <h3>
                      {selectedConversation.customer?.fullName ||
                        selectedConversation.customer?.username ||
                        "Khách hàng"}
                    </h3>

                    <p>Khách hàng</p>
                  </div>
                </div>

                <div className="chat-actions">
                  <button type="button" title="Gọi điện">
                    <Phone size={19} />
                  </button>

                  <button type="button" title="Gọi video">
                    <Video size={19} />
                  </button>

                  <button type="button" title="Thông tin">
                    <Info size={19} />
                  </button>

                  <button type="button" title="Thêm">
                    <MoreVertical size={19} />
                  </button>
                </div>
              </div>

              <div className="chat-product">
                <div className="chat-product-icon">
                  <MessageCircle size={19} />
                </div>

                <div>
                  <span>Đang trò chuyện với</span>
                  <strong>
                    {selectedConversation.customer?.fullName ||
                      "Khách hàng"}
                  </strong>
                </div>
              </div>

              <div className="chat-messages">
                {loadingMessages ? (
                  <div className="conversation-empty">
                    Đang tải tin nhắn...
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((item) => {
                    const isMine = isSellerMessage(item);

                    return (
                      <div
                        key={item.id}
                        className={`message-row ${
                          isMine ? "sent" : "received"
                        }`}
                      >
                        <div className="message-bubble">
                          <p>{item.content}</p>

                          <div className="message-meta">
                            <span>
                              {formatTime(item.createdAt)}
                            </span>

                            {isMine && (
                              <CheckCheck size={14} />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="conversation-empty">
                    Chưa có tin nhắn. Hãy gửi lời chào đến khách hàng!
                  </div>
                )}
              </div>

              {error && (
                <div className="conversation-empty">
                  {error}
                </div>
              )}

              <form
                className="chat-input-area"
                onSubmit={sendMessage}
              >
                <button
                  type="button"
                  className="chat-attach"
                  title="Đính kèm"
                >
                  <Paperclip size={20} />
                </button>

                <input
                  type="text"
                  placeholder="Nhập tin nhắn..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />

                <button
                  type="submit"
                  className="chat-send"
                  disabled={!message.trim() || sending}
                  title="Gửi tin nhắn"
                >
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div className="chat-placeholder">
              <MessageCircle size={48} />

              <h3>Chọn một cuộc hội thoại</h3>

              <p>
                Chọn khách hàng ở bên trái để bắt đầu trao đổi.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}