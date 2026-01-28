async function downloadAll() {
    const zip = new JSZip();
    const folder = zip.folder("gemini-images");

    generatedImages.forEach((img, i) => {
        // Extract the base64 part from the data URL
        const base64Content = img.url.split(',')[1];
        folder.file(`image-${i+1}.png`, base64Content, { base64: true });
    });

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = "batch-images.zip";
    link.click();
}