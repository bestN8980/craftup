
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-brand">
          <a href="#home" className="logo">
            <span className="logo-icon">C</span>
            <span>Craft<span>Up</span></span>
          </a>

          <p>
            Kết nối tinh hoa thủ công Việt với thị trường số.
            Tôn vinh người thợ và những giá trị truyền thống.
          </p>
        </div>

        <div className="footer-column">
          <h4>Khám phá</h4>
          <a href="#products">Sản phẩm</a>
          <a href="#categories">Danh mục nghề</a>
          <a href="#stories">Câu chuyện nghề</a>
        </div>

        <div className="footer-column">
          <h4>Dành cho nghệ nhân</h4>
          <a href="#register">Đăng ký gian hàng</a>
          <a href="#about">Dịch vụ hỗ trợ</a>
          <a href="#about">Hướng dẫn sử dụng</a>
        </div>

        <div className="footer-column">
          <h4>Hỗ trợ</h4>
          <a href="#about">Liên hệ</a>
          <a href="#about">Câu hỏi thường gặp</a>
          <a href="#about">Chính sách bảo mật</a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 CraftUp. Kết nối để gìn giữ nghề.</span>
        <span>Made with care in Vietnam ♡</span>
      </div>
    </footer>
  );
}

export default Footer;
