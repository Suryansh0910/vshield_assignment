const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  startVerification,
  getVerificationLogs,
} = require("../controller/verificationController");

const router = express.Router();


router.use(authMiddleware);

router.post("/:id/start", startVerification);

router.get("/:id/logs", getVerificationLogs);

module.exports = router;
