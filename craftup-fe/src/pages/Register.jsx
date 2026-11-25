
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

import "../styles/Auth.css";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "CUSTOMER",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Xử lý đăng ký
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.fullName.trim() ||
      !form.username.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      return;
    }

    if (form.password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setError("");
      setLoading(true);

      // Dữ liệu gửi đến Backend
      const registerData = {
        fullName: form.fullName.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        role: form.role,
      };

      // Gọi API đăng ký
      const response = await api.post(
        "/auth/register",
        registerData
      );

      // Lấy thông tin tài khoản và token
      const { user, token } = response.data.data;

      // Lưu phiên đăng nhập vào AuthContext
      login(user, token);

      // Điều hướng theo vai trò
      if (user.role === "SELLER") {
        navigate("/seller/dashboard", { replace: true });
      } else {
        navigate("/customer/dashboard", { replace: true });
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Đăng ký thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">

        <div className="auth-visual">
          <Link to="/" className="auth-logo">
            Craft<span>Up.</span>
          </Link>

          <div className="auth-visual-content">
            <span className="auth-tag">
              CREATE YOUR JOURNEY
            </span>

            <h1>
              Bắt đầu hành trình
              <br />
              kết nối với
              <br />
              <span>nghề thủ công.</span>
            </h1>

            <p>
              Dù bạn là người yêu thích sản phẩm
              thủ công hay một nghệ nhân, CraftUp
              luôn có một vị trí dành cho bạn.
            </p>
          </div>

          <div className="auth-visual-footer">
            <span>CraftUp © 2026</span>
            <span>Made with passion in Vietnam</span>
          </div>
        </div>

        <div className="auth-form-section">
          <div className="auth-form-wrapper">

            <Link to="/" className="auth-mobile-logo">
              Craft<span>Up.</span>
            </Link>

            <div className="auth-heading">
              <span className="auth-subtitle">
                JOIN OUR COMMUNITY
              </span>

              <h2>Tạo tài khoản</h2>

              <p>
                Tham gia cộng đồng thủ công cùng CraftUp.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="auth-form"
            >
              <div className="form-group">
                <label>Họ và tên *</label>

                <input
                  type="text"
                  name="fullName"
                  placeholder="Nhập họ và tên"
                  value={form.fullName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Username *</label>

                <input
                  type="text"
                  name="username"
                  placeholder="Ví dụ: nguyenminh123"
                  value={form.username}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Email *</label>

                <input
                  type="email"
                  name="email"
                  placeholder="example@email.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Số điện thoại</label>

                <input
                  type="tel"
                  name="phone"
                  placeholder="Nhập số điện thoại (không bắt buộc)"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Mật khẩu *</label>

                <input
                  type="password"
                  name="password"
                  placeholder="Ít nhất 8 ký tự"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Xác nhận mật khẩu *</label>

                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Nhập lại mật khẩu"
                  value={form.confirmPassword}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>
                  Bạn muốn tham gia CraftUp với vai trò?
                </label>

                <div className="role-options">

                  <label
                    className={`role-option ${
                      form.role === "CUSTOMER" ? "selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="CUSTOMER"
                      checked={form.role === "CUSTOMER"}
                      onChange={handleChange}
                    />

                    <div>
                      <strong>Người mua</strong>
                      <span>
                        Khám phá và mua sản phẩm
                      </span>
                    </div>
                  </label>

                  <label
                    className={`role-option ${
                      form.role === "SELLER" ? "selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="SELLER"
                      checked={form.role === "SELLER"}
                      onChange={handleChange}
                    />

                    <div>
                      <strong>Người bán</strong>
                      <span>
                        Giới thiệu và kinh doanh sản phẩm
                      </span>
                    </div>
                  </label>

                </div>
              </div>

              {error && (
                <p className="auth-error">{error}</p>
              )}

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading
                  ? "Đang tạo tài khoản..."
                  : "Tạo tài khoản"}
              </button>
            </form>

            <div className="auth-switch">
              Đã có tài khoản?
              <Link to="/login"> Đăng nhập</Link>
            </div>

            <div className="auth-back">
              <Link to="/">
                ← Quay lại trang chủ
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
