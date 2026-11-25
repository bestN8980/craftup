import { useEffect, useRef, useState } from "react";
import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  UserRound,
  LogOut,
} from "lucide-react";


import NotificationBell from "../notifications/NotificationBell";

import { useAuth } from "../../context/AuthContext";

const getInitials = (fullName) => {
  if (!fullName?.trim()) return "U";

  const words = fullName.trim().split(/\s+/);

  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  return (
    words[0].charAt(0) +
    words[words.length - 1].charAt(0)
  ).toUpperCase();
};

const CustomerTopbar = ({
  pageTitle,
  onOpenMenu,
  onProfileClick,
  onSearch,
}) => {
  const { user, logout } = useAuth();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const dropdownRef = useRef(null);

  const fullName = user?.fullName || user?.username || "Khách hàng";

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

  const handleSearch = (e) => {
  e.preventDefault();

  const keyword = searchValue.trim();

  if (!keyword) return;

  onSearch?.(keyword);
  setShowSearch(false);
};

  const handleProfile = () => {
    setShowDropdown(false);
    onProfileClick();
  };

  const handleLogout = async () => {
    setShowDropdown(false);

    try {
      await logout();
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <header className="customer-topbar">
      <div className="customer-topbar-left">
        <button
          className="customer-mobile-menu"
          onClick={onOpenMenu}
          aria-label="Mở menu"
        >
          <Menu size={21} />
        </button>

        <div>
          <h1>{pageTitle}</h1>
          <p>Trang chủ / {pageTitle}</p>
        </div>
      </div>

      <div className="customer-topbar-actions">
        <div className="customer-topbar-search">
  {showSearch && (
    <form onSubmit={handleSearch}>
      <input
        type="text"
        placeholder="Tìm kiếm sản phẩm..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        autoFocus
      />
    </form>
  )}

  <button
    className="customer-icon-btn"
    title="Tìm kiếm sản phẩm"
    onClick={() => {
      if (showSearch && searchValue.trim()) {
        onSearch?.(searchValue.trim());
        setShowSearch(false);
      } else {
        setShowSearch((prev) => !prev);
      }
    }}
  >
    <Search size={19} />
  </button>
</div>

       <NotificationBell />

        <div className="customer-avatar-dropdown" ref={dropdownRef}>
          <button
            className="customer-avatar-trigger"
            onClick={() => setShowDropdown((previous) => !previous)}
            aria-label="Tài khoản"
            aria-expanded={showDropdown}
          >
            <div className="customer-topbar-avatar">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Ảnh đại diện" />
              ) : (
                <span>{getInitials(fullName)}</span>
              )}
            </div>

            <ChevronDown
              size={16}
              className={showDropdown ? "customer-avatar-chevron-open" : ""}
            />
          </button>

          {showDropdown && (
            <div className="customer-avatar-menu">
              <div className="customer-avatar-menu-user">
                <strong>{fullName}</strong>
                <span>{user?.email || "Tài khoản CraftUp"}</span>
              </div>

              <div className="customer-avatar-menu-divider" />

              <button onClick={handleProfile}>
                <UserRound size={17} />
                <span>Thông tin cá nhân</span>
              </button>

              <button
                className="customer-avatar-logout"
                onClick={handleLogout}
              >
                <LogOut size={17} />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default CustomerTopbar;