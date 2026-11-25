
import { useEffect, useRef, useState } from "react";
import { X, ImagePlus, Trash2, Star } from "lucide-react";

import api from "../../services/api";

function ProductFormModal({ product, onClose, onSave }) {
  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    price: "",
    stock: "",
    description: "",
  });

  const [categories, setCategories] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [imageActionLoading, setImageActionLoading] = useState("");
  const [error, setError] = useState("");

  const previewUrlsRef = useRef([]);

  // Lấy danh sách danh mục
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);

        const response = await api.get("/categories");
        setCategories(response.data.data || []);
      } catch (err) {
        console.error("Get categories error:", err);
        setError(
          err.response?.data?.message ||
            "Không thể tải danh sách danh mục"
        );
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Đưa dữ liệu sản phẩm vào form khi chỉnh sửa
  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "",
        categoryId: String(product.categoryId || ""),
        price: product.price ?? "",
        stock: product.stock ?? "",
        description: product.description || "",
      });

      setExistingImages(product.images || []);
    } else {
      setForm({
        name: "",
        categoryId: "",
        price: "",
        stock: "",
        description: "",
      });

      setExistingImages([]);
    }

    setSelectedImages([]);
    setError("");
  }, [product]);

  // Giải phóng URL ảnh xem trước
  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Chọn nhiều ảnh
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";

    if (!files.length) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const validFiles = [];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        alert(`Ảnh "${file.name}" không đúng định dạng JPG, PNG hoặc WEBP.`);
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert(`Ảnh "${file.name}" vượt quá dung lượng 5MB.`);
        continue;
      }

      validFiles.push(file);
    }

    const remainingSlots =
      5 - existingImages.length - selectedImages.length;

    if (remainingSlots <= 0) {
      alert("Mỗi sản phẩm chỉ được có tối đa 5 ảnh.");
      return;
    }

    if (validFiles.length > remainingSlots) {
      alert(`Bạn chỉ có thể thêm tối đa ${remainingSlots} ảnh nữa.`);
    }

    const filesToAdd = validFiles.slice(0, remainingSlots);

    const newImages = filesToAdd.map((file) => {
      const preview = URL.createObjectURL(file);
      previewUrlsRef.current.push(preview);

      return {
        file,
        preview,
      };
    });

    setSelectedImages((prev) => [...prev, ...newImages]);
  };

  // Xóa ảnh mới chọn, chưa tải lên
  const handleRemoveSelectedImage = (index) => {
    const image = selectedImages[index];

    URL.revokeObjectURL(image.preview);

    previewUrlsRef.current = previewUrlsRef.current.filter(
      (url) => url !== image.preview
    );

    setSelectedImages((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // Xóa ảnh đã có trên hệ thống
  const handleDeleteImage = async (image) => {
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa ảnh này không?"
    );

    if (!confirmed) return;

    try {
      setImageActionLoading(`delete-${image.id}`);
      setError("");

      await api.delete(
        `/products/${product.id}/images/${image.id}`
      );

      setExistingImages((prev) => {
        const remaining = prev.filter(
          (item) => item.id !== image.id
        );

        // Backend tự chọn ảnh thay thế nếu ảnh chính bị xóa.
        // Cập nhật lại giao diện theo thứ tự ảnh còn lại.
        if (
          image.isPrimary &&
          remaining.length > 0
        ) {
          return remaining.map((item, index) => ({
            ...item,
            isPrimary: index === 0,
          }));
        }

        return remaining;
      });
    } catch (err) {
      console.error("Delete product image error:", err);

      setError(
        err.response?.data?.message ||
          "Không thể xóa ảnh sản phẩm."
      );
    } finally {
      setImageActionLoading("");
    }
  };

  // Chọn ảnh đại diện
  const handleSetPrimaryImage = async (image) => {
    if (image.isPrimary) return;

    try {
      setImageActionLoading(`primary-${image.id}`);
      setError("");

      await api.patch(
        `/products/${product.id}/images/${image.id}/primary`
      );

      setExistingImages((prev) =>
        prev.map((item) => ({
          ...item,
          isPrimary: item.id === image.id,
        }))
      );
    } catch (err) {
      console.error("Set primary image error:", err);

      setError(
        err.response?.data?.message ||
          "Không thể chọn ảnh đại diện."
      );
    } finally {
      setImageActionLoading("");
    }
  };

  // Gửi form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.name.trim() ||
      !form.categoryId ||
      !form.price ||
      form.stock === ""
    ) {
      setError("Vui lòng điền đầy đủ các thông tin bắt buộc.");
      return;
    }

    if (
      !Number.isFinite(Number(form.price)) ||
      !Number.isFinite(Number(form.stock)) ||
      Number(form.price) <= 0 ||
      Number(form.stock) < 0
    ) {
      setError("Giá phải lớn hơn 0 và tồn kho không được âm.");
      return;
    }

    if (
      existingImages.length + selectedImages.length > 5
    ) {
      setError("Mỗi sản phẩm chỉ được có tối đa 5 ảnh.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        name: form.name.trim(),
        categoryId: Number(form.categoryId),
        price: Number(form.price),
        stock: Number(form.stock),
        description: form.description.trim(),
      };

      let productId;

      if (product) {
        await api.put(`/products/${product.id}`, payload);
        productId = product.id;
      } else {
        const response = await api.post("/products", payload);
        productId = response.data.data?.id;
      }

      if (!productId) {
        throw new Error("Không lấy được ID sản phẩm.");
      }

      // Upload tất cả ảnh mới được chọn
      if (selectedImages.length > 0) {
        const formData = new FormData();

        selectedImages.forEach(({ file }) => {
          formData.append("images", file);
        });

        await api.post(
          `/products/${productId}/images`,
          formData
        );
      }

      await onSave();
    } catch (err) {
      console.error("Save product error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Không thể lưu sản phẩm. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const totalImages =
    existingImages.length + selectedImages.length;

  return (
    <div
      className="product-modal-overlay"
      onMouseDown={onClose}
    >
      <div
        className="product-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="product-modal-header">
          <div>
            <h2>
              {product
                ? "Chỉnh sửa sản phẩm"
                : "Thêm sản phẩm mới"}
            </h2>

            <p>
              {product
                ? "Cập nhật thông tin sản phẩm của bạn."
                : "Điền thông tin để thêm sản phẩm vào gian hàng."}
            </p>
          </div>

          <button
            type="button"
            className="product-modal-close"
            onClick={onClose}
            disabled={loading || !!imageActionLoading}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="product-form-body">
            <div className="product-form-main">
              <div className="product-form-group">
                <label>
                  Tên sản phẩm <span>*</span>
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ví dụ: Bình gốm thủ công"
                  required
                />
              </div>

              <div className="product-form-group">
                <label>
                  Danh mục <span>*</span>
                </label>

                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  required
                  disabled={loadingCategories}
                >
                  <option value="">
                    {loadingCategories
                      ? "Đang tải danh mục..."
                      : "Chọn danh mục"}
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="product-form-row">
                <div className="product-form-group">
                  <label>
                    Giá bán (VNĐ) <span>*</span>
                  </label>

                  <input
                    type="number"
                    name="price"
                    min="1"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="Ví dụ: 250000"
                    required
                  />
                </div>

                <div className="product-form-group">
                  <label>
                    Số lượng tồn kho <span>*</span>
                  </label>

                  <input
                    type="number"
                    name="stock"
                    min="0"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="Ví dụ: 20"
                    required
                  />
                </div>
              </div>

              <div className="product-form-group">
                <label>Mô tả sản phẩm</label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Mô tả chất liệu, kích thước, quy trình chế tác..."
                />
              </div>
            </div>

            <div className="product-form-image">
              <div className="product-images-heading">
                <label>Ảnh sản phẩm</label>
                <span>{totalImages}/5 ảnh</span>
              </div>

              <div className="product-images-grid">
                {existingImages.map((image) => (
                  <div
                    className="product-image-item"
                    key={image.id}
                  >
                    <img
                      src={image.imageUrl}
                      alt={image.altText || "Ảnh sản phẩm"}
                    />

                    {image.isPrimary && (
                      <span className="product-primary-label">
                        <Star size={11} fill="currentColor" />
                        Ảnh chính
                      </span>
                    )}

                    <div className="product-image-actions">
                      {!image.isPrimary && (
                        <button
                          type="button"
                          title="Đặt làm ảnh đại diện"
                          disabled={!!imageActionLoading}
                          onClick={() =>
                            handleSetPrimaryImage(image)
                          }
                        >
                          <Star size={15} />
                        </button>
                      )}

                      <button
                        type="button"
                        className="delete"
                        title="Xóa ảnh"
                        disabled={!!imageActionLoading}
                        onClick={() =>
                          handleDeleteImage(image)
                        }
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}

                {selectedImages.map((image, index) => (
                  <div
                    className="product-image-item pending"
                    key={image.preview}
                  >
                    <img
                      src={image.preview}
                      alt="Ảnh chờ tải lên"
                    />

                    <span className="product-pending-label">
                      Chưa tải lên
                    </span>

                    <div className="product-image-actions">
                      <button
                        type="button"
                        className="delete"
                        title="Bỏ ảnh"
                        onClick={() =>
                          handleRemoveSelectedImage(index)
                        }
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}

                {totalImages < 5 && (
                  <label className="product-image-add">
                    <ImagePlus size={25} />
                    <span>Thêm ảnh</span>

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      multiple
                      onChange={handleImageChange}
                      hidden
                    />
                  </label>
                )}
              </div>

              <p className="product-image-hint">
                Có thể tải tối đa 5 ảnh, mỗi ảnh không quá 5MB.
                Chọn biểu tượng ngôi sao để đặt ảnh đại diện.
              </p>
            </div>
          </div>

          {error && (
            <p className="product-form-error">
              {error}
            </p>
          )}

          <div className="product-modal-footer">
            <button
              type="button"
              className="product-btn-cancel"
              onClick={onClose}
              disabled={loading || !!imageActionLoading}
            >
              Hủy
            </button>

            <button
              type="submit"
              className="product-btn-save"
              disabled={
                loading ||
                loadingCategories ||
                !!imageActionLoading
              }
            >
              {loading
                ? "Đang lưu..."
                : product
                  ? "Lưu thay đổi"
                  : "Thêm sản phẩm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductFormModal;
