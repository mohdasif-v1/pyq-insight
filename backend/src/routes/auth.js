const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { registerSchema, loginSchema } = require("../validators");

const sign = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);
    if (await User.exists({ email })) return res.status(409).json({ error: "Email already registered" });
    // Hard rule: registration creates role "student" only
    const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 10), role: "student" });
    res.status(201).json({ token: sign(user), user: { id: user._id, name, role: user.role } });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return res.status(401).json({ error: "Invalid email or password" });
    res.json({ token: sign(user), user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
