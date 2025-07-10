// login.js

document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    showToast("❌ Please fill in both email and password.", "error");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (response.ok) {
      showToast("✅ Login successful!", "success");

      // ✅ Save token for future use
      localStorage.setItem("token", data.token);

      // ✅ Redirect to dashboard.html
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1500);
    } else {
      showToast("❌ " + (data.message || "Login failed!"), "error");
    }
  } catch (error) {
    console.error(error);
    showToast("⚠️ Something went wrong. Try again.", "error");
  }
});
