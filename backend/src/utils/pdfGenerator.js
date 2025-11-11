import fs from "fs";
import PDFDocument from "pdfkit";
import axios from "axios";
import { createQRCode } from "./qrGenerator.js";

export async function createPDF(data, orderId, pdfPath) {
  const trackingUrl = `https://sikars.com/orders/${orderId}`;
  const qrImage = await createQRCode(trackingUrl);

  const doc = new PDFDocument({ margin: 50 });
  const stream = fs.createWriteStream(pdfPath);
  doc.pipe(stream);

  // Header
  doc.fontSize(20).fillColor("#6a4f3a").text("Sikars Custom Cigar Order Summary", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).fillColor("#000");
  doc.text(`Order ID: ${orderId}`);
  doc.text(`Date: ${new Date().toLocaleString()}`);
  doc.moveDown();

  // Order Details
  doc.fontSize(14).fillColor("#6a4f3a").text("Order Details:", { underline: true });
  doc.fontSize(12).fillColor("#000");
  const fields = ["size", "box", "binder", "flavor", "engraving", "bandText", "quantity"];
  fields.forEach(f => doc.text(`${f[0].toUpperCase() + f.slice(1)}: ${data[f] || "—"}`));
  doc.moveDown();

  // Image
  if (data.imageUrl) {
    const response = await axios.get(data.imageUrl, { responseType: "arraybuffer" });
    const imageBuffer = Buffer.from(response.data, "binary");
    const imageTemp = `temp_${orderId}.png`;
    fs.writeFileSync(imageTemp, imageBuffer);
    doc.text("Preview Render:", { underline: true });
    doc.image(imageTemp, { fit: [300, 250], align: "center" });
    fs.unlinkSync(imageTemp);
    doc.moveDown();
  }

  // QR Code
  const qrTemp = `qr_${orderId}.png`;
  fs.writeFileSync(qrTemp, qrImage);
  doc.text("Track Order:", { underline: true });
  doc.image(qrTemp, { width: 100, align: "left" });
  fs.unlinkSync(qrTemp);
  doc.text(trackingUrl);
  doc.moveDown(2);

  // Footer
  doc.fontSize(10).fillColor("#6a4f3a").text("© 2025 Sikars.com — The Custom Cigar Experience", { align: "center" });

  doc.end();
  await new Promise(resolve => stream.on("finish", resolve));

  return { trackingUrl };
}
