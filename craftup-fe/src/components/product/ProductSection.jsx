
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";

import "../../styles/ProductSection.css";

import api from "../../services/api";

const DEFAULT_IMAGE =
  "https://placehold.co/700x700?text=CraftUp";

function ProductSection({
  category,
  onCategoryChange,
  onAddToCart,
  searchQuery = "",
}) {
  const navigate = useNavigate();

  const [search, setSearch] = useState(searchQuery);

  useEffect(() => {
    setSearch(searchQuery);
  }, [searchQuery]);
  const [favorites, setFavorites] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [favoriteLoadingId, setFavoriteLoadingId] = useState(null);
  const [favoriteMessage, setFavoriteMessage] = useState("");

  // Lấy danh sách sản phẩm từ Backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/products");

        setProducts(response.data.data || []);
      } catch (err) {
        console.error("Lỗi tải sản phẩm:", err);

        setError(
          err.response?.data?.message ||
            "Không thể tải danh sách sản phẩm."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Lấy danh sách yêu thích đã lưu trong Database
  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setFavorites([]);
        return;
      }

      try {
        const response = await api.get("/favorites");

        const favoriteList = response.data.data || [];

        setFavorites(
          favoriteList.map((item) => Number(item.productId))
        );
      } catch (err) {
        console.error("Lỗi tải danh sách yêu thích:", err);
      }
    };

    fetchFavorites();
  }, []);

  // Lấy danh sách danh mục
  const categories = useMemo(() => {
    const names = [
      ...new Set(
        products
          .map((product) => product.category?.name)
          .filter(Boolean)
      ),
    ];

    return ["Tất cả", ...names];
  }, [products]);

  // Lọc sản phẩm
  const filteredProducts = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return products.filter((product) => {
      const productName = product.name?.toLowerCase() || "";
      const storeName =
        product.store?.storeName?.toLowerCase() || "";
      const categoryName =
        product.category?.name?.toLowerCase() || "";

      const matchSearch =
        productName.includes(keyword) ||
        storeName.includes(keyword) ||
        categoryName.includes(keyword);

      const selectedCategory = category?.toLowerCase() || "";

      const matchCategory =
        !category ||
        category === "Tất cả" ||
        selectedCategory === categoryName ||
        categoryName.includes(selectedCategory) ||
        selectedCategory.includes(categoryName);

      return matchSearch && matchCategory;
    });
  }, [products, search, category]);

  // Thêm hoặc xóa sản phẩm yêu thích trong Database
  const toggleFavorite = async (productId, e) => {
    e.stopPropagation();

    const token = localStorage.getItem("accessToken");

    if (!token) {
      setFavoriteMessage(
        "Vui lòng đăng nhập để lưu sản phẩm yêu thích."
      );
      return;
    }

    if (favoriteLoadingId !== null) return;

    const isFavorite = favorites.includes(Number(productId));

    try {
      setFavoriteLoadingId(productId);
      setFavoriteMessage("");

      if (isFavorite) {
        await api.delete(`/favorites/${productId}`);

        setFavorites((current) =>
          current.filter((id) => id !== Number(productId))
        );

        setFavoriteMessage(
          "Đã xóa sản phẩm khỏi danh sách yêu thích."
        );
      } else {
        await api.post("/favorites", {
          productId: Number(productId),
        });

        setFavorites((current) =>
          current.includes(Number(productId))
            ? current
            : [...current, Number(productId)]
        );

        setFavoriteMessage(
          "Đã thêm sản phẩm vào danh sách yêu thích."
        );
      }
    } catch (err) {
      console.error("Lỗi cập nhật yêu thích:", err);

      setFavoriteMessage(
        err.response?.data?.message ||
          "Không thể cập nhật danh sách yêu thích."
      );
    } finally {
      setFavoriteLoadingId(null);
    }
  };

  // Lấy ảnh chính của sản phẩm
  const getProductImage = (product) => {
    const images = Array.isArray(product.images)
      ? product.images
      : [];

    const primaryImage = images.find(
      (image) => image.isPrimary === true
    );

    return (
      primaryImage?.imageUrl ||
      images[0]?.imageUrl ||
      DEFAULT_IMAGE
    );
  };

  // Định dạng giá tiền
  const formatPrice = (price) => {
    return (
      new Intl.NumberFormat("vi-VN").format(Number(price)) +
      "đ"
    );
  };

  return (
    <section className="product-section" id="products">
      <div className="section-heading">
        <div>
          <span className="section-subtitle">
            TINH HOA THỦ CÔNG
          </span>

          <h2>Sản phẩm nổi bật</h2>

          <p>
            Khám phá những sản phẩm thủ công độc đáo từ
            các cửa hàng trên CraftUp.
          </p>
        </div>
      </div>

      {/* Tìm kiếm */}
      <div className="product-toolbar">
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm, cửa hàng..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Danh mục */}
      <div className="product-categories">
        {categories.map((item) => (
          <button
            key={item}
            className={
              category === item ||
              (!category && item === "Tất cả")
                ? "category-filter active"
                : "category-filter"
            }
            onClick={() => onCategoryChange?.(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Thông báo yêu thích */}
      {favoriteMessage && (
        <p
          role="status"
          style={{ margin: "10px 0", fontSize: "14px" }}
        >
          {favoriteMessage}
        </p>
      )}

      {/* Đang tải */}
      {loading && (
        <div className="empty-state">
          Đang tải sản phẩm...
        </div>
      )}

      {/* Lỗi */}
      {!loading && error && (
        <div className="empty-state">
          <p>{error}</p>

          <button onClick={() => window.location.reload()}>
            Thử lại
          </button>
        </div>
      )}

      {/* Danh sách sản phẩm */}
      {!loading && !error && (
        <>
          <div className="product-grid">
            {filteredProducts.map((product) => {
              const isFavorite = favorites.includes(
                Number(product.id)
              );

              return (
                <article
                  className="product-card"
                  key={product.id}
                  onClick={() =>
                    navigate(`/product/${product.id}`)
                  }
                  style={{ cursor: "pointer" }}
                >
                  <div className="product-image">
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = DEFAULT_IMAGE;
                      }}
                    />

                    <button
                      className="favorite-btn"
                      onClick={(e) =>
                        toggleFavorite(product.id, e)
                      }
                      disabled={
                        favoriteLoadingId === product.id
                      }
                      aria-label={
                        isFavorite
                          ? "Bỏ yêu thích sản phẩm"
                          : "Thêm vào yêu thích"
                      }
                      aria-pressed={isFavorite}
                    >
                      <Heart
                        size={20}
                        fill={
                          isFavorite
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>
                  </div>

                  <div className="product-info">
                    <span>
                      {product.category?.name || "Thủ công"}
                    </span>

                    <h3>{product.name}</h3>

                    <p>
                      {product.store?.storeName ||
                        "Cửa hàng CraftUp"}
                    </p>

                    <div className="product-bottom">
                      <strong>
                        {formatPrice(product.price)}
                      </strong>

                      <div className="product-actions">
                        <button
                          className="view-detail-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/product/${product.id}`);
                          }}
                        >
                          Xem chi tiết
                        </button>

                        <button
                          className="add-cart-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart?.(product);
                          }}
                          aria-label="Thêm vào giỏ hàng"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="empty-state">
              Không tìm thấy sản phẩm phù hợp.
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default ProductSection;
