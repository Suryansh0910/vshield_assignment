
const maskAadhaar = (aadhaar) => {
  if (!aadhaar || aadhaar.length < 4) return "XXXX-XXXX-XXXX";
  return `XXXX-XXXX-${aadhaar.slice(-4)}`;
};

const maskPAN = (pan) => {
  if (!pan || pan.length < 6) return "XXXX-XXXX-X";
  return `${pan.slice(0, 5)}****${pan.slice(-1)}`;
};

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
