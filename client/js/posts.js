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
          <div class="post-mock post${i}" data-id="${e.ID}">
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
            
            <div class="Attachment"></div>

            <div class="post-footer">
              <div class="post-stats">
                <button class="likeButton" data-id="${e.ID}" id="upvote" onclick="vote(event, 'Upvote')">${e.Upvotes} <i class="view-icon">👍</i></button>
                <button class="likeButton" data-id="${e.ID}" id="downvote" onclick="vote(event, 'Downvote')">${e.Downvotes} <i class="view-icon">👎</i></button>
                <button class="likeButton"><i class="view-icon">💬</i></button>
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
          document.querySelector(`.post${i}>.Attachment`).appendChild(img);
        }
      }
    })
    .catch((err) => setTimeout(getPosts(), 100));
  document.getElementById("username").innerHTML = JSON.parse(
    localStorage.getItem("UserData")
  ).Username;
}

// ---------- MAKING NEW POSTS ----------------------------
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