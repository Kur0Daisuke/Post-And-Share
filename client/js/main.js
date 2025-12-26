const authForm = document.getElementById("authForm");
const errorMessage = document.getElementById("message");
authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(authForm);
  const data = Object.fromEntries(formData.entries());
  if (data.email == "" || data.password == "") return;
  const result = await fetch("http://localhost:3000/login", {
    method: "POST", // 1. Set the method
    headers: {
      "Content-Type": "application/json", // 2. Tell server to expect JSON
    },
    body: JSON.stringify(data), // 3. Convert object to string
  })
  
  const res = await result.json()
  errorMessage.innerHTML = res.message
});
// (async () => {
//     const result = await fetch("http://localhost:3000/user?id=0E830531-3EEA-494E-AAF9-15A043DD3A89")
//     const data = await result.json()
//     console.log(JSON.stringify(data, null, 2))
// })()
