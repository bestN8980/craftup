
import { useState } from "react";
import {
  Store,
  Camera,
  ImagePlus,
  MapPin,
  Phone,
  Mail,
  Save,
  Eye,
} from "lucide-react";

import "../../styles/SellerStore.css";

const initialStore = {
  name: "Mộc Nhiên Handmade",
  slogan: "Lưu giữ nét đẹp thủ công Việt",
  description:
    "Mộc Nhiên mang đến những sản phẩm thủ công được tạo nên từ sự tỉ mỉ, sáng tạo và tình yêu dành cho những giá trị truyền thống.",
  address: "Hà Nội, Việt Nam",
  phone: "0987654321",
  email: "contact@mocnhien.vn",
  facebook: "",
  instagram: "",
};

export default function SellerStore() {
  const [store, setStore] = useState(initialStore);
  const [avatar, setAvatar] = useState(null);
  const [banner, setBanner] = useState(null);
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setStore((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSaved(false);
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn một tệp hình ảnh.");
      e.target.value = "";
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    if (type === "avatar") {
      setAvatar(imageUrl);
    } else {
      setBanner(imageUrl);
    }

    setSaved(false);
  };

  const handleSave = (e) => {
    e.preventDefault();

    // Hiện tại chỉ mô phỏng thao tác lưu.
    // Sau này sẽ thay bằng API Backend.
    setSaved(true);
  };

  return (
    <div className="store-page">
      <div className="store-page-header">
        <div>
          <h1>Gian hàng của tôi</h1>
          <p>Quản lý thông tin và hình ảnh thương hiệu của bạn.</p>
        </div>

        <button
          className="store-preview-btn"
          type="button"
          onClick={() =>
            document
              .getElementById("store-preview")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          <Eye size={17} />
          Xem trước
        </button>
      </div>

      <form onSubmit={handleSave}>
        <div className="store-layout">
          <div className="store-form-column">
            {/* Thông tin cơ bản */}
            <section className="store-card">
              <div className="store-section-heading">
                <div className="store-section-icon">
                  <Store size={20} />
                </div>
                <div>
                  <h2>Thông tin cửa hàng</h2>
                  <p>Giới thiệu cửa hàng của bạn với khách hàng.</p>
                </div>
              </div>

              <div className="store-field">
                <label>Tên cửa hàng *</label>
                <input
                  name="name"
                  value={store.name}
                  onChange={handleChange}
                  placeholder="Nhập tên cửa hàng"
                  required
                />
              </div>

              <div className="store-field">
                <label>Slogan</label>
                <input
                  name="slogan"
                  value={store.slogan}
                  onChange={handleChange}
                  placeholder="Một câu giới thiệu ngắn về cửa hàng"
                />
              </div>

              <div className="store-field">
                <label>Mô tả cửa hàng</label>
                <textarea
                  name="description"
                  value={store.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Giới thiệu về sản phẩm, câu chuyện và giá trị thương hiệu..."
                />
                <span className="store-field-hint">
                  Hãy kể câu chuyện về cửa hàng và sản phẩm thủ công của bạn.
                </span>
              </div>
            </section>

            {/* Hình ảnh */}
            <section className="store-card">
              <div className="store-section-heading">
                <div className="store-section-icon">
                  <ImagePlus size={20} />
                </div>
                <div>
                  <h2>Hình ảnh cửa hàng</h2>
                  <p>Tạo ấn tượng với khách hàng bằng hình ảnh thương hiệu.</p>
                </div>
              </div>

              <div className="store-image-field">
                <label>Ảnh bìa cửa hàng</label>

                <label className="store-banner-upload">
                  {banner ? (
                    <img src={banner} alt="Ảnh bìa cửa hàng" />
                  ) : (
                    <div className="store-upload-placeholder">
                      <ImagePlus size={27} />
                      <strong>Tải ảnh bìa lên</strong>
                      <span>Khuyến nghị ảnh ngang, tỷ lệ 3:1</span>
                    </div>
                  )}

                  <span className="store-image-edit">
                    <Camera size={16} />
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, "banner")}
                    hidden
                  />
                </label>
              </div>

              <div className="store-image-field">
                <label>Logo / Ảnh đại diện</label>

                <label className="store-avatar-upload">
                  {avatar ? (
                    <img src={avatar} alt="Logo cửa hàng" />
                  ) : (
                    <div className="store-avatar-placeholder">
                      <Store size={30} />
                    </div>
                  )}

                  <span className="store-avatar-edit">
                    <Camera size={15} />
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, "avatar")}
                    hidden
                  />
                </label>

                <span className="store-field-hint">
                  Nên sử dụng logo hoặc hình ảnh đại diện rõ nét.
                </span>
              </div>
            </section>

            {/* Liên hệ */}
            <section className="store-card">
              <div className="store-section-heading">
                <div className="store-section-icon">
                  <Phone size={20} />
                </div>
                <div>
                  <h2>Thông tin liên hệ</h2>
                  <p>Giúp khách hàng dễ dàng kết nối với bạn.</p>
                </div>
              </div>

              <div className="store-field">
                <label>Địa chỉ</label>
                <div className="store-input-icon">
                  <MapPin size={17} />
                  <input
                    name="address"
                    value={store.address}
                    onChange={handleChange}
                    placeholder="Địa chỉ cửa hàng"
                  />
                </div>
              </div>

              <div className="store-two-columns">
                <div className="store-field">
                  <label>Số điện thoại</label>
                  <div className="store-input-icon">
                    <Phone size={17} />
                    <input
                      name="phone"
                      value={store.phone}
                      onChange={handleChange}
                      placeholder="Số điện thoại"
                    />
                  </div>
                </div>

                <div className="store-field">
                  <label>Email</label>
                  <div className="store-input-icon">
                    <Mail size={17} />
                    <input
                      name="email"
                      type="email"
                      value={store.email}
                      onChange={handleChange}
                      placeholder="Email cửa hàng"
                    />
                  </div>
                </div>
              </div>

              <div className="store-field">
                <label>Facebook</label>
                <div className="store-input-icon">
                  <span className="store-social-letter">f</span>
                  <input
                    name="facebook"
                    value={store.facebook}
                    onChange={handleChange}
                    placeholder="Liên kết Facebook"
                  />
                </div>
              </div>

              <div className="store-field">
                <label>Instagram</label>
                <div className="store-input-icon">
                  <span className="store-instagram-letter">◎</span>
                  <input
                    name="instagram"
                    value={store.instagram}
                    onChange={handleChange}
                    placeholder="Liên kết Instagram"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Preview */}
          <aside className="store-preview-column" id="store-preview">
            <div className="store-preview-card">
              <div className="store-preview-heading">
                <h2>
                  <Eye size={18} />
                  Xem trước gian hàng
                </h2>
                <span>Preview</span>
              </div>

              <div className="store-preview-banner">
                {banner && <img src={banner} alt="Ảnh bìa xem trước" />}
              </div>

              <div className="store-preview-content">
                <div className="store-preview-avatar">
                  {avatar ? (
                    <img src={avatar} alt="Logo xem trước" />
                  ) : (
                    <Store size={29} />
                  )}
                </div>

                <h3>{store.name || "Tên cửa hàng"}</h3>
                <p className="store-preview-slogan">
                  {store.slogan || "Slogan cửa hàng"}
                </p>

                <div className="store-preview-divider" />

                <p className="store-preview-description">
                  {store.description || "Mô tả cửa hàng sẽ xuất hiện ở đây."}
                </p>

                <div className="store-preview-contact">
                  <div>
                    <MapPin size={15} />
                    <span>{store.address || "Chưa cập nhật địa chỉ"}</span>
                  </div>
                  <div>
                    <Phone size={15} />
                    <span>{store.phone || "Chưa cập nhật số điện thoại"}</span>
                  </div>
                  <div>
                    <Mail size={15} />
                    <span>{store.email || "Chưa cập nhật email"}</span>
                  </div>
                </div>

                <div className="store-preview-socials">
  {store.facebook && (
    <span className="store-social-letter">f</span>
  )}

  {store.instagram && (
    <span className="store-instagram-letter">◎</span>
  )}
</div>
              </div>
            </div>

            <div className="store-preview-tip">
              <strong>Mẹo xây dựng thương hiệu</strong>
              <p>
                Hãy sử dụng hình ảnh nhất quán và kể câu chuyện riêng
                của sản phẩm để tạo sự khác biệt cho gian hàng.
              </p>
            </div>
          </aside>
        </div>

        <div className="store-save-area">
          {saved && (
            <span className="store-save-success">
              Thông tin đã được lưu trong phiên làm việc này.
            </span>
          )}

          <button type="submit" className="store-save-btn">
            <Save size={17} />
            Lưu thay đổi
          </button>
        </div>
      </form>
    </div>
  );
}
