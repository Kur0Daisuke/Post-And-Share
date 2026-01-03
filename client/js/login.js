const loginSection = document.getElementById("loginSection");
const signupSection = document.getElementById("signupSection");
const messageDisplay = document.getElementById("message");

function toggleAuth() {
  loginSection.classList.toggle("hidden");
  signupSection.classList.toggle("hidden");
  messageDisplay.innerText = "";
}

// Generic function to handle API calls
async function handleAuth(event, endpoint) {
  event.preventDefault();
  messageDisplay.innerText = "Processing...";
  messageDisplay.style.color = "black";

  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData.entries());

  try {
    const response = await fetch(`http://localhost:3000/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const res = await response.json();

    if (response.ok) {
      messageDisplay.style.color = "green";
      messageDisplay.innerText = res.message || "Success!";

      localStorage.setItem("UserData", JSON.stringify({email: data.email}))
      window.location.href = "./home.html";
      
    } else {
      messageDisplay.style.color = "red";
      messageDisplay.innerText = res.message || "An error occurred";
    }
  } catch (error) {
    messageDisplay.style.color = "red";
    messageDisplay.innerText = "Error: Could not connect to server.";
  }
}

window.addEventListener("load", ()=> {
  let localdata = localStorage.getItem("UserData");
  if (localdata) {
    window.location.href = "./home.html";
  }
})

// Attach listeners to both forms
document
  .getElementById("loginForm")
  .addEventListener("submit", (e) => handleAuth(e, "login"));
document
  .getElementById("signupForm")
  .addEventListener("submit", (e) => handleAuth(e, "newAccount"));
