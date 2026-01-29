// api/generate.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
  
  // Use a confirmed 2026 stable model name
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); 

  try {
    const { prompts } = req.body;
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompts[0] }] }],
      generationConfig: {
        responseModalities: ["IMAGE"] // Required for Gemini Native Image Gen
      }
    });

    const response = await result.response;
    const imagePart = response.candidates[0].content.parts.find(p => p.inlineData);

    if (!imagePart) throw new Error("No image data returned.");

    res.status(200).json({ 
      results: [{ url: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}` }] 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}