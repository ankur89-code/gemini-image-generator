import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = {
  runtime: "nodejs",
  maxDuration: 60
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, count = 1 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "imagen-3.0-generate-002"
    });

    const result = await model.generateImages({
      prompt,
      numberOfImages: Math.min(count, 4)
    });

    const images = result.images.map(img => img.imageBase64);

    res.status(200).json({ images });

  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ error: err.message });
  }
}
