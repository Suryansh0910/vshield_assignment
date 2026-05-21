const express = require("express");
const { register, login, getMe, refresh, logout, logoutAll } = require("../controller/authController");

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post("/register", register);

/**
 * POST /api/auth/login
 * Login user
 */
router.post("/login", login);

/**
 * GET /api/auth/me
 * Get current authenticated user details
 */
router.get("/me", getMe);

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post("/refresh", refresh);

/**
 * POST /api/auth/logout
 * Logout user from current device
 */
router.post("/logout", logout);

/**
 * POST /api/auth/logout-all
 * Logout user from all devices
 */
router.post("/logout-all", logoutAll);

module.exports = router;
