document.addEventListener("DOMContentLoaded", function () {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");

  if (!header || !toggle || !nav) return;

  // Toggle menu
  toggle.addEventListener("click", function (e) {
    e.stopPropagation(); // không cho click lan ra ngoài
    const isOpen = header.classList.toggle("menu-open");
    toggle.setAttribute("aria-expanded", isOpen);
    toggle.textContent = isOpen ? "✕" : "☰";
  });

  // Click vào menu thì không đóng
  nav.addEventListener("click", function (e) {
    e.stopPropagation();
  });

  // Click ra ngoài -> đóng menu
  document.addEventListener("click", function () {
    if (header.classList.contains("menu-open")) {
      header.classList.remove("menu-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "☰";
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const featured = document.querySelector(".home-featured");

  if (!featured || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          featured.classList.add("is-visible");
          observer.disconnect(); // chạy 1 lần là đủ
        }
      });
    },
    {
      rootMargin: "-40px 0px", // trigger sớm hơn chút
      threshold: 0.1,
    }
  );

  observer.observe(featured);
});
