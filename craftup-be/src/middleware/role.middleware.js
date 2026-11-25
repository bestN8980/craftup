
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Kiểm tra người dùng đã được xác thực chưa
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập để tiếp tục",
      });
    }

    // Kiểm tra vai trò người dùng
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền thực hiện thao tác này",
      });
    }

    // Có quyền thì chuyển sang bước tiếp theo
    next();
  };
};
