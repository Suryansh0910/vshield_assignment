/**
 * Verification Service - Contains business logic for verification
 */

/**
 * Mock Aadhaar verification logic (even last digit = VERIFIED)
 */
const verifyAadhaarNumber = async (aadhaarNumber) => {
  if (!aadhaarNumber) {
    return { success: false, status: "FAILED", error: "Aadhaar number is required" };
  }
  const lastDigit = parseInt(aadhaarNumber.slice(-1));
  const status = lastDigit % 2 === 0 ? "VERIFIED" : "FAILED";
  return {
    success: true,
    status,
    message: `Aadhaar verification ${status}`,
    data: { aadhaarNumber, verifiedAt: new Date().toISOString(), verificationType: "AADHAAR" },
  };
};

/**
 * Mock PAN verification logic (vowel first char = VERIFIED)
 */
const verifyPANNumber = async (panNumber) => {
  if (!panNumber) {
    return { success: false, status: "FAILED", error: "PAN number is required" };
  }
  const firstChar = panNumber.charAt(0).toUpperCase();
  const status = ["A", "E", "I", "O", "U"].includes(firstChar) ? "VERIFIED" : "FAILED";
  return {
    success: true,
    status,
    message: `PAN verification ${status}`,
    data: { panNumber, verifiedAt: new Date().toISOString(), verificationType: "PAN" },
  };
};

/**
 * Calculate overall verification status
 */
const calculateOverallStatus = (aadhaarStatus, panStatus) => {
  if (aadhaarStatus === "VERIFIED" && panStatus === "VERIFIED") {
    return "VERIFIED";
  }
  if (aadhaarStatus === "VERIFIED" || panStatus === "VERIFIED") {
    return "PARTIAL";
  }
  return "FAILED";
};

module.exports = {
  verifyAadhaarNumber,
  verifyPANNumber,
  calculateOverallStatus,
};
