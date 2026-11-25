
  import {
    registerUser,
    loginUser,
    getCurrentUser,
    updateCurrentUser,
    updateUserAvatar,
  } from "../services/auth.service.js";



  import {
    registerSchema,
    loginSchema,
    profileSchema,
  } from "../utils/auth-validation.js";


  // Đăng ký tài khoản
  export const register = async (req, res) => {
    try {
      // Kiểm tra dữ liệu đầu vào
      const validation = registerSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: "Dữ liệu đăng ký không hợp lệ",
          errors: validation.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        });
      }

      // Gọi Service
      const result = await registerUser(validation.data);

      return res.status(201).json({
        success: true,
        message: "Đăng ký tài khoản thành công",
        data: result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

  // Đăng nhập
  export const login = async (req, res) => {
  console.log("\n========== LOGIN ==========");

  try {
    console.log("1. Request body:", {
      email: req.body?.email,
      hasPassword: Boolean(req.body?.password),
    });

    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      console.log("2. VALIDATION FAILED:");
      console.log(validation.error.issues);

      return res.status(400).json({
        success: false,
        message: "Dữ liệu đăng nhập không hợp lệ",
        errors: validation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    console.log("2. VALIDATION SUCCESS");

    const result = await loginUser(validation.data);

    console.log("3. LOGIN SUCCESS:", result.user.email);

    return res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      data: result,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error.message);

    const statusCode =
      error.message === "Tài khoản đã bị vô hiệu hóa" ? 403 : 401;

    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

  // Lấy thông tin người dùng hiện tại
  export const getMe = async (req, res) => {
    try {
      const user = await getCurrentUser(req.user.id);

      return res.status(200).json({
        success: true,
        message: "Lấy thông tin tài khoản thành công",
        data: user,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  };


  export const updateProfile = async (req, res) => {
      try {
        const validation = profileSchema.safeParse(req.body);

        if (!validation.success) {
          return res.status(400).json({
            success: false,
            message: "Dữ liệu hồ sơ không hợp lệ",
            errors: validation.error.issues.map((issue) => ({
              field: issue.path.join("."),
              message: issue.message,
            })),
          });
        }

        const user = await updateCurrentUser(
          req.user.id,
          validation.data
        );

        return res.status(200).json({
          success: true,
          message: "Cập nhật hồ sơ thành công",
          data: user,
        });
      } catch (error) {
        const statusCode =
          error.message === "Không tìm thấy tài khoản" ? 404 :
          error.message === "Email đã được sử dụng" ? 409 : 500;

        return res.status(statusCode).json({
          success: false,
          message: error.message || "Không thể cập nhật hồ sơ",
        });
      }
    };


  export const uploadProfileAvatar = async (req, res) => {
    try {
      const result = await updateUserAvatar(
        req.user.id,
        req.file
      );

      return res.status(200).json({
        success: true,
        message: "Cập nhật ảnh đại diện thành công",
        data: result,
      });
    } catch (error) {
      if (error.message === "Vui lòng chọn ảnh đại diện") {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message === "Không tìm thấy tài khoản") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      console.error("Upload avatar error:", error);

      return res.status(500).json({
        success: false,
        message: "Không thể tải ảnh đại diện lên",
      });
    }
  };
