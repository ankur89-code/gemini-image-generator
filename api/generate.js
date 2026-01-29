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
      throw new Error("Missing GEMINI_API_KEY");
    }

    const endpoint =
      "https://generativelanguage.googleapis.com/v1beta/models/imagen-2:generateImages";

    const images = [];

    for (let i = 0; i < batch; i++) {
      const response = await fetch(`${endpoint}?key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          numberOfImages: 1
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Imagen error:", data);
        throw new Error(data.error?.message || "Imagen API failed");
      }

      if (!data.images || !data.images[0]?.bytesBase64Encoded) {
        throw new Error("No images returned from Imagen");
      }

      images.push(data.images[0].bytesBase64Encoded);
    }

    return res.status(200).json({ images });
  } catch (err) {
    console.error("API ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}
