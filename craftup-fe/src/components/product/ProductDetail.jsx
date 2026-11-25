
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Store,
  MapPin,
  ChevronRight,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";

import api from "../../services/api";
import "../../styles/ProductDetail.css";

const formatPrice = (price) =>
  `${Number(price || 0).toLocaleString("vi-VN")}đ`;

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("vi-VN");
};

function ProductDetail() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [error, setError] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);

  const [creatingConversation, setCreatingConversation] = useState(false);

  // Lấy thông tin sản phẩm
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/products/${id}`);
        const data = response.data.data;

        setProduct(data);

        const primaryIndex = data.images?.findIndex(
          (image) => image.isPrimary
        );

        setActiveImage(primaryIndex >= 0 ? primaryIndex : 0);
        setQuantity(1);
      } catch (err) {
        console.error("Get product detail error:", err);

        setError(
          err.response?.data?.message ||
            "Không thể tải thông tin sản phẩm."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  // Kiểm tra sản phẩm đã được yêu thích chưa
  useEffect(() => {
    const checkFavorite = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token || !id) {
        setIsFavorite(false);
        return;
      }

      try {
        const response = await api.get("/favorites");
        const favorites = response.data.data || [];

        setIsFavorite(
          favorites.some(
            (item) => Number(item.productId) === Number(id)
          )
        );
      } catch (err) {
        console.error("Check favorite error:", err);
      }
    };

    checkFavorite();
  }, [id]);

  // Lấy danh sách đánh giá
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoadingReviews(true);
        setReviewError("");

        const response = await api.get(`/reviews/product/${id}`);
        const data = response.data.data;

        setReviews(data.reviews || []);
        setAverageRating(Number(data.averageRating) || 0);
        setTotalReviews(data.totalReviews || 0);
      } catch (err) {
        console.error("Get reviews error:", err);

        setReviewError(
          err.response?.data?.message ||
            "Không thể tải danh sách đánh giá."
        );
      } finally {
        setLoadingReviews(false);
      }
    };

    if (id) fetchReviews();
  }, [id]);

  // Thêm hoặc xóa sản phẩm yêu thích
  const handleToggleFavorite = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      alert("Vui lòng đăng nhập để sử dụng chức năng yêu thích.");
      return;
    }

    if (loadingFavorite) return;

    try {
      setLoadingFavorite(true);

      if (isFavorite) {
        await api.delete(`/favorites/${product.id}`);
        setIsFavorite(false);
        alert("Đã xóa sản phẩm khỏi danh sách yêu thích.");
      } else {
        await api.post("/favorites", {
          productId: product.id,
        });
        setIsFavorite(true);
        alert("Đã thêm sản phẩm vào danh sách yêu thích.");
      }
    } catch (err) {
      console.error("Toggle favorite error:", err);

      alert(
        err.response?.data?.message ||
          "Không thể cập nhật danh sách yêu thích."
      );
    } finally {
      setLoadingFavorite(false);
    }
  };

  const handleMessageSeller = async () => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    alert("Vui lòng đăng nhập để nhắn tin với người bán.");
    return;
  }

  const storeId = product.storeId || product.store?.id;

  if (!storeId) {
    alert("Không tìm thấy thông tin cửa hàng của sản phẩm.");
    return;
  }

  if (creatingConversation) return;

  try {
    setCreatingConversation(true);

    const response = await api.post("/conversations", {
      storeId,
    });

    const conversation = response.data?.data;

    if (!response.data?.success || !conversation?.id) {
      throw new Error(
        response.data?.message || "Không thể tạo cuộc trò chuyện."
      );
    }

    // Lưu ID để trang Tin nhắn có thể mở đúng cuộc trò chuyện.
    sessionStorage.setItem(
      "pendingConversationId",
      String(conversation.id)
    );

    alert("Đã mở cuộc trò chuyện với cửa hàng. Hãy vào mục Tin nhắn để bắt đầu.");

  } catch (err) {
    console.error("Create conversation error:", err);

    alert(
      err.response?.data?.message ||
        err.message ||
        "Không thể nhắn tin với người bán."
    );
  } finally {
    setCreatingConversation(false);
  }
};

  if (loading) {
    return (
      <div className="product-detail-page">
        <p>Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <p>{error || "Không tìm thấy sản phẩm."}</p>
      </div>
    );
  }

  const images = product.images || [];
  const currentImage = images[activeImage];

  const categoryName = product.category?.name || "Danh mục";
  const storeName = product.store?.storeName || "Cửa hàng";
  const storeAddress = product.store?.address || "Chưa cập nhật địa chỉ";
  const stock = Number(product.stock) || 0;
  const isOutOfStock = stock <= 0;

  // Thêm sản phẩm vào giỏ hàng
  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);

      await api.post("/cart/items", {
        productId: product.id,
        quantity,
      });

      alert("Đã thêm sản phẩm vào giỏ hàng.");
    } catch (err) {
      console.error("Add to cart error:", err);

      alert(
        err.response?.data?.message ||
          "Không thể thêm sản phẩm vào giỏ hàng."
      );
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
  };

  return (
    <div className="product-detail-page">
      <div className="product-breadcrumb">
        <span onClick={() => (window.location.href = "/")}>
          Trang chủ
        </span>

        <ChevronRight size={14} />
        <span>{categoryName}</span>
        <ChevronRight size={14} />
        <strong>{product.name}</strong>
      </div>

      <section className="product-detail-main">
        <div className="product-gallery">
          <div className="product-main-image">
            <button
              className={`product-favorite-btn ${
                isFavorite ? "active" : ""
              }`}
              onClick={handleToggleFavorite}
              disabled={loadingFavorite}
              aria-label={
                isFavorite
                  ? "Bỏ yêu thích sản phẩm"
                  : "Yêu thích sản phẩm"
              }
              aria-pressed={isFavorite}
            >
              <Heart
                size={21}
                fill={isFavorite ? "currentColor" : "none"}
              />
            </button>

            {currentImage ? (
              <img
                className="product-detail-image"
                src={currentImage.imageUrl}
                alt={currentImage.altText || product.name}
              />
            ) : (
              <div className="product-art">
                <span>🏺</span>
                <small>Chưa có ảnh sản phẩm</small>
              </div>
            )}
          </div>

          {images.length > 0 && (
            <div className="product-thumbnails">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  className={activeImage === index ? "active" : ""}
                  onClick={() => setActiveImage(index)}
                >
                  <img
                    src={image.imageUrl}
                    alt={image.altText || product.name}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-information">
          <span className="product-category-label">
            {categoryName}
          </span>

          <h1>{product.name}</h1>

          <div className="product-rating-line">
            <span className="product-rating">
              <Star size={15} fill="currentColor" />
              {totalReviews > 0
                ? averageRating.toFixed(1)
                : "Chưa có đánh giá"}
            </span>

            <span>{totalReviews} đánh giá</span>
          </div>

          <div className="product-price-area">
            <strong>{formatPrice(product.price)}</strong>
          </div>

          <p className="product-short-description">
            {product.description || "Chưa có mô tả sản phẩm."}
          </p>

          <div className="product-attributes">
            <div>
              <span>Danh mục</span>
              <strong>{categoryName}</strong>
            </div>

            <div>
              <span>Mã sản phẩm</span>
              <strong>{product.sku || product.id}</strong>
            </div>

            <div>
              <span>Tình trạng</span>
              <strong className="product-stock">
                {stock > 0
                  ? `Còn ${stock} sản phẩm`
                  : "Hết hàng"}
              </strong>
            </div>
          </div>

          <div className="product-quantity-row">
            <span>Số lượng</span>

            <div className="product-quantity-control">
              <button
                onClick={() =>
                  setQuantity((prev) => Math.max(1, prev - 1))
                }
                disabled={quantity <= 1}
              >
                <Minus size={15} />
              </button>

              <span>{quantity}</span>

              <button
                onClick={() =>
                  setQuantity((prev) => Math.min(stock, prev + 1))
                }
                disabled={quantity >= stock}
              >
                <Plus size={15} />
              </button>
            </div>

            <small>Còn {stock} sản phẩm</small>
          </div>

          <div className="product-purchase-actions">
            <button
              className="product-add-cart"
              onClick={handleAddToCart}
              disabled={isOutOfStock || addingToCart}
            >
              <ShoppingCart size={18} />
              {addingToCart ? "Đang thêm..." : "Thêm vào giỏ hàng"}
            </button>

            <button
              className="product-buy-now"
              onClick={handleBuyNow}
              disabled={isOutOfStock || addingToCart}
            >
              Mua ngay
            </button>
          </div>

          <div className="product-promises">
            <div>
              <Truck size={19} />
              <span>Giao hàng toàn quốc</span>
            </div>

            <div>
              <ShieldCheck size={19} />
              <span>Cam kết hàng thủ công</span>
            </div>

            <div>
              <RotateCcw size={19} />
              <span>Hỗ trợ đổi trả</span>
            </div>
          </div>
        </div>
      </section>

      <section className="product-shop-card">
        <div className="product-shop-avatar">
          <Store size={28} />
        </div>

        <div className="product-shop-info">
          <h3>{storeName}</h3>

          <div>
            <span>
              <MapPin size={13} />
              {storeAddress}
            </span>
          </div>
        </div>

        <div className="product-shop-actions">
        <button
          className="product-message-seller"
          onClick={handleMessageSeller}
          disabled={creatingConversation}
        >
          <MessageCircle size={17} />
          {creatingConversation ? "Đang kết nối..." : "Nhắn tin"}
        </button>

        <button className="product-visit-shop">
          Xem cửa hàng <ChevronRight size={15} />
        </button>
      </div>
      </section>

      <section className="product-detail-content">
        <div className="product-tabs">
          <button
            className={activeTab === "description" ? "active" : ""}
            onClick={() => setActiveTab("description")}
          >
            Mô tả sản phẩm
          </button>

          <button
            className={activeTab === "specifications" ? "active" : ""}
            onClick={() => setActiveTab("specifications")}
          >
            Thông tin chi tiết
          </button>

          <button
            className={activeTab === "reviews" ? "active" : ""}
            onClick={() => setActiveTab("reviews")}
          >
            Đánh giá ({totalReviews})
          </button>
        </div>

        <div className="product-tab-content">
          {activeTab === "description" && (
            <div className="product-description-content">
              <h3>Thông tin sản phẩm</h3>

              <p>
                {product.description || "Chưa có mô tả sản phẩm."}
              </p>

              <div className="product-craft-note">
                <CheckCircle2 size={19} />
                <span>
                  Sản phẩm được cung cấp bởi {storeName}.
                </span>
              </div>
            </div>
          )}

          {activeTab === "specifications" && (
            <div className="product-specifications">
              <div>
                <span>Tên sản phẩm</span>
                <strong>{product.name}</strong>
              </div>

              <div>
                <span>Danh mục</span>
                <strong>{categoryName}</strong>
              </div>

              <div>
                <span>Mã sản phẩm</span>
                <strong>{product.sku || product.id}</strong>
              </div>

              <div>
                <span>Giá bán</span>
                <strong>{formatPrice(product.price)}</strong>
              </div>

              <div>
                <span>Số lượng tồn kho</span>
                <strong>{stock}</strong>
              </div>

              <div>
                <span>Cửa hàng</span>
                <strong>{storeName}</strong>
              </div>

              <div>
                <span>Địa chỉ cửa hàng</span>
                <strong>{storeAddress}</strong>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="product-reviews">
              <div className="product-review-summary">
                <strong>
                  {totalReviews > 0
                    ? averageRating.toFixed(1)
                    : "0"}/5
                </strong>

                <div>
                  <div className="product-review-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={17}
                        fill={
                          star <= Math.round(averageRating)
                            ? "currentColor"
                            : "none"
                        }
                      />
                    ))}
                  </div>

                  <span>
                    {totalReviews} đánh giá từ khách hàng
                  </span>
                </div>
              </div>

              {loadingReviews && (
                <p>Đang tải danh sách đánh giá...</p>
              )}

              {reviewError && (
                <p className="product-review-error">
                  {reviewError}
                </p>
              )}

              {!loadingReviews &&
                !reviewError &&
                reviews.length === 0 && (
                  <p>Chưa có đánh giá nào cho sản phẩm này.</p>
                )}

              {!loadingReviews &&
                reviews.map((review) => (
                  <article
                    className="product-review-item"
                    key={review.id}
                  >
                    <div className="product-review-avatar">
                      {review.user?.avatarUrl ? (
                        <img
                          src={review.user.avatarUrl}
                          alt={review.user.fullName || "Người dùng"}
                        />
                      ) : (
                        (review.user?.fullName || "K")
                          .charAt(0)
                          .toUpperCase()
                      )}
                    </div>

                    <div className="product-review-body">
                      <div className="product-review-heading">
                        <strong>
                          {review.user?.fullName || "Khách hàng"}
                        </strong>

                        <span>{formatDate(review.createdAt)}</span>
                      </div>

                      <div className="product-review-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={13}
                            fill={
                              star <= review.rating
                                ? "currentColor"
                                : "none"
                            }
                          />
                        ))}
                      </div>

                      {review.comment && <p>{review.comment}</p>}

                      {review.sellerReply && (
                        <div className="product-seller-reply">
                          <div className="product-seller-reply-heading">
                            <Store size={16} />
                            <strong>Phản hồi từ người bán</strong>
                          </div>

                          <p>{review.sellerReply}</p>

                          {review.sellerRepliedAt && (
                            <span>
                              {formatDate(review.sellerRepliedAt)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default ProductDetail;
