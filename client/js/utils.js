function blobToText(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      // Extracts only the Base64 string part (removes "data:image/png;base64,")
      resolve(String(reader.result).split(",")[1]);
    };
    reader.readAsDataURL(blob);
  });
}

function blobToFile(blob, fileName) {
  // The File constructor takes an array of Blob parts, a filename, and options (like type and lastModified date)
  const file = new File([blob], fileName, {
    type: blob.type, // Use the original blob's MIME type
    lastModified: Date.now(), // Set the last modified date to the current time
  });

  return file;
}