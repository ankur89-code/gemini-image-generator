import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, n = 1 } = req.body;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:generateImages?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          numberOfImages: n,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json(data);
    }

    const images = data.generatedImages.map(img => ({
      base64: img.image.imageBytes,
    }));

    res.status(200).json({ images });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
