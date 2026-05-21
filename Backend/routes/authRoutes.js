const express = require("express");
const { register, verifyEmail, login, getMe, refresh, logout, logoutAll } = require("../controller/authController");

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/me", getMe);

router.post("/refresh", refresh);

router.post("/logout", logout);

router.post("/logout-all", logoutAll);

module.exports = router;
