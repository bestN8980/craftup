
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { User } from "../models/index.js";

import { Op } from "sequelize";

import {
  uploadAvatarToCloudinary,
} from "./upload.service.js";



// Tạo JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    }
  );
};

// Đăng ký tài khoản
export const registerUser = async (data) => {
  const {
  fullName,
  username,
  email,
  password,
  phone,
  role = "CUSTOMER",
} = data;

  // Chuẩn hóa email và username
  const normalizedEmail = email.toLowerCase();
  const normalizedUsername = username.toLowerCase();

  // Kiểm tra email đã tồn tại
  const existingEmail = await User.findOne({
    where: {
      email: normalizedEmail,
    },
  });

  if (existingEmail) {
    throw new Error("Email đã được sử dụng");
  }

  // Kiểm tra username đã tồn tại
  const existingUsername = await User.findOne({
    where: {
      username: normalizedUsername,
    },
  });

  if (existingUsername) {
    throw new Error("Username đã được sử dụng");
  }

  // Mã hóa mật khẩu
  const passwordHash = await bcrypt.hash(password, 12);

  // Tạo tài khoản
  const user = await User.create({
    fullName,
    username: normalizedUsername,
    email: normalizedEmail,
    passwordHash,
    phone: phone || null,
    role,
  });

  // Trả thông tin và JWT
  const token = generateToken(user);

  return {
    user: {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    token,
  };
};

// Đăng nhập
export const loginUser = async (data) => {
  const { email, password } = data;

  const normalizedEmail = email.toLowerCase();

  // Tìm tài khoản
  const user = await User.findOne({
    where: {
      email: normalizedEmail,
    },
  });

  if (!user) {
    throw new Error("Email hoặc mật khẩu không chính xác");
  }

  // Kiểm tra trạng thái tài khoản
  if (!user.isActive) {
    throw new Error("Tài khoản đã bị vô hiệu hóa");
  }

  // So sánh mật khẩu
  const isPasswordValid = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    throw new Error("Email hoặc mật khẩu không chính xác");
  }

  // Tạo JWT
  const token = generateToken(user);

  return {
    user: {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    token,
  };
};

// Lấy thông tin tài khoản
export const getCurrentUser = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: {
      exclude: ["passwordHash"],
    },
  });

  if (!user) {
    throw new Error("Không tìm thấy tài khoản");
  }

  return user;
};


export const updateCurrentUser = async (userId, data) => {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error("Không tìm thấy tài khoản");
    }

    const normalizedEmail = data.email.toLowerCase();

    // Kiểm tra email đã được tài khoản khác sử dụng chưa
    const existingEmail = await User.findOne({
      where: {
        email: normalizedEmail,
        id: {
          [Op.ne]: userId,
        },
      },
    });

    if (existingEmail) {
      throw new Error("Email đã được sử dụng");
    }

    await user.update({
      fullName: data.fullName,
      email: normalizedEmail,
      phone: data.phone || null,
      birthday: data.birthday || null,
      gender: data.gender || null,
      address: data.address || null,
      occupation: data.occupation || null,
      bio: data.bio || null,
    });

    return getCurrentUser(userId);
  };


export const updateUserAvatar = async (userId, file) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new Error("Không tìm thấy tài khoản");
  }

  const uploadedImage = await uploadAvatarToCloudinary(file);

  await user.update({
      avatarUrl: uploadedImage.url,
    });

    return {
      avatarUrl: user.avatarUrl,
    };
  };
