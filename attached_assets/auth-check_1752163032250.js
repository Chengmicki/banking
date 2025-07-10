// auth-check.js
if (!localStorage.getItem("token")) {
  // Not logged in
  window.location.href = "login.html";
}
