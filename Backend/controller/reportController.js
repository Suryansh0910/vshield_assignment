const prisma = require("../config/database");
const { generatePDF } = require("../services/reportService");
const { uploadToS3, s3Client } = require("../utils/aws");

const fetchCandidate = async (id) =>
  prisma.candidate.findUnique({
    where: { id },
    include: {
      verificationLogs: true,
      createdBy: { select: { name: true, email: true } },
    },
  });

const ownershipGuard = (candidate, userId, res) => {
  if (!candidate) {
    res.status(404).json({ success: false, message: "Candidate not found" });
    return false;
  }
  if (candidate.createdById !== userId) {
    res.status(403).json({ success: false, message: "Unauthorized access" });
    return false;
  }
  return true;
};

const buildPDF = async (candidate, res) => {
  try {
    return await generatePDF(candidate, candidate.verificationLogs, candidate.createdBy);
  } catch (pdfError) {
    console.error("PDF Generation failed:", pdfError);
    res.status(500).json({
      success: false,
      message: "Failed to generate PDF report",
      error: pdfError.message,
    });
    return null;
  }
};

const streamPDF = (res, pdfBuffer, fileName) => {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Length", pdfBuffer.length);
  res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.send(pdfBuffer);
};

/**
 * Generate report — uploads to S3 if configured, otherwise serves inline
 * POST /api/reports/:id/generate
 */
const generateReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const candidate = await fetchCandidate(id);
    if (!ownershipGuard(candidate, req.user.id, res)) return;

    const pdfBuffer = await buildPDF(candidate, res);
    if (!pdfBuffer) return;

    let reportUrl;

    if (s3Client) {
      try {
        const fileName = `reports/report_${id}_${Date.now()}.pdf`;
        reportUrl = await uploadToS3(pdfBuffer, fileName, "application/pdf");
      } catch (s3Error) {
        console.error("S3 upload failed, falling back to local URL:", s3Error.message);
        reportUrl = `/reports/${id}.pdf`;
      }
    } else {
      reportUrl = `/reports/${id}.pdf`;
    }

    await prisma.candidate.update({ where: { id }, data: { reportUrl } });

    streamPDF(res, pdfBuffer, `verification_report_${candidate.fullName}.pdf`);
  } catch (error) {
    next(error);
  }
};

/**
 * Get report metadata (reportUrl) for a candidate
 * GET /api/reports/:id
 */
const getReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const candidate = await fetchCandidate(id);
    if (!ownershipGuard(candidate, req.user.id, res)) return;

    if (!candidate.reportUrl) {
      return res.status(404).json({
        success: false,
        message: "Report not generated yet. Call POST /api/reports/:id/generate first.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Report info retrieved",
      data: {
        candidateId: id,
        candidateName: candidate.fullName,
        reportUrl: candidate.reportUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Download report PDF — regenerates on the fly
 * GET /api/reports/:id/download
 */
const downloadReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const candidate = await fetchCandidate(id);
    if (!ownershipGuard(candidate, req.user.id, res)) return;

    if (!candidate.reportUrl) {
      return res.status(404).json({
        success: false,
        message: "Report not generated yet. Call POST /api/reports/:id/generate first.",
      });
    }

    const pdfBuffer = await buildPDF(candidate, res);
    if (!pdfBuffer) return;

    streamPDF(res, pdfBuffer, `verification_report_${candidate.fullName}.pdf`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateReport,
  getReport,
  downloadReport,
};
