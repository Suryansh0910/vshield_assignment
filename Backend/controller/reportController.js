const prisma = require("../config/database");
const {
  generateReportHTML,
  generatePDF,
} = require("../services/reportService");

/**
 * Generate report PDF for a candidate
 * POST /api/reports/:id/generate
 */
const generateReport = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if candidate exists and user owns it
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        verificationLogs: true,
      },
    });

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

    // Generate HTML
    const htmlContent = generateReportHTML(candidate, candidate.verificationLogs);

    // Generate PDF
    const pdfBuffer = await generatePDF(htmlContent);

    // TODO: Upload to S3/Cloudinary and store URL in database
    // For now, we'll save it locally or send it directly

    // Save PDF URL in database (mock)
    const reportUrl = `/reports/${id}.pdf`;
    await prisma.candidate.update({
      where: { id },
      data: { reportUrl },
    });

    // Send PDF as response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="verification_report_${candidate.fullName}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

/**
 * Download report for a candidate
 * GET /api/reports/:id/download
 */
const downloadReport = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if candidate exists and user owns it
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        verificationLogs: true,
      },
    });

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

    if (!candidate.reportUrl) {
      return res.status(404).json({
        success: false,
        message: "Report not generated yet",
      });
    }

    // Generate HTML
    const htmlContent = generateReportHTML(candidate, candidate.verificationLogs);

    // Generate PDF
    const pdfBuffer = await generatePDF(htmlContent);

    // Send PDF as response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="verification_report_${candidate.fullName}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateReport,
  downloadReport,
};
