/**
 * Utility functions for masking and data transformation
 */

/**
 * Mask Aadhaar number - Shows only last 4 digits
 * Example: 123456789012 -> XXXX-XXXX-9012
 */
const maskAadhaar = (aadhaar) => {
  if (!aadhaar || aadhaar.length < 4) return "XXXX-XXXX-XXXX";
  return `XXXX-XXXX-${aadhaar.slice(-4)}`;
};

/**
 * Mask PAN number - Shows first 5 and last 1 character
 * Example: ABCDE1234F -> ABCDE****F
 */
const maskPAN = (pan) => {
  if (!pan || pan.length < 6) return "XXXX-XXXX-X";
  return `${pan.slice(0, 5)}****${pan.slice(-1)}`;
};

/**
 * Sanitize candidate object for API response
 * Masks sensitive data
 */
const sanitizeCandidateData = (candidate) => {
  return {
    ...candidate,
    aadhaarNumber: maskAadhaar(candidate.aadhaarNumber),
    panNumber: maskPAN(candidate.panNumber),
  };
};

module.exports = {
  maskAadhaar,
  maskPAN,
  sanitizeCandidateData,
};
