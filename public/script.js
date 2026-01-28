export const config = {
  runtime: "edge"
};

export default async function handler(req) {
  try {
    const { prompt, images = [], batch = 1 } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt required" }), { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    const payload = {
      prompt,
      numberOfImages: batch,
      ...(images.length && {
        referenceImages: images.map(b64 => ({
          referenceImage: { bytesBase64Encoded: b64 }
        }))
      })
    };

    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImages?key=" + apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    const json = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: json.error?.message || "Generation failed" }), { status: 500 });
    }

    const out = json.generatedImages.map(i => i.image.bytesBase64Encoded);

    return new Response(JSON.stringify({ images: out }), { status: 200 });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
