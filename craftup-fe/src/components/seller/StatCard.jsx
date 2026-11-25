import {
  Wallet,
  ShoppingCart,
  Package,
  Eye,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const icons = {
  revenue: Wallet,
  orders: ShoppingCart,
  products: Package,
  views: Eye,
};

function StatCard({ title, value, change, type, positive = true }) {
  const Icon = icons[type];
  const TrendIcon = positive ? TrendingUp : TrendingDown;

  return (
    <div className="seller-stat-card">
      <div className="seller-stat-top">
        <div className={`seller-stat-icon ${type}`}>
          <Icon size={21} />
        </div>

        <span className="seller-stat-period">7 ngày qua</span>
      </div>

      <p className="seller-stat-title">{title}</p>

      <div className="seller-stat-bottom">
        <h3>{value}</h3>

        <span className={`seller-stat-change ${positive ? "up" : "down"}`}>
          <TrendIcon size={14} />
          {change}
        </span>
      </div>
    </div>
  );
}

export default StatCard;