
const verifyAadhaar = async (req, res, next) => {
  try {
    const { aadhaarNumber } = req.body;

    if (!aadhaarNumber) {
      return res.status(400).json({
        success: false,
        message: "Aadhaar number is required",
      });
    }

    
    const lastDigit = parseInt(aadhaarNumber.slice(-1));
    const status = lastDigit % 2 === 0 ? "VERIFIED" : "FAILED";

    res.status(200).json({
      success: true,
      status,
      message: `Aadhaar verification ${status}`,
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

const verifyPAN = async (req, res, next) => {
  try {
    const { panNumber } = req.body;

    if (!panNumber) {
      return res.status(400).json({
        success: false,
        message: "PAN number is required",
      });
    }

    
    const firstChar = panNumber.charAt(0);
    const vowels = ["A", "E", "I", "O", "U"];
    const status = vowels.includes(firstChar) ? "VERIFIED" : "FAILED";

    res.status(200).json({
      success: true,
      status,
      message: `PAN verification ${status}`,
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
