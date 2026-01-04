const profileBtn = document.getElementById("profileBtn");
const newPostBtn = document.querySelector(".newPost");
const closeBtn = document.querySelector(".closeButton");
const dropdownMenu = document.getElementById("dropdownMenu");

var currentPostPage = 1;

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
  document.querySelector(".createPostBox").classList.toggle("active");
});

closeBtn.addEventListener("click", () => {
  document.querySelector(".createPostBox").classList.toggle("active");
});

function getPosts() {
  document.querySelector(".home-container").innerHTML = "";
  const params = new URLSearchParams({ page: currentPostPage, pageSize: 10 });

  fetch(`http://localhost:3000/getPosts?${params.toString()}`, {
    method: "GET",
  })
    .then((res) => res.json())
    .then((data) => {
      data.message.recordsets[0].sort((a, b) => {
        // Convert the time strings to Date objects for reliable comparison
        const dateA = new Date(a.CreatedAt);
        const dateB = new Date(b.CreatedAt);

        // Subtracting the Date objects returns the difference in milliseconds (timestamp)
        return dateA - dateB;
      });
      console.log(new Date(data.message.recordsets[0][0].CreatedAt));
      for (let i = data.message.recordsets[0].length - 1; i >= 0; i--) {
        let e = data.message.recordsets[0][i];
        console.log("Processing row:", i);

        // Notice we use 'e' directly now, NOT 'e[0]'
        document.querySelector(".home-container").innerHTML += `
          <div class="post-mock post${i}">
    <div class="post-header">
      <div class="post-avatar"></div>
      <div class="post-user-info">
        <span class="post-username">${e.Username || "Anonymous"}</span>
        <span class="post-date">• ${new Date(
          e.CreatedAt
        ).toLocaleDateString()} - ${new Date(e.CreatedAt).toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        )}</span>
      </div>
    </div>

    <div class="post-body">
      <h1 class="post-title">${e.PostTitle}</h1>
      <p class="post-content">${e.PostContent}</p>
      <div class="post-image-container" id="img-container-${i}">
        </div>
    </div>

    <div class="post-footer">
      <div class="post-stats">
        <span><i class="view-icon">👁</i> ${e.ViewCount} views</span>
      </div>
    </div>
  </div>
      `;

        // Process the image for THIS specific row
        if (e.PostAttachments && e.PostAttachments.data) {
          let uint8Array = new Uint8Array(e.PostAttachments.data);
          let blob = new Blob([uint8Array], { type: "image/jpeg" });
          let imageUrl = URL.createObjectURL(blob);

          let img = document.createElement("img");
          img.src = imageUrl;
          img.classList.add("postImage");
          document.querySelector(`.post${i}`).appendChild(img);
        }
      }
    })
    .catch((err) => setTimeout(getPosts(), 100));
  document.getElementById("username").innerHTML = JSON.parse(
    localStorage.getItem("UserData")
  ).Username;
}

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

document.getElementById("UploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());
  const arrayBuffer = await data.PostAttachment.arrayBuffer();

  // Create a new Blob from the ArrayBuffer, preserving the original file type
  const blob = new Blob([arrayBuffer], { type: data.PostAttachment.type });

  blobToText(blob).then(async (value) => {
    let userId = JSON.parse(localStorage.getItem("UserData"));
    data.ID = userId.ID;
    data.PostAttachment = value;
    console.log(value);

    const response = await fetch(`http://localhost:3000/newPost`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const res = await response.json();
    getPosts();
    document.querySelector(".createPostBox").classList.toggle("active");
  });
});

getPosts();

function Logout() {
  localStorage.removeItem("UserData");
}
document.getElementById("logout").addEventListener("click", () => {
  Logout();
  window.location.href = "./login.html";
});
