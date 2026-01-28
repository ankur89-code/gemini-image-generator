import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Use the key from Vercel Environment Variables
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
  
  // Use the standard Flash 2.0 model
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  try {
    const { prompts } = req.body;
    const promptText = prompts[0];

    // CRITICAL: You must tell Gemini to allow Image output
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `Generate an image of: ${promptText}` }] }],
      generationConfig: {
        // This is the "magic" line for Gemini 2.0
        responseModalities: ["IMAGE"] 
      }
    });

    const response = await result.response;
    
    // Gemini returns images as Base64 data in the parts array
    const imagePart = response.candidates[0].content.parts.find(p => p.inlineData);
    
    if (!imagePart) {
      throw new Error("Gemini did not return an image. Check if your API key has Imagen enabled.");
    }

    // Convert Base64 to a data URL so the browser can show it
    const base64Data = imagePart.inlineData.data;
    const mimeType = imagePart.inlineData.mimeType;
    const imageUrl = `data:${mimeType};base64,${base64Data}`;

    res.status(200).json({ 
      results: [{ prompt: promptText, url: imageUrl }] 
    });
  } catch (error) {
    console.error("DEBUG ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
}