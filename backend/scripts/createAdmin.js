const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const { User } = require("../src/models");

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL || "admin@pyqinsight.edu";
  const password = process.env.ADMIN_PASSWORD || "admin12345";
  const name = process.env.ADMIN_NAME || "System Administrator";

  if (!process.env.MONGO_URL) {
    console.error("MONGO_URL is required in environment");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URL);
  console.log("Connected to MongoDB");

  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = "admin";
    existing.passwordHash = await bcrypt.hash(password, 10);
    existing.name = name;
    await existing.save();
    console.log(`Admin user updated: ${email}`);
  } else {
    await User.create({
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role: "admin",
    });
    console.log(`Admin user created: ${email}`);
  }

  await mongoose.disconnect();
}

createAdmin().catch((err) => {
  console.error("Error creating admin:", err);
  process.exit(1);
});
