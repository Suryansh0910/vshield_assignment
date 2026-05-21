const express = require("express");
const {
  verifyAadhaar,
  verifyPAN,
} = require("../controller/mockApiController");

const router = express.Router();

/**
 * POST /mock-api/aadhaar/verify
 * Mock Aadhaar verification endpoint
 * No authentication required for mock APIs
 */
router.post("/aadhaar/verify", verifyAadhaar);

/**
 * POST /mock-api/pan/verify
 * Mock PAN verification endpoint
 * No authentication required for mock APIs
 */
router.post("/pan/verify", verifyPAN);

module.exports = router;
