import { useEffect, useRef, useState } from "react";
import {
  Store,
  MapPin,
  Save,
  Eye,
  LoaderCircle,
  ImagePlus,
  Upload,
} from "lucide-react";

import api from "../../services/api.js";
import "../../styles/SellerStore.css";

const initialStore = {
  storeName: "",
  description: "",
  address: "",
  logoUrl: "",
  bannerUrl: "",
};

export default function SellerStore() {
  const [store, setStore] = useState(initialStore);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  const [logoPreview, setLogoPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const logoInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  // Tạo URL xem trước logo
  useEffect(() => {
    if (!logoFile) {
      setLogoPreview("");
      return;
    }

    const url = URL.createObjectURL(logoFile);
    setLogoPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  // Tạo URL xem trước banner
  useEffect(() => {
    if (!bannerFile) {
      setBannerPreview("");
      return;
    }

    const url = URL.createObjectURL(bannerFile);
    setBannerPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [bannerFile]);

  // Lấy thông tin cửa hàng
  useEffect(() => {
    const fetchStore = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/stores/my-store");
        const data = response.data.data;

        setStore({
          storeName: data.storeName || "",
          description: data.description || "",
          address: data.address || "",
          logoUrl: data.logoUrl || "",
          bannerUrl: data.bannerUrl || "",
        });

        setIsCreating(false);
      } catch (err) {
        if (err.response?.status === 404) {
          setStore(initialStore);
          setIsCreating(true);
        } else {
          setError(
            err.response?.data?.message ||
              "Không thể tải thông tin cửa hàng."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setStore((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSaved(false);
    setError("");
  };

  // Kiểm tra và chọn ảnh
  const handleImageChange = (e, type) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Dung lượng ảnh không được vượt quá 5MB.");
      e.target.value = "";
      return;
    }

    setError("");
    setSaved(false);

    if (type === "logo") {
      setLogoFile(file);
    } else {
      setBannerFile(file);
    }
  };

  // Upload logo hoặc banner
  const handleUploadImage = async (type) => {
    const file = type === "logo" ? logoFile : bannerFile;

    if (!file) {
      setError("Vui lòng chọn ảnh trước khi upload.");
      return;
    }

    if (isCreating) {
      setError("Vui lòng tạo cửa hàng trước khi upload ảnh.");
      return;
    }

    const setUploading =
      type === "logo" ? setUploadingLogo : setUploadingBanner;

    try {
      setUploading(true);
      setError("");

      const formData = new FormData();
      formData.append(type, file);

      const response = await api.post(
        "/stores/my-store/images",
        formData
      );

      const data = response.data.data;

      setStore((prev) => ({
        ...prev,
        logoUrl: data.logoUrl || prev.logoUrl,
        bannerUrl: data.bannerUrl || prev.bannerUrl,
      }));

      if (type === "logo") {
        setLogoFile(null);
        if (logoInputRef.current) {
          logoInputRef.current.value = "";
        }
      } else {
        setBannerFile(null);
        if (bannerInputRef.current) {
          bannerInputRef.current.value = "";
        }
      }

      setSaved(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể upload ảnh cửa hàng."
      );
    } finally {
      setUploading(false);
    }
  };

  // Tạo mới hoặc cập nhật cửa hàng
  const handleSave = async (e) => {
    e.preventDefault();

    if (!store.storeName.trim()) {
      setError("Vui lòng nhập tên cửa hàng.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        storeName: store.storeName.trim(),
        description: store.description,
        address: store.address,
      };

      let response;

      if (isCreating) {
        response = await api.post("/stores", payload);
        setIsCreating(false);
      } else {
        response = await api.put("/stores/my-store", payload);
      }

      const savedStore = response.data.data;

      setStore((prev) => ({
        ...prev,
        storeName: savedStore.storeName || "",
        description: savedStore.description || "",
        address: savedStore.address || "",
      }));

      setSaved(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể lưu thông tin cửa hàng."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="store-loading">
        <LoaderCircle className="store-loading-icon" size={30} />
        <p>Đang tải thông tin cửa hàng...</p>
      </div>
    );
  }

  const currentLogo = logoPreview || store.logoUrl;
  const currentBanner = bannerPreview || store.bannerUrl;

  return (
    <div className="store-page">
      <div className="store-page-header">
        <div>
          <h1>Gian hàng của tôi</h1>
          <p>
            {isCreating
              ? "Hãy tạo cửa hàng để bắt đầu kinh doanh trên CraftUp."
              : "Quản lý thông tin cửa hàng của bạn."}
          </p>
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

      {isCreating && (
        <div className="store-create-notice">
          <Store size={20} />
          <div>
            <strong>Bạn chưa có cửa hàng!</strong>
            <p>
              Điền thông tin bên dưới để tạo gian hàng của riêng mình.
            </p>
          </div>
        </div>
      )}

      {error && <div className="store-error">{error}</div>}

      <form onSubmit={handleSave}>
        <div className="store-layout">
          <div className="store-form-column">

            {/* HÌNH ẢNH CỬA HÀNG */}
            <section className="store-card">
              <div className="store-section-heading">
                <div className="store-section-icon">
                  <ImagePlus size={20} />
                </div>

                <div>
                  <h2>Hình ảnh cửa hàng</h2>
                  <p>Thêm logo và ảnh bìa để tạo dấu ấn thương hiệu.</p>
                </div>
              </div>

              {/* LOGO */}
              <div className="store-image-field">
                <label>Logo cửa hàng</label>

                <div className="store-logo-upload">
                  <div className="store-logo-preview">
                    {currentLogo ? (
                      <img src={currentLogo} alt="Logo cửa hàng" />
                    ) : (
                      <Store size={35} />
                    )}
                  </div>

                  <div className="store-image-actions">
                    <button
                      type="button"
                      className="store-image-select-btn"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={uploadingLogo}
                    >
                      <ImagePlus size={16} />
                      Chọn logo
                    </button>

                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      hidden
                      onChange={(e) => handleImageChange(e, "logo")}
                    />

                    <span>
                      JPG, PNG hoặc WEBP. Tối đa 5MB.
                    </span>

                    {logoFile && (
                      <button
                        type="button"
                        className="store-image-upload-btn"
                        onClick={() => handleUploadImage("logo")}
                        disabled={uploadingLogo}
                      >
                        {uploadingLogo ? (
                          <LoaderCircle
                            size={16}
                            className="store-loading-icon"
                          />
                        ) : (
                          <Upload size={16} />
                        )}

                        {uploadingLogo ? "Đang tải..." : "Upload logo"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* BANNER */}
              <div className="store-image-field">
                <label>Ảnh bìa cửa hàng</label>

                <div className="store-banner-upload">
                  {currentBanner ? (
                    <img src={currentBanner} alt="Ảnh bìa cửa hàng" />
                  ) : (
                    <div className="store-banner-placeholder">
                      <ImagePlus size={30} />
                      <span>Chưa có ảnh bìa</span>
                    </div>
                  )}
                </div>

                <div className="store-image-actions store-banner-actions">
                  <button
                    type="button"
                    className="store-image-select-btn"
                    onClick={() => bannerInputRef.current?.click()}
                    disabled={uploadingBanner}
                  >
                    <ImagePlus size={16} />
                    Chọn ảnh bìa
                  </button>

                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    hidden
                    onChange={(e) => handleImageChange(e, "banner")}
                  />

                  <span>
                    Khuyến nghị ảnh ngang. Tối đa 5MB.
                  </span>

                  {bannerFile && (
                    <button
                      type="button"
                      className="store-image-upload-btn"
                      onClick={() => handleUploadImage("banner")}
                      disabled={uploadingBanner}
                    >
                      {uploadingBanner ? (
                        <LoaderCircle
                          size={16}
                          className="store-loading-icon"
                        />
                      ) : (
                        <Upload size={16} />
                      )}

                      {uploadingBanner
                        ? "Đang tải..."
                        : "Upload ảnh bìa"}
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* THÔNG TIN CỬA HÀNG */}
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
                  name="storeName"
                  value={store.storeName}
                  onChange={handleChange}
                  placeholder="Nhập tên cửa hàng"
                  maxLength={150}
                  required
                />
              </div>

              <div className="store-field">
                <label>Mô tả cửa hàng</label>
                <textarea
                  name="description"
                  value={store.description}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Giới thiệu về sản phẩm, câu chuyện và giá trị thương hiệu..."
                />

                <span className="store-field-hint">
                  Hãy kể câu chuyện về cửa hàng và sản phẩm của bạn.
                </span>
              </div>
            </section>

            {/* THÔNG TIN LIÊN HỆ */}
            <section className="store-card">
              <div className="store-section-heading">
                <div className="store-section-icon">
                  <MapPin size={20} />
                </div>

                <div>
                  <h2>Thông tin liên hệ</h2>
                  <p>Địa chỉ cửa hàng của bạn.</p>
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
                    placeholder="Nhập địa chỉ cửa hàng"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* XEM TRƯỚC */}
          <aside
            className="store-preview-column"
            id="store-preview"
          >
            <div className="store-preview-card">
              <div className="store-preview-heading">
                <h2>
                  <Eye size={18} />
                  Xem trước gian hàng
                </h2>

                <span>Preview</span>
              </div>

              <div
                className="store-preview-banner"
                style={
                  currentBanner
                    ? {
                        backgroundImage: `url("${currentBanner}")`,
                      }
                    : {}
                }
              />

              <div className="store-preview-content">
                <div className="store-preview-avatar">
                  {currentLogo ? (
                    <img src={currentLogo} alt="Logo cửa hàng" />
                  ) : (
                    <Store size={29} />
                  )}
                </div>

                <h3>
                  {store.storeName || "Tên cửa hàng"}
                </h3>

                <div className="store-preview-divider" />

                <p className="store-preview-description">
                  {store.description ||
                    "Mô tả cửa hàng sẽ xuất hiện ở đây."}
                </p>

                <div className="store-preview-contact">
                  <div>
                    <MapPin size={15} />
                    <span>
                      {store.address || "Chưa cập nhật địa chỉ"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="store-preview-tip">
              <strong>Mẹo xây dựng thương hiệu</strong>
              <p>
                Hãy giới thiệu rõ câu chuyện và giá trị riêng
                của cửa hàng để tạo sự khác biệt.
              </p>
            </div>
          </aside>
        </div>

        <div className="store-save-area">
          {saved && (
            <span className="store-save-success">
              Thao tác thành công!
            </span>
          )}

          <button
            type="submit"
            className="store-save-btn"
            disabled={saving}
          >
            {saving ? (
              <LoaderCircle
                size={17}
                className="store-loading-icon"
              />
            ) : (
              <Save size={17} />
            )}

            {saving
              ? "Đang lưu..."
              : isCreating
                ? "Tạo cửa hàng"
                : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
}