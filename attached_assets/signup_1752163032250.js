// ✅ Toast function
function showToast(message, type = "info") {
  Toastify({
    text: message,
    duration: 3000,
    gravity: "top",
    position: "right",
    backgroundColor: type === "error" ? "#ff4d4f" : "#4CAF50",
  }).showToast();
}

// ✅ Toggle password visibility
document.querySelectorAll(".toggle-password").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.target);
    if (target.type === "password") {
      target.type = "text";
      button.textContent = "Hide";
    } else {
      target.type = "password";
      button.textContent = "Show";
    }
  });
});

// ✅ Form handling
document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullName = document.getElementById("fullname").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirm = document.getElementById("confirm-password").value.trim();

  console.log("🟢 Form values: ", { fullName, email, password, confirm });

  if (password !== confirm) {
    showToast("Passwords do not match", "error");
    return;
  }

  const payload = { fullName, email, password };
  console.log("📤 Sending to backend: ", payload);

  try {
    const response = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("📥 Server response: ", data);

    if (!response.ok) {
      showToast(data.message || "Registration failed", "error");
      return;
    }

    showToast("Registration successful!", "success");
    // Optionally redirect
    setTimeout(() => (window.location.href = "login.html"), 1500);
  } catch (err) {
    console.error("⚠️ Error during registration:", err);
    showToast("Something went wrong", "error");
  }
});
