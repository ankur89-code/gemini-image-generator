let generatedImages = [];

async function startBatch() {
    const btn = document.getElementById('genBtn');
    const input = document.getElementById('promptInput').value;
    const prompts = input.split('\n').filter(p => p.trim() !== "");
    
    if (prompts.length === 0) return alert("Please enter some prompts!");

    // Reset UI
    generatedImages = [];
    document.getElementById('gallery').innerHTML = "";
    btn.disabled = true;

    for (let i = 0; i < prompts.length; i++) {
        btn.innerText = `Generating ${i + 1}/${prompts.length}...`;
        
        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompts: [prompts[i]] }) // Send ONLY ONE prompt
            });

            if (!res.ok) throw new Error("API Limit reached");

            const data = await res.json();
            generatedImages.push(...data.results);
            renderGallery(); // Show images as they arrive
            
        } catch (err) {
            console.error("Error on prompt:", prompts[i], err);
        }
    }

    btn.innerText = "Generate";
    btn.disabled = false;
    document.getElementById('dlBtn').classList.remove('hidden');
}