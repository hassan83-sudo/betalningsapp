const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

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
      userId: user._id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Register failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email och lösenord krävs" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Fel email eller lösenord" });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({ error: "Fel email eller lösenord" });
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      authMode: "password",
      message: "Login success",
      token,
      user: toPublicUser(user),
      userId: user._id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Login failed" });
  }
};

exports.logout = async (req, res) => {
  res.json({
    message: "Utloggad",
  });
};

exports.me = async (req, res) => {
  const user = await User.findById(req.auth?.userId);

  if (!user) {
    return res.status(401).json({ error: "Ogiltig inloggning" });
  }

  res.json({
    authMode: "password",
    user: toPublicUser(user),
  });
};
