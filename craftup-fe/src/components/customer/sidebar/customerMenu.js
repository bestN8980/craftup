import {
  LayoutDashboard,
  Store,
  ShoppingCart,
  Package,
  MessageCircle,
  Heart,
  MapPin,
  UserRound,
  Settings,
  ShoppingBag,
} from "lucide-react";

export const menuItems = [
  { id: "overview", label: "Tổng quan", icon: LayoutDashboard },
  { id: "shopping", label: "Mua sắm", icon: Store },
  { id: "cart", label: "Giỏ hàng", icon: ShoppingCart },
  { id: "orders", label: "Đơn hàng của tôi", icon: Package },
  { id: "messages", label: "Tin nhắn", icon: MessageCircle },
  { id: "favorites", label: "Sản phẩm yêu thích", icon: Heart },
  { id: "addresses", label: "Địa chỉ nhận hàng", icon: MapPin },
  { id: "profile", label: "Thông tin cá nhân", icon: UserRound },
  { id: "settings", label: "Cài đặt", icon: Settings },
  { id: "checkout", label: "Thanh toán", icon: ShoppingBag },
];