const profileBtn = document.getElementById("profileBtn");
const newPostBtn = document.querySelector(".newPost");
const closeBtn = document.querySelector(".closeButton");
const dropdownMenu = document.getElementById("dropdownMenu");

// Toggle dropdown on click
profileBtn.addEventListener("click", (e) => {
  dropdownMenu.classList.toggle("active");
  e.stopPropagation(); // Prevents immediate closing
});

// Close dropdown if user clicks anywhere else on the screen
window.addEventListener("click", () => {
  if (dropdownMenu.classList.contains("active")) {
    dropdownMenu.classList.remove("active");
  }
});

newPostBtn.addEventListener("click", () => {
  document.querySelector(".createPostBox").classList.toggle("active")
})

closeBtn.addEventListener("click", () => {
  document.querySelector(".createPostBox").classList.toggle("active")
})

function blobToText(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      // Extracts only the Base64 string part (removes "data:image/png;base64,")
      resolve(String(reader.result).split(',')[1]);
    };
    reader.readAsDataURL(blob);
  });
}

function blobToFile(blob, fileName) {
    // The File constructor takes an array of Blob parts, a filename, and options (like type and lastModified date)
    const file = new File([blob], fileName, {
        type: blob.type, // Use the original blob's MIME type
        lastModified: Date.now() // Set the last modified date to the current time
    });

    return file;
}

document.getElementById("UploadForm").addEventListener("submit", async (e) => {
  e.preventDefault()
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());
  const arrayBuffer = await data.PostAttachment.arrayBuffer();
    
    // Create a new Blob from the ArrayBuffer, preserving the original file type
  const blob = new Blob([arrayBuffer], { type: data.PostAttachment.type });
  
  blobToText(blob).then(async (value) => {
    // const image = document.createElement("img")
    // image.src = `data:image/jpeg;base64,${value}`
    // document.getElementById("UploadForm").appendChild(image)
    data.PostAttachment = value;
    const response = await fetch(`http://localhost:3000/newPost`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const res = await response.json();
    console.log(res)
  })
  
})