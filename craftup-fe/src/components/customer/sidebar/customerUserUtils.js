export const getInitials = (fullName) => {
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

export const getRoleLabel = (role) => {
  const roles = {
    CUSTOMER: "Khách hàng",
    SELLER: "Người bán",
    ADMIN: "Quản trị viên",
  };

  return roles[role] || "Thành viên CraftUp";
};