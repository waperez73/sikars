import express from "express";
import OpenAI from "openai";

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/render-preview
router.post("/render-preview", async (req, res) => {
  try {
    const { size, box, binder, flavor, engraving, bandText, quantity } = req.body;

    const prompt = `A luxury cigar box in ${box} style containing ${quantity} ${size} cigars. 
      Binder: ${binder}. Flavor: ${flavor}. Engraving '${engraving}' on the lid, 
      band text '${bandText}'. Photorealistic studio render.`;

    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "512x512"
    });

    const imageUrl = result.data[0].url;
    res.json({ imageUrl, prompt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
