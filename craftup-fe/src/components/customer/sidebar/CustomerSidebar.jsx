import CustomerBrand from "./CustomerBrand";
import CustomerUserCard from "./CustomerUserCard";
import CustomerSidebarNav from "./CustomerSidebarNav";
import CustomerSidebarBottom from "./CustomerSidebarBottom";

const CustomerSidebar = ({
  user,
  activePage,
  setActivePage,
  mobileOpen,
  setMobileOpen,
}) => {
  return (
    <>
      {mobileOpen && (
        <div
          className="customer-sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`customer-sidebar ${
          mobileOpen ? "mobile-open" : ""
        }`}
      >
        <CustomerBrand />

        <CustomerUserCard user={user} />

        <CustomerSidebarNav
          activePage={activePage}
          setActivePage={setActivePage}
          onNavigate={() => setMobileOpen(false)}
        />

        <CustomerSidebarBottom />
      </aside>
    </>
  );
};

export default CustomerSidebar;