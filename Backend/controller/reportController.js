const prisma = require("../config/database");
const path = require("path");
const fs = require("fs");
const {
  generateReportHTML,
  generatePDF,
} = require("../services/reportService");

const generateReport = async (req, res, next) => {
  try {
    const { id } = req.params;

    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: { verificationLogs: true },
    });

    if (!candidate) {
      return res.status(404).json({ success: false, message: "Candidate not found" });
    }

    if (candidate.createdById !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    if (candidate.status === "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Cannot generate report before verification is complete.",
      });
    }

    const htmlContent = generateReportHTML(candidate, candidate.verificationLogs);
    const { pdfBuffer, reportUrl } = await generatePDF(htmlContent, candidate.id);

    
    await prisma.candidate.update({
      where: { id },
      data: { reportUrl },
    });

    if (reportUrl.startsWith("http")) {
      return res.json({ success: true, url: reportUrl });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="vshield_report_${candidate.fullName.replace(/\s+/g, "_")}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

const downloadReport = async (req, res, next) => {
  try {
    const { id } = req.params;

    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: { verificationLogs: true },
    });

    if (!candidate) {
      return res.status(404).json({ success: false, message: "Candidate not found" });
    }

    if (candidate.createdById !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    if (candidate.reportUrl) {
        if (candidate.reportUrl.startsWith("http")) {
            
            return res.json({ success: true, url: candidate.reportUrl });
        }
    }

    
    let pdfBuffer;
    if (candidate.reportUrl) {
      const filePath = path.join(__dirname, "../reports", path.basename(candidate.reportUrl));
      if (fs.existsSync(filePath)) {
        pdfBuffer = fs.readFileSync(filePath);
      }
    }

    if (!pdfBuffer) {
      if (candidate.status === "PENDING") {
        return res.status(400).json({
          success: false,
          message: "Report not generated yet. Run verification first.",
        });
      }
      
      const htmlContent = generateReportHTML(candidate, candidate.verificationLogs);
      const result = await generatePDF(htmlContent, candidate.id);
      
      if (result.reportUrl.startsWith("http")) {
          await prisma.candidate.update({ where: { id }, data: { reportUrl: result.reportUrl } });
          return res.json({ success: true, url: result.reportUrl });
      } else {
        pdfBuffer = result.pdfBuffer;
        await prisma.candidate.update({ where: { id }, data: { reportUrl: result.reportUrl } });
      }
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="vshield_report_${candidate.fullName.replace(/\s+/g, "_")}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

module.exports = { generateReport, downloadReport };
