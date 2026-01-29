import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, count } = req.body;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "imagen-3.0-generate-001"
    });

    const result = await model.generateImages({
      prompt,
      numberOfImages: Number(count || 1)
    });

    const images = result.images.map(
      img => `data:image/png;base64,${img.base64}`
    );

    res.status(200).json({ images });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
