export default async function handler(req, res) {
  try {
    const { prompt, images = [], batch = 1 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt required" });
    }

    const payload = {
      prompt,
      numberOfImages: batch
    };

    if (images.length) {
      payload.referenceImages = images.map(b64 => ({
        referenceImage: { bytesBase64Encoded: b64 }
      }));
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImages?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    const json = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: json.error?.message || "Imagen error", raw: json });
    }

    const imgs = json.generatedImages || json.images;

    if (!imgs) {
      return res.status(500).json({ error: "No images returned", raw: json });
    }

    const out = imgs.map(i => i.image.bytesBase64Encoded);

    res.status(200).json({ images: out });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
