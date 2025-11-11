import express from "express";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { createPDF } from "../utils/pdfGenerator.js";

const router = express.Router();

router.post("/generate-pdf", async (req, res) => {
  try {
    const orderId = uuidv4().split("-")[0].toUpperCase();
    const pdfPath = path.join("public/orders", `sikars_order_${orderId}.pdf`);

    // Generate PDF file
    const { trackingUrl } = await createPDF(req.body, orderId, pdfPath);

    res.json({
      orderId,
      pdfUrl: `/public/orders/sikars_order_${orderId}.pdf`,
      trackingUrl
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
