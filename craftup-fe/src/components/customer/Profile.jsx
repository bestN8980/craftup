
import { useEffect, useRef, useState } from "react";

import {
  UserRound,
  Camera,
  Mail,
  Phone,
  CalendarDays,
  MapPin,
  BriefcaseBusiness,
  Save,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

import "../../styles/Profile.css";

const initialProfile = {
  fullName: "",
  email: "",
  phone: "",
  birthday: "",
  gender: "",
  address: "",
  occupation: "",
  bio: "",
};

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [profile, setProfile] = useState(initialProfile);

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [avatarError, setAvatarError] = useState("");

  const fileInputRef = useRef(null);

  // Đồng bộ thông tin từ AuthContext vào form
  useEffect(() => {
    if (!user) return;

    setProfile({
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
      birthday: user.birthday || "",
      gender: user.gender || "",
      address: user.address || "",
      occupation: user.occupation || "",
      bio: user.bio || "",
    });
  }, [user]);

  // Xử lý thay đổi các trường thông tin
  const handleChange = (field, value) => {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));

    setSaved(false);
    setError("");
  };

  // Lưu thông tin cá nhân
  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const response = await api.patch("/auth/me", profile);

      const updatedUser = response.data.data;

      updateUser(updatedUser);

      setSaved(true);
    } catch (error) {
      console.error("Update profile error:", error);

      setError(
        error.response?.data?.message ||
          "Không thể cập nhật thông tin cá nhân."
      );
    } finally {
      setSaving(false);
    }
  };

  // Upload ảnh đại diện
  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setAvatarError("");

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setAvatarError("Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.");

      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Ảnh đại diện không được vượt quá 5MB.");

      event.target.value = "";
      return;
    }

    const formData = new FormData();

    formData.append("avatar", file);

    setUploading(true);

    try {
      const response = await api.post("/auth/avatar", formData);

      const avatarUrl = response.data.data.avatarUrl;

      updateUser({
        avatarUrl,
      });
    } catch (error) {
      console.error("Upload avatar error:", error);

      setAvatarError(
        error.response?.data?.message ||
          "Không thể tải ảnh đại diện lên."
      );
    } finally {
      setUploading(false);

      // Cho phép chọn lại cùng một ảnh
      event.target.value = "";
    }
  };

  // Tạo chữ viết tắt từ họ tên
  const getInitials = (fullName) => {
    if (!fullName) return "U";

    const words = fullName.trim().split(/\s+/);

    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }

    return (
      words[0].charAt(0) +
      words[words.length - 1].charAt(0)
    ).toUpperCase();
  };

  return (
    <div className="profile-page">
      <div className="profile-heading">
        <div>
          <span className="profile-eyebrow">
            TÀI KHOẢN CỦA BẠN
          </span>

          <h1>Hồ sơ cá nhân</h1>

          <p>
            Quản lý thông tin cá nhân để có trải nghiệm mua sắm tốt hơn
            trên CraftUp.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="profile-layout">
          <div className="profile-main-column">
            <section className="profile-panel">
              <div className="profile-panel-heading">
                <div>
                  <h2>Thông tin cá nhân</h2>
                  <p>Cập nhật những thông tin cơ bản của bạn.</p>
                </div>

                <UserRound size={21} />
              </div>

              <div className="profile-fields-grid">
                <div className="profile-field">
                  <label htmlFor="profile-name">
                    Họ và tên
                  </label>

                  <input
                    id="profile-name"
                    type="text"
                    value={profile.fullName}
                    onChange={(e) =>
                      handleChange("fullName", e.target.value)
                    }
                    placeholder="Nhập họ và tên"
                    required
                  />
                </div>

                <div className="profile-field">
                  <label htmlFor="profile-email">
                    Email
                  </label>

                  <div className="profile-input-icon">
                    <Mail size={17} />

                    <input
                      id="profile-email"
                      type="email"
                      value={profile.email}
                      onChange={(e) =>
                        handleChange("email", e.target.value)
                      }
                      placeholder="example@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="profile-field">
                  <label htmlFor="profile-phone">
                    Số điện thoại
                  </label>

                  <div className="profile-input-icon">
                    <Phone size={17} />

                    <input
                      id="profile-phone"
                      type="tel"
                      value={profile.phone}
                      onChange={(e) =>
                        handleChange("phone", e.target.value)
                      }
                      placeholder="Nhập số điện thoại"
                      pattern="[0-9]{10,11}"
                      title="Số điện thoại gồm 10 hoặc 11 chữ số"
                      required
                    />
                  </div>
                </div>

                <div className="profile-field">
                  <label htmlFor="profile-birthday">
                    Ngày sinh
                  </label>

                  <div className="profile-input-icon">
                    <CalendarDays size={17} />

                    <input
                      id="profile-birthday"
                      type="date"
                      value={profile.birthday}
                      onChange={(e) =>
                        handleChange("birthday", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="profile-field">
                  <label htmlFor="profile-gender">
                    Giới tính
                  </label>

                  <select
                    id="profile-gender"
                    value={profile.gender}
                    onChange={(e) =>
                      handleChange("gender", e.target.value)
                    }
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                    <option value="Không muốn tiết lộ">
                      Không muốn tiết lộ
                    </option>
                  </select>
                </div>

                <div className="profile-field">
                  <label htmlFor="profile-occupation">
                    Nghề nghiệp
                  </label>

                  <div className="profile-input-icon">
                    <BriefcaseBusiness size={17} />

                    <input
                      id="profile-occupation"
                      type="text"
                      value={profile.occupation}
                      onChange={(e) =>
                        handleChange("occupation", e.target.value)
                      }
                      placeholder="Nghề nghiệp của bạn"
                    />
                  </div>
                </div>

                <div className="profile-field profile-field-full">
                  <label htmlFor="profile-address">
                    Địa chỉ
                  </label>

                  <div className="profile-input-icon">
                    <MapPin size={17} />

                    <input
                      id="profile-address"
                      type="text"
                      value={profile.address}
                      onChange={(e) =>
                        handleChange("address", e.target.value)
                      }
                      placeholder="Nhập địa chỉ của bạn"
                    />
                  </div>
                </div>

                <div className="profile-field profile-field-full">
                  <label htmlFor="profile-bio">
                    Giới thiệu về bản thân
                  </label>

                  <textarea
                    id="profile-bio"
                    rows={4}
                    maxLength={300}
                    value={profile.bio}
                    onChange={(e) =>
                      handleChange("bio", e.target.value)
                    }
                    placeholder="Chia sẻ một chút về sở thích của bạn..."
                  />

                  <span className="profile-character-count">
                    {profile.bio.length}/300 ký tự
                  </span>
                </div>
              </div>
            </section>

            <div className="profile-save-area">
              {saved && (
                <span className="profile-saved-message">
                  <CheckCircle2 size={17} />
                  Thông tin đã được cập nhật!
                </span>
              )}

              {error && (
                <span className="profile-error-message">
                  {error}
                </span>
              )}

              <button
                type="submit"
                className="profile-save-btn"
                disabled={saving}
              >
                {saving ? (
                  <LoaderCircle size={17} className="profile-spinner" />
                ) : (
                  <Save size={17} />
                )}

                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>

          <aside className="profile-side-column">
            <section className="profile-panel profile-avatar-panel">
              <h2>Ảnh đại diện</h2>

              <p>
                Ảnh giúp mọi người nhận ra bạn trên CraftUp.
              </p>

              <div className="profile-avatar">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Ảnh đại diện"
                  />
                ) : (
                  <span>{getInitials(user?.fullName)}</span>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={handleAvatarChange}
              />

              <button
                type="button"
                className="profile-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <LoaderCircle
                    size={17}
                    className="profile-spinner"
                  />
                ) : (
                  <Camera size={17} />
                )}

                {uploading ? "Đang tải lên..." : "Tải ảnh lên"}
              </button>

              {avatarError && (
                <span className="profile-error-message">
                  {avatarError}
                </span>
              )}

              <span className="profile-avatar-hint">
                JPG, PNG hoặc WEBP. Tối đa 5MB.
              </span>
            </section>

            <section className="profile-tip-panel">
              <div className="profile-tip-icon">
                <UserRound size={20} />
              </div>

              <h3>Hoàn thiện hồ sơ</h3>

              <p>
                Cập nhật thông tin chính xác để thuận tiện khi đặt hàng
                và nhận thông báo từ CraftUp.
              </p>
            </section>
          </aside>
        </div>
      </form>
    </div>
  );
};

export default Profile;
