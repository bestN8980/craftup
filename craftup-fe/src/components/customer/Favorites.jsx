
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Heart,
  ShoppingCart,
  SlidersHorizontal,
  PackageOpen,
  LoaderCircle,
  Trash2,
} from "lucide-react";

import api from "../../services/api";
import "../../styles/Favorites.css";

function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN").format(price) + "đ";
}

function FavoriteCard({ product, onRemove, onAddToCart, removingId, addingId }) {
  const isRemoving = removingId === product.id;
  const isAdding = addingId === product.id;

  return (
    <div className="favorite-card">
      <div className="favorite-image">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <span>🎨</span>
        )}

        <button
          className="favorite-remove"
          onClick={() => onRemove(product.id)}
          disabled={isRemoving}
          title="Bỏ yêu thích"
          aria-label={`Bỏ yêu thích ${product.name}`}
        >
          {isRemoving ? (
            <LoaderCircle size={19} className="animate-spin" />
          ) : (
            <Heart size={19} fill="currentColor" />
          )}
        </button>
      </div>

      <div className="favorite-info">
        <span className="favorite-category">
          {product.category}
        </span>

        <h3>{product.name}</h3>

        <p className="favorite-shop">{product.shop}</p>

        <div className="favorite-card-bottom">
          <strong>{formatPrice(product.price)}</strong>

          <button
            className="favorite-cart-btn"
            onClick={() => onAddToCart(product)}
            disabled={isAdding || product.stock <= 0}
            title={
              product.stock <= 0
                ? "Sản phẩm đã hết hàng"
                : "Thêm vào giỏ hàng"
            }
            aria-label={`Thêm ${product.name} vào giỏ hàng`}
          >
            {isAdding ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <ShoppingCart size={17} />
            )}
          </button>
        </div>

        {product.stock <= 0 && (
          <small>Hết hàng</small>
        )}
      </div>
    </div>
  );
}

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tất cả");

  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [addingId, setAddingId] = useState(null);

  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");

  // Lấy danh sách yêu thích từ Backend
  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/favorites");

      setFavorites(response.data.data || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách yêu thích:", err);

      setError(
        err.response?.data?.message ||
        "Không thể tải danh sách yêu thích."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  // Tạo danh sách danh mục từ dữ liệu thật
  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        favorites.map((item) => item.product.category).filter(Boolean)
      ),
    ];

    return ["Tất cả", ...uniqueCategories];
  }, [favorites]);

  // Tìm kiếm và lọc sản phẩm
  const filteredFavorites = useMemo(() => {
    return favorites.filter((item) => {
      const product = item.product;

      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.shop.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        activeCategory === "Tất cả" ||
        product.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [favorites, search, activeCategory]);

  // Xóa sản phẩm yêu thích
  const removeFavorite = async (productId) => {
    try {
      setRemovingId(productId);
      setError("");
      setNotification("");

      await api.delete(`/favorites/${productId}`);

      setFavorites((current) =>
        current.filter((item) => item.productId !== productId)
      );

      setNotification("Đã xóa sản phẩm khỏi danh sách yêu thích.");
    } catch (err) {
      console.error("Lỗi xóa yêu thích:", err);

      setError(
        err.response?.data?.message ||
        "Không thể xóa sản phẩm yêu thích."
      );
    } finally {
      setRemovingId(null);
    }
  };

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = async (product) => {
    try {
      setAddingId(product.id);
      setError("");
      setNotification("");

      await api.post("/cart/items", {
        productId: product.id,
        quantity: 1,
      });

      setNotification(
        `Đã thêm "${product.name}" vào giỏ hàng.`
      );
    } catch (err) {
      console.error("Lỗi thêm vào giỏ hàng:", err);

      setError(
        err.response?.data?.message ||
        "Không thể thêm sản phẩm vào giỏ hàng."
      );
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="favorites-page">
      <div className="favorites-heading">
        <div>
          <span className="favorites-eyebrow">
            BỘ SƯU TẬP CỦA BẠN
          </span>

          <h1>Sản phẩm yêu thích</h1>

          <p>
            Những món đồ thủ công bạn đã lưu lại để khám phá và mua sắm sau.
          </p>
        </div>

        <div className="favorites-total">
          <Heart size={19} />
          <span>{favorites.length} sản phẩm</span>
        </div>
      </div>

      <div className="favorites-toolbar">
        <div className="favorites-search">
          <Search size={19} />

          <input
            type="text"
            placeholder="Tìm sản phẩm hoặc cửa hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="favorites-filter-label">
          <SlidersHorizontal size={17} />
          <span>Lọc theo danh mục</span>
        </div>
      </div>

      <div className="favorites-categories">
        {categories.map((category) => (
          <button
            key={category}
            className={
              activeCategory === category ? "active" : ""
            }
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {error && (
        <div className="favorites-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="favorites-empty">
          <LoaderCircle size={32} className="animate-spin" />
          <p>Đang tải danh sách yêu thích...</p>
        </div>
      ) : filteredFavorites.length > 0 ? (
        <div className="favorites-grid">
          {filteredFavorites.map((item) => (
            <FavoriteCard
              key={item.id}
              product={item.product}
              onRemove={removeFavorite}
              onAddToCart={addToCart}
              removingId={removingId}
              addingId={addingId}
            />
          ))}
        </div>
      ) : (
        <div className="favorites-empty">
          <div className="favorites-empty-icon">
            {favorites.length === 0 ? (
              <Heart size={35} />
            ) : (
              <PackageOpen size={35} />
            )}
          </div>

          <h3>
            {favorites.length === 0
              ? "Danh sách yêu thích đang trống"
              : "Không tìm thấy sản phẩm"}
          </h3>

          <p>
            {favorites.length === 0
              ? "Hãy khám phá CraftUp và lưu lại những sản phẩm bạn yêu thích nhé."
              : "Thử thay đổi từ khóa tìm kiếm hoặc danh mục."}
          </p>

          {favorites.length > 0 && (
            <button
              onClick={() => {
                setSearch("");
                setActiveCategory("Tất cả");
              }}
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      )}

      {notification && (
        <div className="favorites-notification">
          <ShoppingCart size={18} />
          {notification}
        </div>
      )}
    </div>
  );
}
