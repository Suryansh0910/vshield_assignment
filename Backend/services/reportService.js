const PDFDocument = require("pdfkit");
const { maskAadhaar, maskPAN } = require("../utils/helpers");

/**
 * Report Generation Service
 */

/**
 * Generate HTML report template
 */
const generateReportHTML = (candidate, verificationLogs) => {
  // Get latest verification statuses (sorting by verifiedAt descending)
  const sortedLogs = [...verificationLogs].sort(
    (a, b) => new Date(b.verifiedAt) - new Date(a.verifiedAt)
  );

  const aadhaarLog = sortedLogs.find((log) => log.verificationType === "AADHAAR");
  const panLog = sortedLogs.find((log) => log.verificationType === "PAN");

  const aadhaarStatus = aadhaarLog?.verificationStatus || "PENDING";
  const panStatus = panLog?.verificationStatus || "PENDING";

  const getStatusColor = (status) => {
    switch (status) {
      case "VERIFIED":
        return "#10b981";
      case "PARTIAL":
        return "#f59e0b";
      case "FAILED":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background: #f5f5f5;
        }
        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px;
          background: white;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #1e40af;
          padding-bottom: 20px;
          margin-bottom: 40px;
        }
        .header h1 {
          font-size: 32px;
          color: #1e40af;
          margin-bottom: 5px;
        }
        .header p {
          color: #666;
          font-size: 14px;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 16px;
          font-weight: 700;
          color: #1e40af;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        .info-row {
          display: grid;
          grid-template-columns: 200px 1fr;
          margin-bottom: 12px;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .info-label {
          font-weight: 600;
          color: #4b5563;
          font-size: 13px;
        }
        .info-value {
          color: #333;
          font-size: 13px;
        }
        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 12px;
          color: white;
        }
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #999;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>BACKGROUND VERIFICATION REPORT</h1>
          <p>Confidential - For Internal Use Only</p>
        </div>

        <div class="section">
          <div class="section-title">Candidate Information</div>
          <div class="info-row">
            <div class="info-label">Full Name</div>
            <div class="info-value">${candidate.fullName}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Email</div>
            <div class="info-value">${candidate.email}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Phone</div>
            <div class="info-value">${candidate.phone}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Date of Birth</div>
            <div class="info-value">${new Date(candidate.dob).toLocaleDateString()}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Address</div>
            <div class="info-value">${candidate.address}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Verification Details</div>
          <div class="info-row">
            <div class="info-label">Aadhaar Verification</div>
            <div class="info-value">
              <span class="status-badge" style="background-color: ${getStatusColor(aadhaarStatus)}">
                ${aadhaarStatus}
              </span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-label">PAN Verification</div>
            <div class="info-value">
              <span class="status-badge" style="background-color: ${getStatusColor(panStatus)}">
                ${panStatus}
              </span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-label">Overall Status</div>
            <div class="info-value">
              <span class="status-badge" style="background-color: ${getStatusColor(candidate.status)}">
                ${candidate.status}
              </span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Report Metadata</div>
          <div class="info-row">
            <div class="info-label">Generated On</div>
            <div class="info-value">${new Date().toLocaleString()}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Report ID</div>
            <div class="info-value">${candidate.id}</div>
          </div>
        </div>

        <div class="footer">
          <p>This is an automatically generated report. Any discrepancies should be reported immediately.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate PDF from candidate data using PDFKit (no browser/Chromium needed)
 */
const generatePDF = (candidate, verificationLogs) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const sortedLogs = [...verificationLogs].sort(
        (a, b) => new Date(b.verifiedAt) - new Date(a.verifiedAt)
      );
      const aadhaarLog = sortedLogs.find((l) => l.verificationType === "AADHAAR");
      const panLog = sortedLogs.find((l) => l.verificationType === "PAN");
      const aadhaarStatus = aadhaarLog?.verificationStatus || "PENDING";
      const panStatus = panLog?.verificationStatus || "PENDING";

      const STATUS_COLORS = {
        VERIFIED: "#10b981",
        PARTIAL:  "#f59e0b",
        FAILED:   "#ef4444",
        PENDING:  "#6b7280",
      };

      const pageWidth = doc.page.width - 100; // account for margins

      // ── Header ──
      doc.rect(0, 0, doc.page.width, 80).fill("#1e40af");
      doc.fillColor("#ffffff").fontSize(22).font("Helvetica-Bold")
        .text("BACKGROUND VERIFICATION REPORT", 50, 25, { align: "center", width: pageWidth });
      doc.fontSize(10).font("Helvetica")
        .text("Confidential – For Internal Use Only", 50, 52, { align: "center", width: pageWidth });

      doc.fillColor("#333333");
      let y = 110;

      const drawSection = (title) => {
        doc.fontSize(13).font("Helvetica-Bold").fillColor("#1e40af")
          .text(title, 50, y);
        y += 18;
        doc.moveTo(50, y).lineTo(50 + pageWidth, y).strokeColor("#e5e7eb").lineWidth(1).stroke();
        y += 10;
        doc.fillColor("#333333");
      };

      const drawRow = (label, value, isStatus = false, statusColor = null) => {
        doc.fontSize(11).font("Helvetica-Bold").fillColor("#4b5563")
          .text(label, 50, y, { width: 180 });
        if (isStatus && statusColor) {
          doc.roundedRect(238, y - 3, 80, 18, 3).fill(statusColor);
          doc.fontSize(10).font("Helvetica-Bold").fillColor("#ffffff")
            .text(value, 238, y + 1, { width: 80, align: "center" });
          doc.fillColor("#333333");
        } else {
          doc.fontSize(11).font("Helvetica").fillColor("#333333")
            .text(String(value), 238, y, { width: pageWidth - 188 });
        }
        y += 28;
        doc.moveTo(50, y - 6).lineTo(50 + pageWidth, y - 6).strokeColor("#f0f0f0").lineWidth(0.5).stroke();
      };

      // ── Candidate Information ──
      drawSection("Candidate Information");
      drawRow("Full Name", candidate.fullName);
      drawRow("Email", candidate.email);
      drawRow("Phone", candidate.phone);
      drawRow("Date of Birth", new Date(candidate.dob).toLocaleDateString());
      drawRow("Address", candidate.address);

      y += 10;
      drawSection("Verification Details");
      drawRow("Aadhaar Verification", aadhaarStatus, true, STATUS_COLORS[aadhaarStatus]);
      drawRow("PAN Verification", panStatus, true, STATUS_COLORS[panStatus]);
      drawRow("Overall Status", candidate.status, true, STATUS_COLORS[candidate.status]);

      y += 10;
      drawSection("Report Metadata");
      drawRow("Generated On", new Date().toLocaleString());
      drawRow("Report ID", candidate.id);

      // ── Footer ──
      doc.fontSize(9).font("Helvetica").fillColor("#999999")
        .text(
          "This is an automatically generated report. Any discrepancies should be reported immediately.",
          50, doc.page.height - 50, { align: "center", width: pageWidth }
        );

      doc.end();
    } catch (error) {
      reject(new Error(`Failed to generate PDF: ${error.message}`));
    }
  });
};

module.exports = {
  generatePDF,
};
