
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

import "../styles/Auth.css";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    try {
      setError("");
      setLoading(true);

      const response = await api.post("/auth/login", form);

      const { user, token } = response.data.data;

      // Cập nhật trạng thái đăng nhập toàn ứng dụng
      login(user, token);

      // Điều hướng theo vai trò
      switch (user.role) {
        case "CUSTOMER":
          navigate("/customer/dashboard", { replace: true });
          break;

        case "SELLER":
          navigate("/seller/dashboard", { replace: true });
          break;

        case "ADMIN":
          navigate("/admin/dashboard", { replace: true });
          break;

        default:
          navigate("/", { replace: true });
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Đăng nhập thất bại. Vui lòng thử lại."
      );
      console.log("LOGIN ERROR:", error.response?.data);
  console.log("STATUS:", error.response?.status);
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
            <span className="auth-tag">THE BEAUTY OF HANDMADE</span>

            <h1>
              Nơi những giá trị
              <br />
              thủ công được
              <br />
              <span>tỏa sáng.</span>
            </h1>

            <p>
              Kết nối nghệ nhân, lan tỏa tinh hoa
              thủ công Việt Nam và khám phá những
              sản phẩm mang dấu ấn riêng.
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
              <span className="auth-subtitle">WELCOME BACK</span>
              <h2>Chào mừng trở lại!</h2>
              <p>Đăng nhập để tiếp tục hành trình cùng CraftUp.</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="example@email.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <div className="form-label-row">
                  <label>Mật khẩu</label>
                  <a href="#forgot" className="forgot-link">
                    Quên mật khẩu?
                  </a>
                </div>

                <input
                  type="password"
                  name="password"
                  placeholder="Nhập mật khẩu"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>

              {error && <p className="auth-error">{error}</p>}

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>

            <div className="auth-switch">
              Chưa có tài khoản?
              <Link to="/register"> Đăng ký ngay</Link>
            </div>

            <div className="auth-back">
              <Link to="/">← Quay lại trang chủ</Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
