
import { z } from "zod";

// Kiểm tra dữ liệu khi tạo sản phẩm
export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Tên sản phẩm phải có ít nhất 2 ký tự")
    .max(200, "Tên sản phẩm không được vượt quá 200 ký tự"),

  categoryId: z.coerce
    .number()
    .int()
    .positive("Danh mục không hợp lệ"),

  description: z
    .string()
    .trim()
    .max(10000, "Mô tả quá dài")
    .optional()
    .or(z.literal("")),

  price: z.coerce
    .number()
    .min(0, "Giá sản phẩm không được âm"),

  stock: z.coerce
    .number()
    .int()
    .min(0, "Số lượng tồn kho không được âm")
    .default(0),

  sku: z
    .string()
    .trim()
    .max(100, "SKU không được vượt quá 100 ký tự")
    .optional()
    .or(z.literal("")),
});

// Kiểm tra dữ liệu khi cập nhật sản phẩm
export const updateProductSchema = createProductSchema
  .partial();

// Kiểm tra tham số khi lấy danh sách sản phẩm
export const getProductsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(12),

  search: z.string().trim().optional(),

  categoryId: z.coerce.number().int().positive().optional(),

  minPrice: z.coerce.number().min(0).optional(),

  maxPrice: z.coerce.number().min(0).optional(),

  sort: z
    .enum(["newest", "price_asc", "price_desc"])
    .default("newest"),
});
