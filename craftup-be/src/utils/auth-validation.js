
import { z } from "zod";

// Kiểm tra dữ liệu đăng ký
export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Họ tên phải có ít nhất 2 ký tự")
    .max(100, "Họ tên không được vượt quá 100 ký tự"),

  username: z
    .string()
    .trim()
    .min(3, "Username phải có ít nhất 3 ký tự")
    .max(50, "Username không được vượt quá 50 ký tự")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username chỉ được chứa chữ cái, số và dấu gạch dưới"
    ),

  email: z
    .string()
    .trim()
    .email("Email không hợp lệ")
    .max(150, "Email quá dài"),

  password: z
    .string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .max(72, "Mật khẩu không được vượt quá 72 ký tự"),

  phone: z
    .string()
    .trim()
    .max(20, "Số điện thoại quá dài")
    .optional()
    .or(z.literal("")),

  role: z
    .enum(["CUSTOMER", "SELLER"])
    .default("CUSTOMER"),
});

// Kiểm tra dữ liệu đăng nhập
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Email không hợp lệ"),

  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu"),
});


export const profileSchema = z.object({
    fullName: z
      .string()
      .trim()
      .min(2, "Họ tên phải có ít nhất 2 ký tự")
      .max(100, "Họ tên không được vượt quá 100 ký tự"),

    email: z
      .string()
      .trim()
      .email("Email không hợp lệ")
      .max(150, "Email quá dài"),

    phone: z
      .string()
      .trim()
      .max(20, "Số điện thoại quá dài")
      .optional()
      .or(z.literal("")),

    birthday: z
      .string()
      .optional()
      .or(z.literal("")),

    gender: z
      .enum(["Nam", "Nữ", "Khác", "Không muốn tiết lộ", ""])
      .optional(),

    address: z
      .string()
      .trim()
      .max(500, "Địa chỉ quá dài")
      .optional()
      .or(z.literal("")),

    occupation: z
      .string()
      .trim()
      .max(100, "Nghề nghiệp quá dài")
      .optional()
      .or(z.literal("")),

    bio: z
      .string()
      .trim()
      .max(300, "Giới thiệu không được vượt quá 300 ký tự")
      .optional()
      .or(z.literal("")),
  });
