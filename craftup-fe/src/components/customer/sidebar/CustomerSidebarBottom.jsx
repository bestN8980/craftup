import { LogOut } from "lucide-react";

const CustomerSidebarBottom = () => {
  return (
    <div className="customer-sidebar-bottom">
      <button
        className="customer-nav-item"
        onClick={() => {
          window.location.href = "/";
        }}
      >
        <LogOut size={19} />
        <span>Về trang chủ</span>
      </button>
    </div>
  );
};

export default CustomerSidebarBottom;