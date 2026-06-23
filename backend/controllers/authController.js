const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { DEMO_AUTH_TOKEN, demoUser } = require("../middleware/demoAuth");

function toPublicUser(user) {
  return {
    id: user._id?.toString?.() || user.id,
    name: user.name || "Demoanvändare",
    email: user.email,
    personalNumber: user.personalNumber || "YYYYMMDD-XXXX",
    language: user.language || "sv",
    currency: user.currency || "SEK",
    createdAt: user.createdAt || new Date().toISOString(),
  };
}

exports.register = async (req, res) => {
  try {
    const { email, password, name, personalNumber, language, currency } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashed,
      name: name || "Demoanvändare",
      personalNumber: personalNumber || "YYYYMMDD-XXXX",
      language: language || "sv",
      currency: currency || "SEK",
    });

    await user.save();

    res.json({
      message: "User created",
      user: toPublicUser(user),
      userId: user._id
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Register failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, loginMethod } = req.body;

    if (loginMethod === "demo" || !email || !password) {
      return res.json({
        authMode: "demo",
        message: "Demo-inloggning aktiv",
        token: DEMO_AUTH_TOKEN,
        user: demoUser,
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(400).json({ error: "Wrong password" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "7d" }
    );

    res.json({
      authMode: "password",
      message: "Login success",
      token,
      user: toPublicUser(user),
      userId: user._id
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Login failed" });
  }
};

exports.logout = async (req, res) => {
  res.json({
    message: "Utloggad från demo-session",
  });
};

exports.me = async (req, res) => {
  res.json({
    authMode: "demo",
    user: req.user,
  });
};
