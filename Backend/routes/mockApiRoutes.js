const express = require("express");
const {
  verifyAadhaar,
  verifyPAN,
} = require("../controller/mockApiController");

const router = express.Router();

router.post("/aadhaar/verify", verifyAadhaar);

router.post("/pan/verify", verifyPAN);

module.exports = router;
