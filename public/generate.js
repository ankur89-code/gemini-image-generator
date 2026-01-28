let generatedImages = [];

function estimateCost(batch) {
  return `$${(batch * 0.02).toFixed(2)} estimated`;
}

async function generate() {
  const prompt = document.getElementById("prompt").value;
  const files = document.getElementById("refs").files;
  const batch = Number(document.getElementById("batch").value);

  document.getElementById("cost").innerText = estimateCost(batch);
  document.getElementById("loader").hidden = false;
  document.getElementById("images").innerHTML = "";
  generatedImages = [];

  const images = [];
  for (const file of files) {
    const base64 = await toBase64(file);
    images.push(base64.split(",")[1]);
  }

  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, images, batch })
  });

  const data = await res.json();
  document.getElementById("loader").hidden = true;

  if (data.error) {
    alert(data.error);
    return;
  }

  data.images.forEach(img => {
    const el = document.createElement("img");
    el.src = `data:image/png;base64,${img}`;
    document.getElementById("images").appendChild(el);
    generatedImages.push(img);
  });
}

function toBase64(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

async function downloadAll() {
  if (!generatedImages.length) return;

  const zip = new JSZip();
  generatedImages.forEach((img, i) => {
    zip.file(`image_${i + 1}.png`, img, { base64: true });
  });

  const blob = await zip.generateAsync({ type: "blob" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "images.zip";
  a.click();
}
