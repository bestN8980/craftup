import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../notifications/NotificationBell";

import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  UserRound,
  LogOut,
  Settings,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

function SellerTopbar({ onOpenMenu, pageTitle, onSettingsClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const fullName = user?.fullName || user?.username || "Người bán";
  const avatarUrl = user?.avatarUrl;

  const avatarLetter = fullName.trim().charAt(0).toUpperCase();

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Đi đến trang thông tin cá nhân
  const handleProfile = () => {
  setShowDropdown(false);
  onSettingsClick?.();
};

  // Đăng xuất
  const handleLogout = async () => {
    setShowDropdown(false);
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="seller-topbar">
      <div className="seller-topbar-left">
        <button
          className="seller-mobile-menu"
          onClick={onOpenMenu}
          aria-label="Mở menu"
        >
          <Menu size={22} />
        </button>

        <div>
          <h1>{pageTitle}</h1>
          <p>Chào mừng bạn quay trở lại!</p>
        </div>
      </div>

      <div className="seller-topbar-right">
        <div className="seller-search">
          <Search size={18} />
          <input placeholder="Tìm kiếm..." />
          <kbd>⌘ K</kbd>
        </div>

        <NotificationBell />

        {/* Avatar và dropdown */}
        <div className="seller-user-dropdown" ref={dropdownRef}>
          <button
            className="seller-user"
            onClick={() => setShowDropdown(!showDropdown)}
            aria-expanded={showDropdown}
          >
            <div className="seller-user-avatar">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Ảnh đại diện" />
              ) : avatarLetter ? (
                avatarLetter
              ) : (
                <UserRound size={20} />
              )}
            </div>

            <div className="seller-user-info">
              <strong>{fullName}</strong>
              <span>Người bán</span>
            </div>

            <ChevronDown
              size={16}
              className={showDropdown ? "seller-chevron-open" : ""}
            />
          </button>

          {showDropdown && (
  <div className="seller-user-menu">
    <div className="seller-user-menu-header">
      <div className="seller-user-menu-avatar">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Ảnh đại diện" />
        ) : (
          avatarLetter
        )}
      </div>

      <div className="seller-user-menu-details">
        <strong>{fullName}</strong>
        <span>Người bán CraftUp</span>
      </div>
    </div>

    <div className="seller-user-menu-divider" />

    <button
  className="seller-menu-profile"
  onClick={handleProfile}
>
  <Settings size={18} />
  <span>Cài đặt tài khoản</span>
  <ChevronDown size={15} className="seller-menu-arrow" />
</button>

    <button
      className="seller-logout-button"
      onClick={handleLogout}
    >
      <LogOut size={18} />
      <span>Đăng xuất</span>
    </button>
  </div>
)}
        </div>
      </div>
    </header>
  );
}

export default SellerTopbar;