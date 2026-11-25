import { useCallback, useEffect, useState } from "react";
import { Send, MessageCircle, Store, RefreshCw } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import "../../styles/CustomerMessages.css";
import { connectSocket } from "../../socket/socket";

const CustomerMessages = () => {
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // Kết nối Socket.IO và nhận tin nhắn mới
useEffect(() => {
  const token = localStorage.getItem("accessToken");

  if (!token) return;

  const socket = connectSocket(token);

  const handleNewMessage = async ({ conversationId, message }) => {
    if (!message) return;

    // Cập nhật tin nhắn cuối cùng trong danh sách hội thoại
    setConversations((previous) => {
      const updated = previous.map((item) => {
        if (String(item.id) !== String(conversationId)) {
          return item;
        }

        return {
          ...item,
          lastMessage: message,
          lastMessageAt: message.createdAt,
          unreadCount:
            String(selectedId) === String(conversationId)
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

    // Nếu đang mở đúng hội thoại thì hiển thị tin nhắn ngay
    if (String(selectedId) === String(conversationId)) {
      setMessages((previous) => {
        if (previous.some((item) => String(item.id) === String(message.id))) {
          return previous;
        }

        return [...previous, message];
      });

      // Đánh dấu tin nhắn vừa nhận là đã đọc
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
    if (String(readerId) === String(user?.id)) return;

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
}, [selectedId, user?.id]);

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/conversations");
      const data = response.data?.data;
      const list = Array.isArray(data) ? data : data?.conversations || [];

      setConversations(list);

      if (list.length > 0) {
  const pendingId = sessionStorage.getItem("pendingConversationId");

  const target = list.find(
    (item) => String(item.id) === String(pendingId)
  );

  if (target) {
    setSelectedId(target.id);
    sessionStorage.removeItem("pendingConversationId");
  } else {
    setSelectedId((current) => {
      if (current && list.some((item) => String(item.id) === String(current))) {
        return current;
      }

      return list[0].id;
    });
  }
} else {
        setSelectedId(null);
        setMessages([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải danh sách tin nhắn.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!selectedId) return;

    let active = true;

    const loadMessages = async () => {
      try {
        const response = await api.get(`/messages/${selectedId}?page=1&limit=100`);
        const data = response.data?.data;
        const list = Array.isArray(data) ? data : data?.messages || [];

        if (active) setMessages(list);

        await api.patch(`/messages/${selectedId}/read`);

        if (active) {
          setConversations((previous) =>
            previous.map((item) =>
              String(item.id) === String(selectedId)
                ? { ...item, unreadCount: 0 }
                : item
            )
          );
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || "Không thể tải nội dung trò chuyện.");
        }
      }
    };

    loadMessages();

    return () => {
      active = false;
    };
  }, [selectedId]);

  const handleSend = async (event) => {
    event.preventDefault();

    const text = content.trim();
    if (!text || !selectedId || sending) return;

    try {
      setSending(true);

      const response = await api.post(`/messages/${selectedId}`, {
        content: text,
        messageType: "TEXT",
        });

      const data = response.data?.data;
      const newMessage = data?.message || data;

      if (newMessage) {
        setMessages((previous) => {
            if (previous.some((item) => String(item.id) === String(newMessage.id))) {
            return previous;
            }

            return [...previous, newMessage];
        });
        }

      setContent("");
      loadConversations();
    } catch (err) {
      setError(err.response?.data?.message || "Gửi tin nhắn thất bại.");
    } finally {
      setSending(false);
    }
  };

  const getStoreName = (conversation) =>
    conversation.store?.storeName || "Cửa hàng";

  const isMine = (message) =>
    message.isMine === true ||
    (user?.id != null &&
      String(message.senderId) === String(user.id));

  const selectedConversation = conversations.find(
    (item) => String(item.id) === String(selectedId)
  );

  return (
    <div className="customer-messages">
      <div className="customer-messages-heading">
        <div>
          <h2>Tin nhắn</h2>
          <p>Trao đổi trực tiếp với các cửa hàng trên CraftUp.</p>
        </div>

        <button
          className="customer-message-refresh"
          onClick={loadConversations}
          title="Làm mới"
        >
          <RefreshCw size={17} />
        </button>
      </div>

      {error && <div className="customer-message-error">{error}</div>}

      <div className="customer-message-layout">
        <aside className="customer-conversation-list">
          <h3>Cuộc trò chuyện</h3>

          {loading ? (
            <p className="customer-message-empty">Đang tải...</p>
          ) : conversations.length === 0 ? (
            <div className="customer-message-empty">
              <MessageCircle size={30} />
              <p>Bạn chưa có cuộc trò chuyện nào.</p>
              <span>Hãy vào trang sản phẩm và nhắn tin cho người bán.</span>
            </div>
          ) : (
            conversations.map((conversation) => (
              <button
                key={conversation.id}
                className={`customer-conversation-item ${
                  String(selectedId) === String(conversation.id) ? "active" : ""
                }`}
                onClick={() => setSelectedId(conversation.id)}
              >
                <div className="customer-conversation-avatar">
                  <Store size={21} />
                </div>

                <div className="customer-conversation-info">
                  <strong>{getStoreName(conversation)}</strong>
                  <span>
                    {conversation.lastMessage?.content || "Bắt đầu trò chuyện"}
                  </span>
                </div>

                {Number(conversation.unreadCount) > 0 && (
                  <span className="customer-message-unread">
                    {conversation.unreadCount}
                  </span>
                )}
              </button>
            ))
          )}
        </aside>

        <section className="customer-chat-panel">
          {selectedConversation ? (
            <>
              <div className="customer-chat-header">
                <div className="customer-conversation-avatar">
                  <Store size={21} />
                </div>
                <div>
                  <strong>{getStoreName(selectedConversation)}</strong>
                  <span>Cửa hàng trên CraftUp</span>
                </div>
              </div>

              <div className="customer-chat-messages">
                {messages.length === 0 ? (
                  <div className="customer-message-empty">
                    Chưa có tin nhắn. Hãy gửi lời chào!
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`customer-chat-bubble ${
                        isMine(message) ? "mine" : "theirs"
                      }`}
                    >
                      <p>{message.content}</p>
                      <small>
                        {message.createdAt
                          ? new Date(message.createdAt).toLocaleString("vi-VN")
                          : ""}
                      </small>
                    </div>
                  ))
                )}
              </div>

              <form className="customer-chat-form" onSubmit={handleSend}>
                <input
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Nhập tin nhắn..."
                />
                <button type="submit" disabled={sending || !content.trim()}>
                  <Send size={18} />
                  Gửi
                </button>
              </form>
            </>
          ) : (
            <div className="customer-message-empty customer-chat-placeholder">
              <MessageCircle size={42} />
              <h3>Chọn một cuộc trò chuyện</h3>
              <p>Chọn cửa hàng bên trái để xem và gửi tin nhắn.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default CustomerMessages;