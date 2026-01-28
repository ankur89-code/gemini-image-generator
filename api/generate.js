import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  try {
    const { prompts } = req.body;
    // We only process the first prompt sent in the array
    const prompt = prompts[0];

    // Gemini 2.0 uses generateContent for multimodal tasks
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // NOTE: If Gemini is returning text instead of an image, 
    // it's likely a setting in Google AI Studio.
    const output = response.text(); 

    res.status(200).json({ 
      results: [{ prompt, url: output }] 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}