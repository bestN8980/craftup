
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Package,
  Pencil,
  Trash2,
  Filter,
  Upload,
} from "lucide-react";

import api from "../../services/api";
import ProductFormModal from "./ProductFormModal";
import "../../styles/SellerProducts.css";

const DEFAULT_IMAGE =
  "https://placehold.co/100x100?text=CraftUp";

function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [publishingId, setPublishingId] = useState(null);

  // Lấy danh sách sản phẩm
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/products/seller");

      setProducts(response.data.data || []);
    } catch (err) {
      console.error("Get seller products error:", err);

      setError(
        err.response?.data?.message ||
          "Không thể tải danh sách sản phẩm"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Tìm kiếm và lọc sản phẩm
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const matchesFilter =
        filter === "all" ||
        (filter === "active" &&
          product.status === "PUBLISHED" &&
          Number(product.stock) > 0) ||
        (filter === "out" &&
          product.status === "PUBLISHED" &&
          Number(product.stock) === 0) ||
        (filter === "draft" &&
          product.status === "DRAFT");

      return matchesSearch && matchesFilter;
    });
  }, [products, search, filter]);

  const formatPrice = (price) => {
    return (
      new Intl.NumberFormat("vi-VN").format(
        Number(price) || 0
      ) + " ₫"
    );
  };

  // Lấy ảnh chính
  const getProductImage = (product) => {
    if (!Array.isArray(product.images)) {
      return DEFAULT_IMAGE;
    }

    const primaryImage = product.images.find(
      (image) => image.isPrimary
    );

    return (
      primaryImage?.imageUrl ||
      product.images[0]?.imageUrl ||
      DEFAULT_IMAGE
    );
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  // Sau khi thêm hoặc cập nhật sản phẩm
  const handleSave = async () => {
    setShowModal(false);
    setEditingProduct(null);

    await fetchProducts();
  };

  // Xuất bản sản phẩm
  const handlePublish = async (product) => {
    const confirmed = window.confirm(
      `Bạn có muốn xuất bản sản phẩm "${product.name}" không?`
    );

    if (!confirmed) return;

    try {
      setPublishingId(product.id);

      await api.patch(
        `/products/${product.id}/publish`
      );

      alert("Xuất bản sản phẩm thành công!");

      await fetchProducts();
    } catch (err) {
      console.error("Publish product error:", err);

      alert(
        err.response?.data?.message ||
          "Không thể xuất bản sản phẩm"
      );
    } finally {
      setPublishingId(null);
    }
  };

  // Lưu trữ sản phẩm
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn lưu trữ sản phẩm này?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/products/${id}`);

      await fetchProducts();

      alert("Đã lưu trữ sản phẩm thành công");
    } catch (err) {
      console.error("Delete product error:", err);

      alert(
        err.response?.data?.message ||
          "Không thể lưu trữ sản phẩm"
      );
    }
  };

  // Hiển thị trạng thái
  const getStatus = (product) => {
    if (product.status === "DRAFT") {
      return {
        label: "Bản nháp",
        className: "draft",
      };
    }

    if (
      product.status === "PUBLISHED" &&
      Number(product.stock) === 0
    ) {
      return {
        label: "Hết hàng",
        className: "out",
      };
    }

    if (product.status === "PUBLISHED") {
      return {
        label: "Đang bán",
        className: "active",
      };
    }

    return {
      label: product.status,
      className: "draft",
    };
  };

  return (
    <div className="seller-products">
      <div className="products-heading">
        <div>
          <h2>Danh sách sản phẩm</h2>
          <p>
            Quản lý các sản phẩm đang có trong gian hàng của bạn.
          </p>
        </div>

        <button
          className="products-add-btn"
          onClick={openAddModal}
        >
          <Plus size={18} />
          Thêm sản phẩm
        </button>
      </div>

      <div className="products-summary">
        <div>
          <span>Tổng sản phẩm</span>
          <strong>{products.length}</strong>
        </div>

        <div>
          <span>Đang bán</span>
          <strong>
            {
              products.filter(
                (p) =>
                  p.status === "PUBLISHED" &&
                  Number(p.stock) > 0
              ).length
            }
          </strong>
        </div>

        <div>
          <span>Hết hàng</span>
          <strong>
            {
              products.filter(
                (p) =>
                  p.status === "PUBLISHED" &&
                  Number(p.stock) === 0
              ).length
            }
          </strong>
        </div>

        <div>
          <span>Bản nháp</span>
          <strong>
            {
              products.filter(
                (p) => p.status === "DRAFT"
              ).length
            }
          </strong>
        </div>
      </div>

      <div className="products-toolbar">
        <div className="products-search">
          <Search size={18} />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
          />
        </div>

        <div className="products-filter">
          <Filter size={17} />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Tất cả sản phẩm</option>
            <option value="active">Đang bán</option>
            <option value="out">Hết hàng</option>
            <option value="draft">Bản nháp</option>
          </select>
        </div>
      </div>

      <div className="products-table-wrapper">
        {loading ? (
          <div className="products-empty">
            <p>Đang tải danh sách sản phẩm...</p>
          </div>
        ) : error ? (
          <div className="products-empty">
            <h3>Có lỗi xảy ra</h3>
            <p>{error}</p>

            <button onClick={fetchProducts}>
              Thử lại
            </button>
          </div>
        ) : (
          <>
            <table className="products-table">
              <thead>
                <tr>
                  <th>SẢN PHẨM</th>
                  <th>DANH MỤC</th>
                  <th>GIÁ BÁN</th>
                  <th>TỒN KHO</th>
                  <th>TRẠNG THÁI</th>
                  <th>THAO TÁC</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => {
                  const status = getStatus(product);

                  return (
                    <tr key={product.id}>
                      <td>
                        <div className="product-table-info">
                          <img
                            src={getProductImage(product)}
                            alt={product.name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = DEFAULT_IMAGE;
                            }}
                          />

                          <div>
                            <strong>{product.name}</strong>
                            <span>#{product.id}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        {product.category?.name ||
                          "Chưa phân loại"}
                      </td>

                      <td className="product-price">
                        {formatPrice(product.price)}
                      </td>

                      <td>{product.stock}</td>

                      <td>
                        <span
                          className={`product-status ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>

                      <td>
                        <div className="product-actions">
                          {product.status === "DRAFT" && (
                            <button
                              title="Xuất bản sản phẩm"
                              disabled={
                                publishingId === product.id
                              }
                              onClick={() =>
                                handlePublish(product)
                              }
                            >
                              <Upload size={17} />
                            </button>
                          )}

                          <button
                            title="Chỉnh sửa"
                            onClick={() =>
                              openEditModal(product)
                            }
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            title="Lưu trữ"
                            className="delete"
                            onClick={() =>
                              handleDelete(product.id)
                            }
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredProducts.length === 0 && (
              <div className="products-empty">
                <div className="products-empty-icon">
                  <Package size={34} />
                </div>

                <h3>
                  {products.length === 0
                    ? "Bạn chưa có sản phẩm nào"
                    : "Không tìm thấy sản phẩm"}
                </h3>

                <p>
                  {products.length === 0
                    ? "Hãy thêm sản phẩm đầu tiên để bắt đầu xây dựng gian hàng."
                    : "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc."}
                </p>

                {products.length === 0 && (
                  <button onClick={openAddModal}>
                    <Plus size={17} />
                    Thêm sản phẩm đầu tiên
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => {
            setShowModal(false);
            setEditingProduct(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default SellerProducts;
