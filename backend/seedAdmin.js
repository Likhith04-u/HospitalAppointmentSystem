
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");

async function seedAdmin() {
  try {
    const email = String(process.env.ADMIN_EMAIL || "")
      .trim()
      .toLowerCase();
    const password = String(process.env.ADMIN_PASSWORD || "");
    const secret = String(process.env.JWT_SECRET || "");

    if (!email) throw new Error("ADMIN_EMAIL is missing in .env");
    if (password.length < 12) {
      throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
    }
    if (secret.length < 32) {
      throw new Error("JWT_SECRET must be at least 32 characters.");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const hashedPassword = await bcrypt.hash(password, 12);

    await Admin.findOneAndUpdate(
      { email },
      {
        $set: { password: hashedPassword, role: "admin" },
        $setOnInsert: { email },
      },
      { upsert: true, new: true, runValidators: true }
    );

    console.log("Admin account created/updated successfully.");
    console.log("Admin email:", email);
    console.log("Use the password configured in your .env file.");
  } catch (error) {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

seedAdmin();
