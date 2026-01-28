let generatedImages = []; // To store URLs for zipping

async function startBatch() {
    const btn = document.getElementById('genBtn');
    const input = document.getElementById('promptInput').value;
    const prompts = input.split('\n').filter(p => p.trim() !== "");
    
    btn.innerText = "Processing...";
    btn.disabled = true;

    const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompts })
    });

    const data = await res.json();
    generatedImages = data.results;
    
    renderGallery();
    document.getElementById('dlBtn').classList.remove('hidden');
    btn.innerText = "Generate";
    btn.disabled = false;
}

function renderGallery() {
    const container = document.getElementById('gallery');
    container.innerHTML = generatedImages.map(img => `
        <div class="border border-gray-700 p-2">
            <img src="${img.url}" class="w-full mb-2">
            <p class="text-xs text-gray-400">${img.prompt}</p>
        </div>
    `).join('');
}

async function downloadAll() {
    const zip = new JSZip();
    const folder = zip.folder("gemini-images");

    for (let i = 0; i < generatedImages.length; i++) {
        const response = await fetch(generatedImages[i].url);
        const blob = await response.blob();
        folder.file(`image-${i+1}.png`, blob);
    }

    zip.generateAsync({ type: "blob" }).then(content => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = "batch-images.zip";
        link.click();
    });
}