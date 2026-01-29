// api/generate.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  console.log("--- New Generation Request ---");
  console.log("Prompt received:", req.body.prompts[0]);

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: req.body.prompts[0] }] }],
      generationConfig: { responseModalities: ["IMAGE"] }
    });

    const response = await result.response;
    
    // LOG THE FULL RESPONSE FOR DEBUGGING
    console.log("Gemini API Full Response:", JSON.stringify(response, null, 2));

    const imagePart = response.candidates[0].content.parts.find(p => p.inlineData);
    
    if (!imagePart) {
        console.error("DEBUG: No image found in response parts.");
        throw new Error("Model returned text instead of an image.");
    }

    res.status(200).json({ 
      results: [{ prompt: req.body.prompts[0], url: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}` }] 
    });

  } catch (error) {
    console.error("CRITICAL API ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
}