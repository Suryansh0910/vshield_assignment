const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");
const { maskAadhaar, maskPAN } = require("../utils/helpers");



const REPORTS_DIR = path.join(__dirname, "../reports");
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

const generateReportHTML = (candidate, verificationLogs) => {
  const sortedLogs = [...verificationLogs].sort(
    (a, b) => new Date(b.verifiedAt) - new Date(a.verifiedAt)
  );

  const aadhaarLog = sortedLogs.find((log) => log.verificationType === "AADHAAR");
  const panLog = sortedLogs.find((log) => log.verificationType === "PAN");

  const aadhaarStatus = aadhaarLog?.verificationStatus || "PENDING";
  const panStatus = panLog?.verificationStatus || "PENDING";

  const getStatusColor = (status) => {
    switch (status) {
      case "VERIFIED": return "#10b981";
      case "PARTIAL":  return "#f59e0b";
      case "FAILED":   return "#ef4444";
      default:         return "#6b7280";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "VERIFIED": return "✓ VERIFIED";
      case "PARTIAL":  return "⚠ PARTIAL";
      case "FAILED":   return "✗ FAILED";
      default:         return "● PENDING";
    }
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1a1a1a; background: #f8f9fa; }
        .container { max-width: 860px; margin: 0 auto; padding: 48px; background: white; min-height: 100vh; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1e40af; padding-bottom: 24px; margin-bottom: 40px; }
        .header-left h1 { font-size: 22px; color: #1e40af; letter-spacing: 0.05em; font-weight: 700; }
        .header-left p { color: #6b7280; font-size: 13px; margin-top: 4px; }
        .header-right { text-align: right; }
        .report-id { font-size: 12px; color: #9ca3af; font-family: monospace; }
        .overall-badge { margin-top: 8px; display: inline-block; padding: 6px 16px; border-radius: 4px; font-size: 13px; font-weight: 700; color: white; letter-spacing: 0.05em; }
        .section { margin-bottom: 36px; }
        .section-title { font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 20px; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .info-item { padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
        .info-item:last-child { border-bottom: none; }
        .info-label { font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 3px; }
        .info-value { font-size: 14px; color: #1a1a1a; }
        .check-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; }
        .check-title { font-size: 12px; font-weight: 600; color: #4b5563; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
        .check-status { font-size: 18px; font-weight: 700; }
        .check-detail { font-size: 12px; color: #6b7280; margin-top: 4px; }
        .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
        .footer p { font-size: 11px; color: #9ca3af; }
        .signature-box { border: 1px dashed #d1d5db; border-radius: 6px; padding: 16px 32px; text-align: center; }
        .signature-label { font-size: 11px; color: #9ca3af; margin-top: 8px; }
        .watermark { position: fixed; bottom: 40px; right: 40px; opacity: 0.04; font-size: 72px; font-weight: 900; color: #1e40af; transform: rotate(-30deg); pointer-events: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="header-left">
            <h1>BACKGROUND VERIFICATION REPORT</h1>
            <p>Confidential — For Internal Use Only</p>
          </div>
          <div class="header-right">
            <div class="report-id">Report ID: ${candidate.id.slice(0, 8).toUpperCase()}</div>
            <div class="overall-badge" style="background-color: ${getStatusColor(candidate.status)}">
              ${getStatusLabel(candidate.status)}
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Candidate Information</div>
          <div class="grid-2">
            <div>
              <div class="info-item"><div class="info-label">Full Name</div><div class="info-value">${candidate.fullName}</div></div>
              <div class="info-item"><div class="info-label">Email Address</div><div class="info-value">${candidate.email}</div></div>
              <div class="info-item"><div class="info-label">Phone Number</div><div class="info-value">+91 ${candidate.phone}</div></div>
            </div>
            <div>
              <div class="info-item"><div class="info-label">Date of Birth</div><div class="info-value">${new Date(candidate.dob).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</div></div>
              <div class="info-item"><div class="info-label">Address</div><div class="info-value">${candidate.address}</div></div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Identity Verification Checks</div>
          <div class="grid-2">
            <div class="check-card">
              <div class="check-title">Aadhaar Verification</div>
              <div class="check-status" style="color: ${getStatusColor(aadhaarStatus)}">${getStatusLabel(aadhaarStatus)}</div>
              <div class="check-detail">Aadhaar: ${maskAadhaar(candidate.aadhaarNumber)}</div>
              ${aadhaarLog ? `<div class="check-detail">Checked: ${new Date(aadhaarLog.verifiedAt).toLocaleString("en-IN")}</div>` : ""}
            </div>
            <div class="check-card">
              <div class="check-title">PAN Verification</div>
              <div class="check-status" style="color: ${getStatusColor(panStatus)}">${getStatusLabel(panStatus)}</div>
              <div class="check-detail">PAN: ${maskPAN(candidate.panNumber)}</div>
              ${panLog ? `<div class="check-detail">Checked: ${new Date(panLog.verifiedAt).toLocaleString("en-IN")}</div>` : ""}
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Report Metadata</div>
          <div class="grid-2">
            <div>
              <div class="info-item"><div class="info-label">Generated On</div><div class="info-value">${new Date().toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" })}</div></div>
              <div class="info-item"><div class="info-label">Overall Status</div><div class="info-value" style="font-weight: 700; color: ${getStatusColor(candidate.status)}">${candidate.status}</div></div>
            </div>
            <div>
              <div class="info-item"><div class="info-label">Verification Engine</div><div class="info-value">vShield BGV Platform v1.0</div></div>
              <div class="info-item"><div class="info-label">Candidate ID</div><div class="info-value" style="font-family: monospace; font-size: 12px;">${candidate.id}</div></div>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>This is a system-generated report. Any discrepancies should be reported to compliance@vshield.io</p>
          <div class="signature-box">
            <div style="height: 32px;"></div>
            <div class="signature-label">Authorized Signatory</div>
          </div>
        </div>

        <div class="watermark">vShield</div>
      </div>
    </body>
    </html>
  `;
};

const getStatusColor = (status) => {
  switch (status) {
    case "VERIFIED": return "#10b981";
    case "PARTIAL":  return "#f59e0b";
    case "FAILED":   return "#ef4444";
    default:         return "#6b7280";
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case "VERIFIED": return "VERIFIED";
    case "PARTIAL":  return "PARTIAL";
    case "FAILED":   return "FAILED";
    default:         return "PENDING";
  }
};

const generatePDF = async (candidate, verificationLogs) => {
  const pdfBuffer = await new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 40, bottom: 40, left: 40, right: 40 }
    });

    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    // Watermark
    doc.save()
       .fillColor("#e5e7eb")
       .opacity(0.15)
       .fontSize(80)
       .rotate(-30, { origin: [300, 420] })
       .text("vShield", 150, 400, { align: "center" })
       .restore();

    // Header
    doc.fillColor("#1e40af")
       .fontSize(20)
       .font("Helvetica-Bold")
       .text("BACKGROUND VERIFICATION REPORT", 40, 40);

    doc.fillColor("#6b7280")
       .fontSize(10)
       .font("Helvetica")
       .text("Confidential — For Internal Use Only", 40, 65);

    const reportIdStr = `Report ID: ${candidate.id.slice(0, 8).toUpperCase()}`;
    doc.fillColor("#9ca3af")
       .fontSize(10)
       .font("Courier")
       .text(reportIdStr, 400, 40, { align: "right" });

    const statusLabel = getStatusLabel(candidate.status);
    const statusColor = getStatusColor(candidate.status);

    doc.save()
       .fillColor(statusColor)
       .roundedRect(440, 58, 115, 22, 4)
       .fill()
       .restore();

    doc.fillColor("#ffffff")
       .fontSize(9)
       .font("Helvetica-Bold")
       .text(statusLabel, 440, 65, { width: 115, align: "center" });

    doc.strokeColor("#1e40af")
       .lineWidth(3)
       .moveTo(40, 95)
       .lineTo(555, 95)
       .stroke();

    // Candidate Info Section
    let y = 120;
    doc.fillColor("#6b7280")
       .fontSize(10)
       .font("Helvetica-Bold")
       .text("CANDIDATE INFORMATION", 40, y);

    doc.strokeColor("#e5e7eb")
       .lineWidth(1)
       .moveTo(40, y + 15)
       .lineTo(555, y + 15)
       .stroke();

    y += 25;

    const drawGridItem = (label, value, x, y, width) => {
      doc.fillColor("#9ca3af")
         .fontSize(8)
         .font("Helvetica-Bold")
         .text(label.toUpperCase(), x, y);
      doc.fillColor("#111827")
         .fontSize(10)
         .font("Helvetica")
         .text(value || "N/A", x, y + 12, { width: width });
    };

    drawGridItem("Full Name", candidate.fullName, 40, y, 240);
    drawGridItem("Date of Birth", new Date(candidate.dob).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }), 300, y, 240);

    y += 35;
    drawGridItem("Email Address", candidate.email, 40, y, 240);
    drawGridItem("Phone Number", `+91 ${candidate.phone}`, 300, y, 240);

    y += 35;
    drawGridItem("Address", candidate.address, 40, y, 500);

    y += 55;

    // Verification Checks Section
    doc.fillColor("#6b7280")
       .fontSize(10)
       .font("Helvetica-Bold")
       .text("IDENTITY VERIFICATION CHECKS", 40, y);

    doc.strokeColor("#e5e7eb")
       .lineWidth(1)
       .moveTo(40, y + 15)
       .lineTo(555, y + 15)
       .stroke();

    y += 25;

    const sortedLogs = [...verificationLogs].sort(
      (a, b) => new Date(b.verifiedAt) - new Date(a.verifiedAt)
    );

    const aadhaarLog = sortedLogs.find((log) => log.verificationType === "AADHAAR");
    const panLog = sortedLogs.find((log) => log.verificationType === "PAN");

    const aadhaarStatus = aadhaarLog?.verificationStatus || "PENDING";
    const panStatus = panLog?.verificationStatus || "PENDING";

    // Aadhaar box
    doc.save()
       .strokeColor("#e5e7eb")
       .lineWidth(1)
       .roundedRect(40, y, 245, 95, 6)
       .stroke()
       .restore();

    doc.fillColor("#4b5563")
       .fontSize(10)
       .font("Helvetica-Bold")
       .text("AADHAAR VERIFICATION", 55, y + 15);

    doc.fillColor(getStatusColor(aadhaarStatus))
       .fontSize(12)
       .font("Helvetica-Bold")
       .text(getStatusLabel(aadhaarStatus), 55, y + 30);

    doc.fillColor("#6b7280")
       .fontSize(9)
       .font("Helvetica")
       .text(`Aadhaar: ${maskAadhaar(candidate.aadhaarNumber)}`, 55, y + 50);

    if (aadhaarLog) {
      doc.text(`Checked: ${new Date(aadhaarLog.verifiedAt).toLocaleString("en-IN")}`, 55, y + 65, { width: 220 });
    }

    // PAN box
    doc.save()
       .strokeColor("#e5e7eb")
       .lineWidth(1)
       .roundedRect(305, y, 250, 95, 6)
       .stroke()
       .restore();

    doc.fillColor("#4b5563")
       .fontSize(10)
       .font("Helvetica-Bold")
       .text("PAN VERIFICATION", 320, y + 15);

    doc.fillColor(getStatusColor(panStatus))
       .fontSize(12)
       .font("Helvetica-Bold")
       .text(getStatusLabel(panStatus), 320, y + 30);

    doc.fillColor("#6b7280")
       .fontSize(9)
       .font("Helvetica")
       .text(`PAN: ${maskPAN(candidate.panNumber)}`, 320, y + 50);

    if (panLog) {
      doc.text(`Checked: ${new Date(panLog.verifiedAt).toLocaleString("en-IN")}`, 320, y + 65, { width: 220 });
    }

    y += 115;

    // Report Metadata Section
    doc.fillColor("#6b7280")
       .fontSize(10)
       .font("Helvetica-Bold")
       .text("REPORT METADATA", 40, y);

    doc.strokeColor("#e5e7eb")
       .lineWidth(1)
       .moveTo(40, y + 15)
       .lineTo(555, y + 15)
       .stroke();

    y += 25;

    drawGridItem("Generated On", new Date().toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" }), 40, y, 240);
    drawGridItem("Verification Engine", "vShield BGV Platform v1.0", 300, y, 240);

    y += 35;
    drawGridItem("Overall Status", candidate.status, 40, y, 240);
    doc.fillColor(getStatusColor(candidate.status))
       .fontSize(10)
       .font("Helvetica-Bold")
       .text(candidate.status, 40, y + 12);

    drawGridItem("Candidate ID", candidate.id, 300, y, 240);
    doc.fillColor("#111827")
       .fontSize(8)
       .font("Courier")
       .text(candidate.id, 300, y + 12);

    // Footer
    const footerY = 720;
    doc.strokeColor("#e5e7eb")
       .lineWidth(1)
       .moveTo(40, footerY)
       .lineTo(555, footerY)
       .stroke();

    doc.fillColor("#9ca3af")
       .fontSize(8)
       .font("Helvetica")
       .text("This is a system-generated report. Any discrepancies should be reported to compliance@vshield.io", 40, footerY + 15, { width: 320 });

    doc.save()
       .strokeColor("#d1d5db")
       .lineWidth(1)
       .dash(4, { space: 2 })
       .roundedRect(385, footerY + 10, 170, 50, 4)
       .stroke()
       .restore();

    doc.fillColor("#9ca3af")
       .fontSize(8)
       .font("Helvetica")
       .text("Authorized Signatory", 385, footerY + 48, { width: 170, align: "center" });

    doc.end();
  });

  const fileName = `report_${candidate.id}_${Date.now()}.pdf`;
  let reportUrl;
  let filePath;

  try {
    const { uploadToS3 } = require("../utils/aws");
    reportUrl = await uploadToS3(pdfBuffer, fileName);
  } catch (s3Error) {
    console.warn("Failed to upload to S3, saving locally fallback:", s3Error.message);
    filePath = path.join(REPORTS_DIR, fileName);
    fs.writeFileSync(filePath, pdfBuffer);
    reportUrl = `/reports/${fileName}`;
  }

  return { pdfBuffer, filePath, reportUrl };
};

module.exports = {
  generateReportHTML,
  generatePDF,
};
