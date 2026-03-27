document.getElementById("registerForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm_password").value;

  if (!name || !email || !password || !confirmPassword) {
    alert("Please fill all fields");
    return;
  }

  if (!email.includes("@")) {
    alert("Invalid email format");
    return;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  try {
    const checkResponse = await fetch(`http://localhost:3000/users?email=${encodeURIComponent(email)}`);
    const existingUsers = await checkResponse.json();
    if (existingUsers.length > 0) {
      alert("User already exists with this email!");
      return;
    }

    const response = await fetch("http://localhost:3000/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name,
        email: email,
        password: password,
        role: "user",
        isActive: true
      })
    });

    if (!response.ok) {
      throw new Error("Failed to create account");
    }

    window.location.assign("login.html");

  } catch (err) {
    alert("Registration failed. Please try again!");
  }
});