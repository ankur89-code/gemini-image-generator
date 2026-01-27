import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, images, batch } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt required" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "models/gemini-1.5-pro"
    });

    const imageParts = (images || []).map(img => ({
      inlineData: {
        data: img,
        mimeType: "image/png"
      }
    }));

    const results = [];

    for (let i = 0; i < batch; i++) {
      const result = await model.generateContent([
        prompt,
        ...imageParts
      ]);

      const image = result.response.candidates[0].content.parts
        .find(p => p.inlineData)?.inlineData?.data;

      if (image) results.push(image);
    }

    res.status(200).json({ images: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
