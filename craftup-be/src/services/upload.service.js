
import { Readable } from "node:stream";

import cloudinary from "../config/cloudinary.js";

export const uploadAvatarToCloudinary = async (file) => {
  if (!file) {
    throw new Error("Vui lòng chọn ảnh đại diện");
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "craftup/avatars",
        resource_type: "image",
        transformation: [
          {
            width: 500,
            height: 500,
            crop: "fill",
            gravity: "face",
          },
        ],
        timeout: 120000,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return reject(error);
        }

        if (!result) {
          return reject(new Error("Cloudinary không trả về kết quả"));
        }

        console.log("Cloudinary upload successful:", result.public_id);

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    uploadStream.on("error", (error) => {
      console.error("Upload stream error:", error);
      reject(error);
    });

    Readable.from(file.buffer).pipe(uploadStream);
  });
};


export const uploadProductImageToCloudinary = async (file) => {
  if (!file) {
    throw new Error("Vui lòng chọn ảnh sản phẩm");
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "craftup/products",
        resource_type: "image",
        transformation: [
          {
            width: 1200,
            height: 1200,
            crop: "limit",
            quality: "auto",
            fetch_format: "auto",
          },
        ],
        timeout: 120000,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary product upload error:", error);
          return reject(error);
        }

        if (!result) {
          return reject(
            new Error("Cloudinary không trả về kết quả")
          );
        }

        console.log(
          "Product image uploaded:",
          result.public_id
        );

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    uploadStream.on("error", (error) => {
      console.error("Product upload stream error:", error);
      reject(error);
    });

    Readable.from(file.buffer).pipe(uploadStream);
  });
};

export const deleteImageFromCloudinary = async (publicId) => {
  if (!publicId) return;

  return cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });
};
