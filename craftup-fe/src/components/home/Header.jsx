import { Link } from "react-router-dom";


function Header({ cartCount }) {
  return (
    <header className="header">
      <a href="#home" className="logo">
        <span className="logo-icon">C</span>
        <span>Craft<span>Up</span></span>
      </a>

      <nav className="navigation">
        <a href="#home" className="active">Trang chủ</a>
        <a href="#products">Sản phẩm</a>
        <a href="#categories">Danh mục</a>
        <a href="#stories">Câu chuyện nghề</a>
        <a href="#about">Về CraftUp</a>
      </nav>

      <div className="header-actions">
        <button className="cart-button">
          ♧ <span>Giỏ hàng ({cartCount})</span>
        </button>
        <Link to="/login" className="login-btn">
            Đăng nhập
        </Link>
        <a href="#register" className="register-button">
          Bắt đầu bán hàng
        </a>
      </div>
    </header>
  );
}

export default Header;
