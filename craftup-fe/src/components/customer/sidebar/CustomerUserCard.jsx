import { getInitials, getRoleLabel } from "./customerUserUtils";

const CustomerUserCard = ({ user }) => {
  return (
    <div className="customer-user-card">
      <div className="customer-user-avatar">
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt="Ảnh đại diện"
          />
        ) : (
          <span>{getInitials(user?.fullName)}</span>
        )}
      </div>

      <div>
        <strong>{user?.fullName || "Người dùng"}</strong>
        <span>{getRoleLabel(user?.role)}</span>
      </div>
    </div>
  );
};

export default CustomerUserCard;