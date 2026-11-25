
import { useState } from "react";
import {
  ShieldCheck,
  Bell,
  LockKeyhole,
  Eye,
  EyeOff,
  LogOut,
  Mail,
  Package,
  Tag,
  Newspaper,
  UserRound,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import "../../styles/Settings.css";

function SettingsSection({ icon, title, description, children }) {
  return (
    <section className="settings-section">
      <div className="settings-section-heading">
        <div className="settings-section-icon">{icon}</div>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>

      <div className="settings-section-content">{children}</div>
    </section>
  );
}

function NotificationItem({
  icon,
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <div className="settings-notification-item">
      <div className="settings-notification-icon">{icon}</div>

      <div className="settings-notification-info">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      <label className="settings-switch">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className="settings-switch-slider" />
      </label>
    </div>
  );
}

export default function Settings() {
  const [passwords, setPasswords] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    newPassword: false,
    confirm: false,
  });

  const [notifications, setNotifications] = useState({
    order: true,
    promotion: true,
    newsletter: false,
    email: true,
  });

  const [privacy, setPrivacy] = useState({
    showProfile: true,
    personalized: true,
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const updatePassword = (field, value) => {
    setPasswords((current) => ({
      ...current,
      [field]: value,
    }));
    setMessage("");
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((current) => ({
      ...current,
      [field]: !current[field],
    }));
  };

  const handlePasswordSubmit = (event) => {
    event.preventDefault();

    if (passwords.newPassword.length < 8) {
      setMessageType("error");
      setMessage("Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }

    if (passwords.newPassword !== passwords.confirm) {
      setMessageType("error");
      setMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (passwords.current === passwords.newPassword) {
      setMessageType("error");
      setMessage("Mật khẩu mới phải khác mật khẩu hiện tại.");
      return;
    }

    setMessageType("success");
    setMessage("Thông tin mật khẩu đã được kiểm tra thành công.");

    setPasswords({
      current: "",
      newPassword: "",
      confirm: "",
    });
  };

  const updateNotification = (field, value) => {
    setNotifications((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updatePrivacy = (field, value) => {
    setPrivacy((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    alert("Chức năng đăng xuất sẽ được kết nối khi tích hợp Backend.");
  };

  return (
    <div className="settings-page">
      <div className="settings-heading">
        <div>
          <span className="settings-eyebrow">TÙY CHỈNH TÀI KHOẢN</span>
          <h1>Cài đặt tài khoản</h1>
          <p>
            Quản lý bảo mật, thông báo và quyền riêng tư của bạn trên CraftUp.
          </p>
        </div>
      </div>

      <div className="settings-content">
        {/* Bảo mật */}
        <SettingsSection
          icon={<ShieldCheck size={21} />}
          title="Bảo mật tài khoản"
          description="Thay đổi mật khẩu để bảo vệ tài khoản của bạn."
        >
          <form
            className="settings-password-form"
            onSubmit={handlePasswordSubmit}
          >
            <div className="settings-password-field">
              <label htmlFor="current-password">Mật khẩu hiện tại</label>

              <div className="settings-password-input">
                <LockKeyhole size={17} />
                <input
                  id="current-password"
                  type={showPasswords.current ? "text" : "password"}
                  value={passwords.current}
                  onChange={(e) =>
                    updatePassword("current", e.target.value)
                  }
                  placeholder="Nhập mật khẩu hiện tại"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  aria-label="Hiện hoặc ẩn mật khẩu hiện tại"
                >
                  {showPasswords.current ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>

            <div className="settings-password-field">
              <label htmlFor="new-password">Mật khẩu mới</label>

              <div className="settings-password-input">
                <LockKeyhole size={17} />
                <input
                  id="new-password"
                  type={showPasswords.newPassword ? "text" : "password"}
                  value={passwords.newPassword}
                  onChange={(e) =>
                    updatePassword("newPassword", e.target.value)
                  }
                  placeholder="Nhập mật khẩu mới"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("newPassword")}
                  aria-label="Hiện hoặc ẩn mật khẩu mới"
                >
                  {showPasswords.newPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>

            <div className="settings-password-field">
              <label htmlFor="confirm-password">
                Xác nhận mật khẩu mới
              </label>

              <div className="settings-password-input">
                <LockKeyhole size={17} />
                <input
                  id="confirm-password"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwords.confirm}
                  onChange={(e) =>
                    updatePassword("confirm", e.target.value)
                  }
                  placeholder="Nhập lại mật khẩu mới"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  aria-label="Hiện hoặc ẩn mật khẩu xác nhận"
                >
                  {showPasswords.confirm ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>

            {message && (
              <div className={`settings-message ${messageType}`}>
                {messageType === "success" ? (
                  <CheckCircle2 size={17} />
                ) : (
                  <AlertCircle size={17} />
                )}
                {message}
              </div>
            )}

            <div className="settings-password-footer">
              <p>Mật khẩu nên có ít nhất 8 ký tự.</p>
              <button type="submit" className="settings-primary-btn">
                Cập nhật mật khẩu
              </button>
            </div>
          </form>
        </SettingsSection>

        {/* Thông báo */}
        <SettingsSection
          icon={<Bell size={21} />}
          title="Cài đặt thông báo"
          description="Chọn những thông tin bạn muốn nhận từ CraftUp."
        >
          <div className="settings-notification-list">
            <NotificationItem
              icon={<Package size={19} />}
              title="Cập nhật đơn hàng"
              description="Thông báo khi đơn hàng được xác nhận, vận chuyển hoặc giao thành công."
              checked={notifications.order}
              onChange={(value) => updateNotification("order", value)}
            />

            <NotificationItem
              icon={<Tag size={19} />}
              title="Ưu đãi và khuyến mãi"
              description="Nhận thông tin về chương trình giảm giá và ưu đãi đặc biệt."
              checked={notifications.promotion}
              onChange={(value) => updateNotification("promotion", value)}
            />

            <NotificationItem
              icon={<Newspaper size={19} />}
              title="Tin tức từ CraftUp"
              description="Cập nhật câu chuyện làng nghề và sản phẩm thủ công mới."
              checked={notifications.newsletter}
              onChange={(value) => updateNotification("newsletter", value)}
            />

            <NotificationItem
              icon={<Mail size={19} />}
              title="Thông báo qua email"
              description="Cho phép gửi các thông báo đã chọn đến email của bạn."
              checked={notifications.email}
              onChange={(value) => updateNotification("email", value)}
            />
          </div>
        </SettingsSection>

        {/* Quyền riêng tư */}
        <SettingsSection
          icon={<UserRound size={21} />}
          title="Quyền riêng tư"
          description="Kiểm soát cách thông tin cá nhân được sử dụng."
        >
          <div className="settings-notification-list">
            <NotificationItem
              icon={<Eye size={19} />}
              title="Hiển thị hồ sơ công khai"
              description="Cho phép người khác xem tên và ảnh đại diện của bạn."
              checked={privacy.showProfile}
              onChange={(value) => updatePrivacy("showProfile", value)}
            />

            <NotificationItem
              icon={<Tag size={19} />}
              title="Cá nhân hóa trải nghiệm"
              description="Sử dụng sở thích mua sắm để gợi ý sản phẩm phù hợp."
              checked={privacy.personalized}
              onChange={(value) => updatePrivacy("personalized", value)}
            />
          </div>
        </SettingsSection>

        {/* Tài khoản */}
        <SettingsSection
          icon={<LogOut size={21} />}
          title="Quản lý tài khoản"
          description="Các thao tác liên quan đến phiên đăng nhập."
        >
          <button
            className="settings-logout-row"
            onClick={() => setShowLogoutConfirm(true)}
          >
            <div className="settings-logout-icon">
              <LogOut size={19} />
            </div>

            <div>
              <h3>Đăng xuất</h3>
              <p>Thoát khỏi tài khoản CraftUp trên thiết bị này.</p>
            </div>

            <ChevronRight size={19} />
          </button>
        </SettingsSection>
      </div>

      {showLogoutConfirm && (
        <div
          className="settings-confirm-overlay"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="settings-confirm-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="settings-confirm-icon">
              <LogOut size={24} />
            </div>

            <h2>Xác nhận đăng xuất</h2>
            <p>Bạn có chắc chắn muốn đăng xuất khỏi CraftUp không?</p>

            <div className="settings-confirm-actions">
              <button
                className="settings-cancel-btn"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Hủy
              </button>

              <button
                className="settings-logout-btn"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
