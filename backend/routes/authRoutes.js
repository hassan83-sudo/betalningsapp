const express = require("express");
const router = express.Router();

const { register, login, logout, me } = require("../controllers/authController");
const { requireJwtAuth } = require("../middleware/demoAuth");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", requireJwtAuth, me);

module.exports = router;
