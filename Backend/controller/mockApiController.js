/**
 * Mock API Controllers for Aadhaar and PAN verification
 * These are mock APIs for demonstration purposes
 */

/**
 * Mock Aadhaar Verification
 * POST /mock-api/aadhaar/verify
 */
const verifyAadhaar = async (req, res, next) => {
  try {
    const { aadhaarNumber } = req.body;

    if (!aadhaarNumber) {
      return res.status(400).json({
        success: false,
        message: "Aadhaar number is required",
      });
    }

    if (!/^\d{12}$/.test(aadhaarNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Aadhaar number. Must be exactly 12 numeric digits.",
      });
    }

    // Mock logic: Even numbers pass, odd numbers fail
    const lastDigit = parseInt(aadhaarNumber.slice(-1));
    const status = lastDigit % 2 === 0 ? "VERIFIED" : "FAILED";

    res.status(200).json({
      success: true,
      status,
      nameMatch: status === "VERIFIED",
      dobMatch: status === "VERIFIED",
      message: `Aadhaar verification ${status === "VERIFIED" ? "successful" : "failed"}`,
      data: {
        aadhaarNumber,
        verifiedAt: new Date().toISOString(),
        verificationType: "AADHAAR",
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mock PAN Verification
 * POST /mock-api/pan/verify
 */
const verifyPAN = async (req, res, next) => {
  try {
    const { panNumber } = req.body;

    if (!panNumber) {
      return res.status(400).json({
        success: false,
        message: "PAN number is required",
      });
    }

    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid PAN number. Format must be ABCDE1234F (5 letters, 4 digits, 1 letter).",
      });
    }

    // Mock logic: PANs starting with vowels pass, consonants fail
    const firstChar = panNumber.charAt(0);
    const vowels = ["A", "E", "I", "O", "U"];
    const status = vowels.includes(firstChar) ? "VERIFIED" : "FAILED";

    res.status(200).json({
      success: true,
      status,
      panStatus: status === "VERIFIED" ? "active" : "inactive",
      message: `PAN verification ${status === "VERIFIED" ? "successful" : "failed"}`,
      data: {
        panNumber,
        verifiedAt: new Date().toISOString(),
        verificationType: "PAN",
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyAadhaar,
  verifyPAN,
};
