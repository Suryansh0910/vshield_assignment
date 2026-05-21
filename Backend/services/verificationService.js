const axios = require("axios");
const env = require("../config/env");


const verifyAadhaarNumber = async (aadhaarNumber) => {
  try {
    const response = await axios.post(env.AADHAAR_API_URL, {
      aadhaarNumber,
    });
    return response.data;
  } catch (error) {
    return {
      success: false,
      status: "FAILED",
      error: error.message,
    };
  }
};

const verifyPANNumber = async (panNumber) => {
  try {
    const response = await axios.post(env.PAN_API_URL, {
      panNumber,
    });
    return response.data;
  } catch (error) {
    return {
      success: false,
      status: "FAILED",
      error: error.message,
    };
  }
};

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
