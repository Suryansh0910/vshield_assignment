const prisma = require("../config/database");
const env = require("../config/env");
const { sanitizeCandidateData } = require("../utils/helpers");
const {
  verifyAadhaarNumber,
  verifyPANNumber,
  calculateOverallStatus,
} = require("../services/verificationService");

/**
 * Start verification for a candidate
 * POST /api/verifications/:id/start
 */
const startVerification = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if candidate exists and user owns it
    const candidate = await prisma.candidate.findUnique({ where: { id } });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    if (candidate.createdById !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Prevent duplicate verification abuse
    if (candidate.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: `Candidate verification has already been processed. Current status: ${candidate.status}`,
      });
    }

    // Call mock Aadhaar API using verification service
    const aadhaarResult = await verifyAadhaarNumber(candidate.aadhaarNumber);
    const aadhaarStatus = aadhaarResult.status || "FAILED";

    // Call mock PAN API using verification service
    const panResult = await verifyPANNumber(candidate.panNumber);
    const panStatus = panResult.status || "FAILED";

    // Store verification logs
    await prisma.verificationLog.create({
      data: {
        candidateId: id,
        verificationType: "AADHAAR",
        requestPayload: { aadhaarNumber: candidate.aadhaarNumber },
        responsePayload: aadhaarResult,
        verificationStatus: aadhaarStatus,
      },
    });

    await prisma.verificationLog.create({
      data: {
        candidateId: id,
        verificationType: "PAN",
        requestPayload: { panNumber: candidate.panNumber },
        responsePayload: panResult,
        verificationStatus: panStatus,
      },
    });

    // Calculate overall status
    const overallStatus = calculateOverallStatus(aadhaarStatus, panStatus);

    // Update candidate status
    const updatedCandidate = await prisma.candidate.update({
      where: { id },
      data: { status: overallStatus },
      include: {
        verificationLogs: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Verification completed",
      data: {
        candidate: sanitizeCandidateData(updatedCandidate),
        verification: {
          aadhaar: {
            status: aadhaarStatus,
            response: aadhaarResult,
          },
          pan: {
            status: panStatus,
            response: panResult,
          },
          overallStatus,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get verification logs for a candidate
 * GET /api/verifications/:id/logs
 */
const getVerificationLogs = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if candidate exists and user owns it
    const candidate = await prisma.candidate.findUnique({ where: { id } });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    if (candidate.createdById !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Get verification logs
    const logs = await prisma.verificationLog.findMany({
      where: { candidateId: id },
      orderBy: { verifiedAt: "desc" },
    });

    res.status(200).json({
      success: true,
      message: "Verification logs retrieved successfully",
      data: { logs },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startVerification,
  getVerificationLogs,
};
