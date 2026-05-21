const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  generateReport,
  getReport,
  downloadReport,
} = require("../controller/reportController");

const router = express.Router();

router.use(authMiddleware);

/**
 * POST /api/reports/:id/generate
 * Generate PDF, upload to S3 if configured, stream PDF to client
 */
router.post("/:id/generate", generateReport);

/**
 * GET /api/reports/:id
 * Return stored reportUrl metadata (PDF Section 21)
 */
router.get("/:id", getReport);

/**
 * GET /api/reports/:id/download
 * Regenerate and stream PDF inline
 */
router.get("/:id/download", downloadReport);

module.exports = router;
