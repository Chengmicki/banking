document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("forgotPasswordForm");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const button = form.querySelector("button");

      if (!email) {
        showToast("❌ Please enter your email.");
        return;
      }

      button.disabled = true;
      button.textContent = "⏳ Sending...";

      try {
        const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok) {
          showToast("✅ Reset link sent! Check your inbox.");
          setTimeout(() => {
            window.location.href = "login.html";
          }, 1500);
        } else {
          showToast("❌ " + (data.message || "Something went wrong."));
        }
      } catch (err) {
        console.error("⚠️ Error:", err);
        showToast("⚠️ Network error. Try again.");
      } finally {
        button.disabled = false;
        button.textContent = "📩 Send Reset Link";
      }
    });
  }
});

function showToast(message) {
  Toastify({
    text: message,
    duration: 3000,
    gravity: "top",
    position: "center",
    backgroundColor: "#444",
  }).showToast();
}

