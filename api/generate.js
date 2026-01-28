import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Use the new SDK initialization
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });

  try {
    const { prompts } = req.body;
    const promptText = prompts[0];

    // Requesting native image generation
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash", // or "gemini-3-flash-preview"
      contents: promptText,
      config: {
        // This is required to tell the model to generate an image part
        responseModalities: ["IMAGE"] 
      }
    });

    // Extract the image data from the response parts
    const imagePart = response.candidates[0].content.parts.find(p => p.inlineData);

    if (!imagePart) {
      return res.status(400).json({ error: "Model didn't return an image. Try a different prompt." });
    }

    const imageUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;

    res.status(200).json({ 
      results: [{ prompt: promptText, url: imageUrl }] 
    });
  } catch (error) {
    console.error("GENAI_ERROR:", error);
    res.status(500).json({ error: error.message });
  }
}