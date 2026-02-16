import PDFDocument from "pdfkit";

export const drawCertificateTemplate = (
  doc: PDFKit.PDFDocument,
  report: {
    user: { name: string };
    courseName: string;
    dateAwarded: string; // from database
    approvedBy: { name: string }; // from database
  }
) => {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  const paddingTop = 100; // space from top edge
  const paddingBottom = 150; // space from bottom edge

  // -----------------------------
  // OUTER BORDER
  // -----------------------------
  doc
    .lineWidth(4)
    .strokeColor("#0A4DAD")
    .rect(20, 20, pageWidth - 40, pageHeight - 40)
    .stroke();

  doc
    .lineWidth(1)
    .strokeColor("#F6C94C")
    .rect(30, 30, pageWidth - 60, pageHeight - 60)
    .stroke();

  // -----------------------------
  // HEADER BAR (Gradient)
  // -----------------------------
  const gradient = doc.linearGradient(0, 0, pageWidth, 0);
  gradient.stop(0, "#0A4DAD").stop(1, "#F6C94C");
  doc.rect(0, paddingTop - 30, pageWidth, 120).fill(gradient);

  doc
    .font("Helvetica-Bold")
    .fontSize(38)
    .fillColor("white")
    .text("CERTIFICATE OF COMPLETION", 0, paddingTop - 5, { align: "center" });

  // -----------------------------
  // MAIN CONTENT
  // -----------------------------
  const contentTop = paddingTop + 150; // start below header

  doc
    .font("Helvetica")
    .fontSize(16)
    .fillColor("#333")
    .text("This certificate is proudly presented to", 0, contentTop, {
      align: "center",
    });

  doc
    .font("Helvetica-Bold")
    .fontSize(32)
    .fillColor("#0A4DAD")
    .text(report.user.name, 0, contentTop + 45, { align: "center" });

  doc
    .font("Helvetica")
    .fontSize(16)
    .fillColor("#555")
    .text(
      "For successfully completing the course with excellent results",
      0,
      contentTop + 110,
      { align: "center" }
    );

  doc
    .font("Helvetica-Bold")
    .fontSize(24)
    .fillColor("#000")
    .text(report.courseName, 0, contentTop + 150, { align: "center" });

  // -----------------------------
  // APPROVED BY SIGNATURE
  // -----------------------------
  const sigY = pageHeight - paddingBottom - 120; // signature above bottom padding

  doc
    .strokeColor("#000")
    .lineWidth(1)
    .moveTo(pageWidth / 2 - 170, sigY)
    .lineTo(pageWidth / 2 + 170, sigY)
    .stroke();

  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .fillColor("#000")
    .text(
      `Approved by: ${report.approvedBy.name}`,
      pageWidth / 2 - 170,
      sigY + 10,
      { width: 340, align: "center" }
    );

  // -----------------------------
  // DATE AT BOTTOM
  // -----------------------------
  doc
    .font("Helvetica")
    .fontSize(12)
    .fillColor("#444")
    .text(
      `Date Awarded: ${report.dateAwarded || new Date().toLocaleDateString()}`,
      0,
      pageHeight - paddingBottom - 50,
      { align: "center" }
    );

  // -----------------------------
  // FOOTER (Brand)
  // -----------------------------
  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .fillColor("#0A4DAD")
    .text("EDU LEARN", 0, pageHeight - paddingBottom, { align: "center" });
};