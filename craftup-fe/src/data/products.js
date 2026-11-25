
export const categories = [
  { name: "Tất cả", icon: "✦" },
  { name: "Gốm sứ", icon: "◉" },
  { name: "Dệt may", icon: "▤" },
  { name: "Mây tre đan", icon: "▧" },
  { name: "Sơn mài", icon: "◈" },
];

export const products = [
  {
    id: 1,
    name: "Bình gốm men rạn thủ công",
    maker: "Xưởng gốm An Nhiên",
    category: "Gốm sứ",
    price: 420000,
    image:
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=700",
    tag: "Bán chạy",
  },
  {
    id: 2,
    name: "Khăn lụa tơ tằm Vạn Phúc",
    maker: "Nghệ nhân Thu Hà",
    category: "Dệt may",
    price: 350000,
    image:
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=700",
    tag: "Nổi bật",
  },
  {
    id: 3,
    name: "Giỏ mây đan thủ công",
    maker: "Hợp tác xã Bản Mây",
    category: "Mây tre đan",
    price: 190000,
    image:
      "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=700",
    tag: "",
  },
  {
    id: 4,
    name: "Bộ khay sơn mài truyền thống",
    maker: "Cơ sở Sơn Mài Việt",
    category: "Sơn mài",
    price: 580000,
    image:
      "https://images.unsplash.com/photo-1576021182211-9ea8dced3690?w=700",
    tag: "Thủ công",
  },
];

export const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN").format(price) + "đ";
