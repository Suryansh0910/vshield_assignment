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
    let pdfBuffer;
    try {
      pdfBuffer = await generatePDF(htmlContent);
    } catch (pdfError) {
      console.error("PDF Generation failed:", pdfError);
      return res.status(500).json({
        success: false,
        message: "Failed to generate PDF report",
        error: pdfError.message,
      });
    }

    // Save PDF URL in database (mock)
    const reportUrl = `/reports/${id}.pdf`;
    await prisma.candidate.update({
      where: { id },
      data: { reportUrl },
    });

    // Send PDF as response with proper headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", pdfBuffer.length);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="verification_report_${candidate.fullName}.pdf"`
    );
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
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
    let pdfBuffer;
    try {
      pdfBuffer = await generatePDF(htmlContent);
    } catch (pdfError) {
      console.error("PDF Generation failed:", pdfError);
      return res.status(500).json({
        success: false,
        message: "Failed to generate PDF report",
        error: pdfError.message,
      });
    }

    // Send PDF as response with proper headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", pdfBuffer.length);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="verification_report_${candidate.fullName}.pdf"`
    );
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateReport,
  downloadReport,
};
