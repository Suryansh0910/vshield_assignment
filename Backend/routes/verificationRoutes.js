const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  startVerification,
  getVerificationLogs,
} = require("../controller/verificationController");

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * POST /api/verifications/:id/start
 * Start verification for a candidate
 */
router.post("/:id/start", startVerification);

/**
 * GET /api/verifications/:id/logs
 * Get verification logs for a candidate
 */
router.get("/:id/logs", getVerificationLogs);

module.exports = router;
