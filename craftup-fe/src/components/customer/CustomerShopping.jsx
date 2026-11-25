
import { useState } from "react";

import ProductSection from "../product/ProductSection";
import api from "../../services/api";

function CustomerShopping({ searchQuery }) {
  const [category, setCategory] = useState("Tất cả");
  const [message, setMessage] = useState("");
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async (product) => {
    try {
      setAdding(true);
      setMessage("");

      await api.post("/cart/items", {
        productId: product.id,
        quantity: 1,
      });

      setMessage(
        `Đã thêm "${product.name}" vào giỏ hàng thành công!`
      );
    } catch (error) {
      console.error("Lỗi thêm sản phẩm vào giỏ hàng:", error);

      setMessage(
        error.response?.data?.message ||
          "Không thể thêm sản phẩm vào giỏ hàng."
      );
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="customer-shopping">
      <div style={{ marginBottom: "20px" }}>
        <h2>Khám phá sản phẩm</h2>
        <p>
          Lựa chọn những sản phẩm thủ công độc đáo từ các nghệ nhân Việt Nam.
        </p>
      </div>

      {message && (
        <div
          style={{
            padding: "12px 16px",
            marginBottom: "16px",
            borderRadius: "8px",
            background: "#f5eee6",
            color: "#68452f",
          }}
        >
          {message}
        </div>
      )}

      {adding && <p>Đang thêm sản phẩm vào giỏ hàng...</p>}

      <ProductSection
        category={category}
        onCategoryChange={setCategory}
        onAddToCart={handleAddToCart}
        searchQuery={searchQuery}
        />
    </div>
  );
}

export default CustomerShopping;
