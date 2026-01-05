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

getPosts();



async function vote(e, type) {
  console.log(e.currentTarget)
  const response = await fetch(`http://localhost:3000/react`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        UserID: JSON.parse(localStorage.getItem("UserData")).ID,
        PostID: e.currentTarget.dataset.id,
        PostType: "Post",
        VoteType: type 
      }),
    });
    const res = await response.json();
    getPosts()
}
 
// ----------- LOGGING OUT -----------------
document.getElementById("logout").addEventListener("click", () => {
  Logout();
  window.location.href = "./login.html";
});

function Logout() {
  localStorage.removeItem("UserData");
}
