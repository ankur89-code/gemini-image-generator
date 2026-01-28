// api/generate.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const { prompts } = req.body;

  try {
    const tasks = prompts.map(async (prompt) => {
      // Logic for image generation via Gemini
      // Note: As of 2026, Gemini generates images via specific tool calls or multimodal outputs
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      // This is a placeholder for the URL/Base64 Gemini returns
      return { prompt, url: response.text() }; 
    });

    const results = await Promise.all(tasks);
    res.status(200).json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}