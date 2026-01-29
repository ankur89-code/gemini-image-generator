import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = {
  runtime: "nodejs",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, count = 1 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt required" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const images = [];

    for (let i = 0; i < count; i++) {
      const result = await genAI.getGenerativeModel({
        model: "imagen-3.0-generate-001",
      }).generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      });

      const imageBase64 =
        result.response.candidates[0].content.parts[0].inlineData.data;

      images.push(imageBase64);
    }

    res.status(200).json({ images });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
