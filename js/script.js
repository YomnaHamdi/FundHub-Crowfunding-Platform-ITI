const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav-container");

toggle.addEventListener("click", () => {
  nav.classList.toggle("active");
});