
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import sequelize from "./src/config/database.js";
import { User } from "./src/models/index.js";

dotenv.config();

const rl = readline.createInterface({ input, output });

const createSeller = async () => {
  try {
    console.log("\n=== CRAFTUP - CREATE SELLER ===\n");

    const fullName = await rl.question("Ho ten: ");
    const username = await rl.question("Username: ");
    const email = await rl.question("Email: ");
    const password = await rl.question("Mat khau: ");

    if (!fullName.trim() || !username.trim() || !email.trim() || !password) {
      throw new Error("Vui long nhap day du thong tin");
    }

    if (password.length < 8 || password.length > 72) {
      throw new Error("Mat khau phai co tu 8 den 72 ky tu");
    }

    await sequelize.authenticate();

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      throw new Error("Email da duoc su dung");
    }

    const existingUsername = await User.findOne({
      where: {
        username: normalizedUsername,
      },
    });

    if (existingUsername) {
      throw new Error("Username da duoc su dung");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const seller = await User.create({
      fullName: fullName.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash,
      role: "SELLER",
    });

    console.log("\nTao tai khoan Seller thanh cong!");
    console.log({
      id: seller.id,
      fullName: seller.fullName,
      username: seller.username,
      email: seller.email,
      role: seller.role,
    });
  } catch (error) {
    console.error("\nKhong the tao Seller:", error.message);
  } finally {
    rl.close();
    await sequelize.close();
  }
};

createSeller();
