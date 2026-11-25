import { useEffect, useState } from "react";
import api from "../services/api";
import {
  CalendarDays,
  Plus,
  ArrowUpRight,
  Clock,
} from "lucide-react";

import SellerSidebar from "../components/seller/SellerSidebar";
import SellerTopbar from "../components/seller/SellerTopbar";
import StatCard from "../components/seller/StatCard";
import RevenueChart from "../components/seller/RevenueChart";
import RecentOrders from "../components/seller/RecentOrders";
import SellerProducts from "../components/seller/SellerProducts";
import SellerOrders from "../components/seller/SellerOrders";
import SellerMessages from "../components/seller/SellerMessages";
import SellerStore from "../components/seller/SellerStore";
import SellerSettings from "../components/seller/SellerSettings";

import "../styles/SellerDashboard.css";

const pageTitles = {
  overview: "Tổng quan",
  products: "Quản lý sản phẩm",
  orders: "Quản lý đơn hàng",
  messages: "Tin nhắn",
  store: "Gian hàng của tôi",
  settings: "Cài đặt",
};

function SellerDashboard() {
  const [activePage, setActivePage] = useState("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    products: 0,
  });

const [statsLoading, setStatsLoading] = useState(true);

useEffect(() => {
  const fetchStats = async () => {
    try {
      setStatsLoading(true);

      const [revenueRes, ordersRes, productsRes] =
        await Promise.all([
          api.get("/orders/seller/revenue?period=7"),
          api.get("/orders/seller/stats"),
          api.get("/products/seller?page=1&limit=1"),
        ]);
      setStats({
        revenue: Number(revenueRes.data.totalRevenue || 0),

        orders: ordersRes.data?.data?.totalOrders ?? 0,

        products: productsRes.data?.pagination?.totalItems ?? 0,
      });
    } catch (error) {
      console.error("Lỗi lấy thống kê:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  fetchStats();
}, []);
  
const renderContent = () => {
  // Trang quản lý sản phẩm
  if (activePage === "products") {
    return <SellerProducts />;
  }

  if (activePage === "orders") {
  return <SellerOrders />;
}

  if (activePage === "messages") {
  return <SellerMessages />;
}
  if (activePage === "store") {
  return <SellerStore />;
}

  if (activePage === "settings") {
  return <SellerSettings />;
}

  // Những trang chưa phát triển
  if (activePage !== "overview") {
    return (
      <div className="seller-coming-soon">
        <div className="coming-soon-icon">
          <Clock size={30} />
        </div>

        <h2>{pageTitles[activePage]}</h2>

        <p>
          Khu vực này sẽ được phát triển trong bước tiếp theo.
        </p>

        <button onClick={() => setActivePage("overview")}>
          Quay lại tổng quan
        </button>
      </div>
    );
  }

  // Trang tổng quan
  return (
    <>
      <div className="seller-welcome">
        <div>
          <h2>Xin chào, Minh Anh! 👋</h2>
          <p>
            Đây là tình hình hoạt động của gian hàng bạn hôm nay.
          </p>
        </div>

        <button className="seller-add-product">
          <Plus size={18} />
          Thêm sản phẩm
        </button>
      </div>

      <div className="seller-stats-grid">
        <StatCard
          title="Tổng doanh thu"
          value={
            statsLoading
              ? "Đang tải..."
              : `${stats.revenue.toLocaleString("vi-VN")}đ`
          }
          change="7 ngày qua"
          type="revenue"
        />

        <StatCard
          title="Đơn hàng"
          value={statsLoading ? "Đang tải..." : stats.orders}
          change="Tổng đơn hàng"
          type="orders"
        />

        <StatCard
          title="Sản phẩm"
          value={statsLoading ? "Đang tải..." : stats.products}
          change="Đang kinh doanh"
          type="products"
        />

        <StatCard
          title="Lượt truy cập"
          value="—"
          change="Chưa có dữ liệu"
          type="views"
          positive={false}
        />
      </div>

      <div className="seller-main-grid">
        <RevenueChart />

        <div className="seller-insight-panel">
          <div className="seller-panel-header">
            <div>
              <h3>Hiệu suất gian hàng</h3>
              <p>Tổng quan trong tháng</p>
            </div>

            <ArrowUpRight size={19} />
          </div>

          <div className="seller-insight-content">
            <div className="seller-insight-circle">
              <div>
                <strong>86%</strong>
                <span>Hiệu suất</span>
              </div>
            </div>

            <p>
              Gian hàng đang hoạt động tốt. Hãy tiếp tục
              cập nhật sản phẩm và phản hồi khách hàng.
            </p>
          </div>

          <div className="seller-insight-footer">
            <span>So với tháng trước</span>
            <strong>+8.6%</strong>
          </div>
        </div>
      </div>

      <RecentOrders />

      <div className="seller-footer-note">
        <CalendarDays size={15} />
        <span>Dữ liệu minh họa cho giao diện CraftUp</span>
      </div>
    </>
  );
};


  return (
    <div className="seller-layout">
      <SellerSidebar
        activePage={activePage}
        onNavigate={setActivePage}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <main className={`seller-main ${collapsed ? "sidebar-collapsed" : ""}`}>
        <SellerTopbar
          pageTitle={pageTitles[activePage]}
          onOpenMenu={() => setMobileOpen(true)}
          onSettingsClick={() => setActivePage("settings")}
        />

        <div className="seller-content">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default SellerDashboard;