
import { useEffect, useState } from "react";
import api from "../../services/api";
import {
  UserRound,
  ShieldCheck,
  Wallet,
  Bell,
  Camera,
  Save,
  LockKeyhole,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

import "../../styles/SellerSettings.css";

const initialSettings = {
  fullName: "Nguyễn Minh Anh",
  email: "minhanh@gmail.com",
  phone: "0987654321",
  address: "Hà Nội, Việt Nam",

  currentPassword: "",
  newPassword: "",
  confirmPassword: "",

  bankName: "",
  accountNumber: "",
  accountHolder: "",

  orderNotification: true,
  messageNotification: true,
  promotionNotification: false,
  systemNotification: true,
};

function SellerSettings() {
  const [activeTab, setActiveTab] = useState("account");
  const [settings, setSettings] = useState(initialSettings);
  const [avatar, setAvatar] = useState(null);
  const [message, setMessage] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);

      const response = await api.get("/auth/me");

      const user =
        response.data?.data?.user ||
        response.data?.data ||
        response.data?.user ||
        response.data;

      setSettings((prev) => ({
        ...prev,
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      }));

      setAvatar(user.avatarUrl || null);
    } catch (error) {
      console.error("Lỗi lấy thông tin tài khoản:", error);
      setMessage("Không thể tải thông tin tài khoản.");
    } finally {
      setLoadingProfile(false);
    }
  };

  fetchProfile();
}, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setMessage("");
  };

  const handleAvatarChange = (e) => {
  const file = e.target.files?.[0];

  if (!file) return;

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    setMessage("Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    setMessage("Ảnh không được vượt quá 5MB.");
    return;
  }

  setAvatarFile(file);

  const previewUrl = URL.createObjectURL(file);
  setAvatar(previewUrl);
  setMessage("");
};

  const handleUploadAvatar = async () => {
  if (!avatarFile) {
    setMessage("Bạn chưa chọn ảnh mới.");
    return;
  }

  try {
    setSaving(true);
    setMessage("");

    const formData = new FormData();
    formData.append("avatar", avatarFile);

    const response = await api.post("/auth/avatar", formData);

    const avatarUrl =
      response.data?.data?.avatarUrl ||
      response.data?.avatarUrl;

    if (avatarUrl) {
      setAvatar(avatarUrl);
    }

    setAvatarFile(null);
    setMessage("Cập nhật ảnh đại diện thành công!");
  } catch (error) {
    console.error("Lỗi upload avatar:", error);

    setMessage(
      error.response?.data?.message ||
        "Không thể tải ảnh đại diện lên."
    );
  } finally {
    setSaving(false);
  }
};

  const handleSave = async (e) => {
  e.preventDefault();

  if (activeTab === "account") {
    try {
      setSaving(true);
      setMessage("");

      await api.patch("/auth/me", {
        fullName: settings.fullName,
        email: settings.email,
        phone: settings.phone,
        address: settings.address,
      });

      setMessage("Đã cập nhật thông tin tài khoản thành công!");
    } catch (error) {
      console.error("Lỗi cập nhật hồ sơ:", error);

      setMessage(
        error.response?.data?.message ||
          "Không thể cập nhật thông tin tài khoản."
      );
    } finally {
      setSaving(false);
    }

    return;
  }

  // Tạm giữ nguyên xử lý mật khẩu ở bước hiện tại.
  if (activeTab === "security") {
    if (
      !settings.currentPassword ||
      !settings.newPassword ||
      !settings.confirmPassword
    ) {
      setMessage("Vui lòng nhập đầy đủ thông tin mật khẩu.");
      return;
    }

    if (settings.newPassword.length < 8) {
      setMessage("Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }

    if (settings.newPassword !== settings.confirmPassword) {
      setMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    setMessage(
      "Kiểm tra hợp lệ. Chức năng đổi mật khẩu sẽ được kết nối sau."
    );

    return;
  }

  setMessage("Chức năng này sẽ được kết nối sau.");
};

  const tabs = [
    {
      id: "account",
      label: "Thông tin tài khoản",
      icon: UserRound,
    },
    {
      id: "security",
      label: "Bảo mật",
      icon: ShieldCheck,
    },
    {
      id: "payment",
      label: "Thanh toán",
      icon: Wallet,
    },
    {
      id: "notifications",
      label: "Thông báo",
      icon: Bell,
    },
  ];

  return (
    <div className="seller-settings">
      <div className="settings-header">
        <div>
          <span className="settings-eyebrow">TÀI KHOẢN NGƯỜI BÁN</span>
          <h1>Cài đặt</h1>
          <p>Quản lý thông tin và tùy chỉnh tài khoản của bạn.</p>
        </div>
      </div>

      <div className="settings-layout">
        <aside className="settings-sidebar">
          <h3>Cài đặt tài khoản</h3>

          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                className={`settings-tab ${
                  activeTab === tab.id ? "active" : ""
                }`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMessage("");
                }}
              >
                <Icon size={19} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </aside>

        <form className="settings-panel" onSubmit={handleSave}>
          {activeTab === "account" && (
            <>
              <div className="settings-section-heading">
                {loadingProfile && (
                <p>Đang tải thông tin tài khoản...</p>
)}
                <div>
                  <h2>Thông tin tài khoản</h2>
                  <p>Cập nhật thông tin cá nhân của bạn.</p>
                </div>
              </div>

              <div className="settings-avatar-section">
                <div className="settings-avatar">
                  {avatar ? (
                    <img src={avatar} alt="Ảnh đại diện" />
                  ) : (
                    <UserRound size={35} />
                  )}
                </div>

                <div>
                  <strong>Ảnh đại diện</strong>
                  <p>Chọn ảnh JPG hoặc PNG.</p>

                  <label className="settings-upload-btn">
                  <Camera size={16} />
                  Tải ảnh lên
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarChange}
                    hidden
                  />
                </label>

                {avatarFile && (
                  <button
                    type="button"
                    className="settings-save-btn"
                    onClick={handleUploadAvatar}
                    disabled={saving}
                  >
                    <Save size={16} />
                    {saving ? "Đang tải lên..." : "Lưu ảnh đại diện"}
                  </button>
                )}
                </div>
              </div>

              <div className="settings-divider" />

              <div className="settings-form-grid">
                <div className="settings-field">
                  <label>Họ và tên</label>
                  <div className="settings-input-wrap">
                    <UserRound size={18} />
                    <input
                      name="fullName"
                      value={settings.fullName}
                      onChange={handleChange}
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                </div>

                <div className="settings-field">
                  <label>Email</label>
                  <div className="settings-input-wrap">
                    <Mail size={18} />
                    <input
                      type="email"
                      name="email"
                      value={settings.email}
                      onChange={handleChange}
                      placeholder="Nhập email"
                    />
                  </div>
                </div>

                <div className="settings-field">
                  <label>Số điện thoại</label>
                  <div className="settings-input-wrap">
                    <Phone size={18} />
                    <input
                      name="phone"
                      value={settings.phone}
                      onChange={handleChange}
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                </div>

                <div className="settings-field">
                  <label>Địa chỉ</label>
                  <div className="settings-input-wrap">
                    <MapPin size={18} />
                    <input
                      name="address"
                      value={settings.address}
                      onChange={handleChange}
                      placeholder="Nhập địa chỉ"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "security" && (
            <>
              <div className="settings-section-heading">
                <div>
                  <h2>Bảo mật tài khoản</h2>
                  <p>Thay đổi mật khẩu để bảo vệ tài khoản.</p>
                </div>
              </div>

              <div className="settings-security-note">
                <ShieldCheck size={22} />
                <div>
                  <strong>Bảo vệ tài khoản của bạn</strong>
                  <p>
                    Hãy sử dụng mật khẩu có ít nhất 8 ký tự và khó đoán.
                  </p>
                </div>
              </div>

              <div className="settings-password-fields">
                <div className="settings-field">
                  <label>Mật khẩu hiện tại</label>
                  <div className="settings-input-wrap">
                    <LockKeyhole size={18} />
                    <input
                      type="password"
                      name="currentPassword"
                      value={settings.currentPassword}
                      onChange={handleChange}
                      placeholder="Nhập mật khẩu hiện tại"
                    />
                  </div>
                </div>

                <div className="settings-field">
                  <label>Mật khẩu mới</label>
                  <div className="settings-input-wrap">
                    <LockKeyhole size={18} />
                    <input
                      type="password"
                      name="newPassword"
                      value={settings.newPassword}
                      onChange={handleChange}
                      placeholder="Nhập mật khẩu mới"
                    />
                  </div>
                </div>

                <div className="settings-field">
                  <label>Xác nhận mật khẩu mới</label>
                  <div className="settings-input-wrap">
                    <LockKeyhole size={18} />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={settings.confirmPassword}
                      onChange={handleChange}
                      placeholder="Nhập lại mật khẩu mới"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "payment" && (
            <>
              <div className="settings-section-heading">
                <div>
                  <h2>Thông tin thanh toán</h2>
                  <p>Thiết lập tài khoản ngân hàng nhận tiền.</p>
                </div>
              </div>

              <div className="settings-payment-note">
                <Wallet size={23} />
                <div>
                  <strong>Tài khoản nhận thanh toán</strong>
                  <p>
                    Thông tin này sẽ được sử dụng khi CraftUp hỗ trợ thanh
                    toán và đối soát cho người bán.
                  </p>
                </div>
              </div>

              <div className="settings-password-fields">
                <div className="settings-field">
                  <label>Ngân hàng</label>
                  <select
                    name="bankName"
                    value={settings.bankName}
                    onChange={handleChange}
                  >
                    <option value="">Chọn ngân hàng</option>
                    <option value="Vietcombank">Vietcombank</option>
                    <option value="BIDV">BIDV</option>
                    <option value="Techcombank">Techcombank</option>
                    <option value="MB Bank">MB Bank</option>
                    <option value="Agribank">Agribank</option>
                    <option value="ACB">ACB</option>
                    <option value="VPBank">VPBank</option>
                  </select>
                </div>

                <div className="settings-field">
                  <label>Số tài khoản</label>
                  <input
                    name="accountNumber"
                    value={settings.accountNumber}
                    onChange={handleChange}
                    placeholder="Nhập số tài khoản"
                  />
                </div>

                <div className="settings-field">
                  <label>Chủ tài khoản</label>
                  <input
                    name="accountHolder"
                    value={settings.accountHolder}
                    onChange={handleChange}
                    placeholder="Tên chủ tài khoản"
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === "notifications" && (
            <>
              <div className="settings-section-heading">
                <div>
                  <h2>Cài đặt thông báo</h2>
                  <p>Chọn những thông báo bạn muốn nhận.</p>
                </div>
              </div>

              <div className="settings-notification-list">
                <div className="settings-notification-item">
                  <div>
                    <strong>Thông báo đơn hàng</strong>
                    <p>Nhận thông báo khi có đơn hàng mới.</p>
                  </div>
                  <input
                    type="checkbox"
                    name="orderNotification"
                    checked={settings.orderNotification}
                    onChange={handleChange}
                  />
                </div>

                <div className="settings-notification-item">
                  <div>
                    <strong>Thông báo tin nhắn</strong>
                    <p>Nhận thông báo khi khách hàng gửi tin nhắn.</p>
                  </div>
                  <input
                    type="checkbox"
                    name="messageNotification"
                    checked={settings.messageNotification}
                    onChange={handleChange}
                  />
                </div>

                <div className="settings-notification-item">
                  <div>
                    <strong>Ưu đãi và khuyến mãi</strong>
                    <p>Nhận thông tin về chương trình ưu đãi từ CraftUp.</p>
                  </div>
                  <input
                    type="checkbox"
                    name="promotionNotification"
                    checked={settings.promotionNotification}
                    onChange={handleChange}
                  />
                </div>

                <div className="settings-notification-item">
                  <div>
                    <strong>Thông báo hệ thống</strong>
                    <p>Nhận thông tin cập nhật và bảo trì hệ thống.</p>
                  </div>
                  <input
                    type="checkbox"
                    name="systemNotification"
                    checked={settings.systemNotification}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </>
          )}

          {message && (
            <div
              className={`settings-message ${
                message.includes("thành công") ? "success" : "error"
              }`}
            >
              {message}
            </div>
          )}

          <div className="settings-footer">
            <button type="submit" className="settings-save-btn">
              <Save size={17} />
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SellerSettings;
