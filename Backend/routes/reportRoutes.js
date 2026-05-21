const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  generateReport,
  downloadReport,
} = require("../controller/reportController");

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * POST /api/reports/:id/generate
 * Generate PDF report for a candidate
 */
router.post("/:id/generate", generateReport);

/**
 * GET /api/reports/:id/download
 * Download report for a candidate
 */
router.get("/:id/download", downloadReport);

module.exports = router;
