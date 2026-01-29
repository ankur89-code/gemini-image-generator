import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, batch = 1 } = req.body;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/images:generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          model: "imagen-3.0-generate-001",
          prompt: { text: prompt },
          sampleCount: batch
        })
      }
    );

    const data = await response.json();

    if (!data.images || data.images.length === 0) {
      return res.status(500).json({ error: "No images returned" });
    }

    const images = data.images.map(img => img.bytesBase64Encoded);

    res.status(200).json({ images });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
