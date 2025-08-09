// Hide and show password
const togglePasswordBtn = document.getElementById("togglePassword");
const passwordField = document.getElementById("password");

togglePasswordBtn.addEventListener("click", () => {
  const isPassword = passwordField.type === "password";
  passwordField.type = isPassword ? "text" : "password";
  togglePasswordBtn.textContent = isPassword ? "Hide Password" : "Show Password";
});