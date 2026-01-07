// assets/js/main.js
document.addEventListener("DOMContentLoaded", function () {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".menu-toggle");

  if (!header || !toggle) return;

  /* MENU MOBILE */
  toggle.addEventListener("click", function (e) {
    e.stopPropagation();
    const isOpen = header.classList.toggle("menu-open");
    toggle.textContent = isOpen ? "✕" : "☰";
  });

  document.addEventListener("click", function () {
    header.classList.remove("menu-open");
    toggle.textContent = "☰";
  });

  /* SUBMENU MOBILE */
  document.querySelectorAll(".submenu-toggle").forEach(btn => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      btn.closest(".nav-item").classList.toggle("submenu-open");
    });
  });
});
