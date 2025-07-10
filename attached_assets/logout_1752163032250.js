// js/logout.js
localStorage.removeItem('token');
// Optional: clear more things if stored
// localStorage.clear();

alert("✅ You’ve been logged out!");
window.location.href = "login.html";
