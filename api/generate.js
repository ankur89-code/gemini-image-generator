let generatedImages = [];

// Estimate cost (optional)
function estimateCost(batch) {
  return `$${(batch * 0.02).toFixed(2)} estimated`;
}

// Convert file to Base64
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]); // only Base64
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Generate images
async function generate() {
  const prompt = document.getElementById("prompt").value.trim();
  const files = Array.from(document.getElementById("refs").files);
  let batch = Number(document.getElementById("batch").value);

  if (!prompt) return alert("Please enter a prompt.");
  if (!files.length) return alert("Please select files.");
  if (!batch || batch < 1) batch = 1;

  // Update cost
  document.getElementById("cost").innerText = estimateCost(batch);
  document.getElementById("loader").hidden = false;
  document.getElementById("images").innerHTML = "";
  generatedImages = [];

  try {
    // Convert files to Base64 in parallel
    const imagesBase64 = await Promise.all(files.map(toBase64));

    // Call API
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, images: imagesBase64, batch })
    });

    const data = await res.json();
    document.getElementById("loader").hidden = true;

    if (data.error) {
      return alert(data.error);
    }

    // Display generated images
    data.images.forEach((img, i) => {
      const image = document.createElement("img");
      image.src = `data:image/png;base64,${img}`;
      image.className = "generated-image"; // optional styling
      document.getElementById("images").appendChild(image);
      generatedImages.push(img);
    });

  } catch (err) {
    document.getElementById("loader").hidden = true;
    alert("Failed to generate images: " + err.message);
  }
}

// Download all generated images as ZIP
async function downloadAll() {
  if (!generatedImages.length) return;

  const zip = new JSZip();
  generatedImages.forEach((img, i) => zip.file(`image_${i + 1}.png`, img, { base64: true }));

  const blob = await zip.generateAsync({ type: "blob" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "images.zip";
  a.click();
}
