export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, batch = 1 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    }

    const endpoint =
      "https://generativelanguage.googleapis.com/v1/models/imagen-3.0-generate-001:generateImages?key=" +
      API_KEY;

    const images = [];

    for (let i = 0; i < batch; i++) {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: {
            text: prompt
          }
        })
      });

      const data = await response.json();

      if (!data?.images?.[0]?.bytesBase64Encoded) {
        console.error("Imagen error:", data);
        throw new Error("No images returned from Imagen");
      }

      images.push(data.images[0].bytesBase64Encoded);
    }

    return res.status(200).json({ images });
  } catch (err) {
    console.error("API ERROR:", err);
    return res.status(500).json({
      error: err.message || "Image generation failed"
    });
  }
}
