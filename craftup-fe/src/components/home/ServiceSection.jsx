
const services = [
  {
    icon: "✧",
    title: "Nhận diện thương hiệu",
    desc: "Hỗ trợ logo, màu sắc, bao bì và định hình câu chuyện thương hiệu.",
  },
  {
    icon: "▧",
    title: "Hình ảnh & nội dung",
    desc: "Hỗ trợ chụp ảnh, viết mô tả và xây dựng nội dung truyền thông.",
  },
  {
    icon: "▣",
    title: "Gian hàng trực tuyến",
    desc: "Trưng bày sản phẩm, cập nhật giá bán và thông tin cơ sở.",
  },
  {
    icon: "♡",
    title: "Kết nối khách hàng",
    desc: "Tiếp cận người mua và trao đổi trực tiếp với khách hàng.",
  },
];

function ServiceSection() {
  return (
    <section className="section services-section" id="about">
      <div className="center-heading">
        <span className="eyebrow">ĐỒNG HÀNH CÙNG NGHỆ NHÂN</span>
        <h2>Bạn làm nghề. CraftUp lo phần kết nối.</h2>
        <p>
          Những công cụ cần thiết để người làm thủ công phát triển
          thương hiệu và kinh doanh trên môi trường số.
        </p>
      </div>

      <div className="service-grid">
        {services.map((service) => (
          <div className="service-card" key={service.title}>
            <div className="service-icon">{service.icon}</div>
            <h3>{service.title}</h3>
            <p>{service.desc}</p>
            <a href="#register">Tìm hiểu thêm →</a>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ServiceSection;
