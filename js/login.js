let loginForm = document.getElementById("loginForm");
let email = document.getElementById("email");
let password = document.getElementById("password");

loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  try {
    const response = await fetch("http://localhost:3000/users");
    if (!response.ok) throw new Error("Failed to fetch users");

    const users = await response.json();
    const user = users.find(
      u => u.email.toLowerCase() === email.value.trim().toLowerCase() && u.password === password.value.trim()
    );

    if (!user) {
      alert("Failed to login: Email or Password is incorrect. Please try again.");
      return;
    }

    if (!user.isActive) {
      alert("You are banned");
      return;
    }

    localStorage.setItem("user", JSON.stringify(user));
    alert("Login success!!");

    if (user.role === "admin") {
      window.location.href = "admindashboard.html";
    } else {
      window.location.href = "userdashboard.html";
    }

  } catch (err) {
    alert("Something went wrong. Please try again.");
  }
});