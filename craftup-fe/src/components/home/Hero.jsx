
function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <span className="eyebrow">
          ✦ NỀN TẢNG PHÁT TRIỂN NGHỀ THỦ CÔNG VIỆT
        </span>

        <h1>
          Từ đôi tay tài hoa
          <br />
          đến thương hiệu
          <br />
          <span>vươn xa.</span>
        </h1>

        <p>
          CraftUp đồng hành cùng nghệ nhân xây dựng hình ảnh,
          kể câu chuyện sản phẩm và kết nối khách hàng trên
          thị trường số.
        </p>

        <div className="hero-buttons">
          <a href="#products" className="primary-button">
            Khám phá sản phẩm <span>→</span>
          </a>
          <a href="#register" className="secondary-button">
            Tôi là nghệ nhân
          </a>
        </div>

        <div className="hero-note">
          <span>✓</span> Tôn vinh bàn tay người thợ Việt
        </div>
      </div>

      <div className="hero-visual">
        <img
          className="hero-image"
          src="https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=1000"
          alt="Không gian thủ công mỹ nghệ"
        />

        <div className="hero-floating-card">
          <span className="floating-icon">✿</span>
          <div>
            <strong>Made by hand</strong>
            <p>Mỗi sản phẩm là một câu chuyện.</p>
          </div>
        </div>

        <div className="hero-stamp">
          CRAFT<br />WITH LOVE
        </div>
      </div>
    </section>
  );
}

export default Hero;
