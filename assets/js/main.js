document.addEventListener("DOMContentLoaded", function () {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");

  if (!header || !toggle || !nav) return;

  /* ===============================
     MOBILE MENU TOGGLE
  =============================== */

  toggle.addEventListener("click", function (e) {
    e.stopPropagation();
    const isOpen = header.classList.toggle("menu-open");
    toggle.setAttribute("aria-expanded", isOpen);
    toggle.textContent = isOpen ? "✕" : "☰";
  });

  nav.addEventListener("click", function (e) {
    e.stopPropagation();
  });

  document.addEventListener("click", function () {
    header.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = "☰";
  });

  /* ===============================
     MOBILE SUBMENU TOGGLE ONLY
  =============================== */

  const submenuToggles = document.querySelectorAll(".submenu-toggle");

  submenuToggles.forEach(btn => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      const item = btn.closest(".nav-item");
      item.classList.toggle("submenu-open");
    });
  });
});
