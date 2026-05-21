const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  generateReport,
  downloadReport,
} = require("../controller/reportController");

const router = express.Router();


router.use(authMiddleware);

router.post("/:id/generate", generateReport);

router.get("/:id/download", downloadReport);

module.exports = router;
