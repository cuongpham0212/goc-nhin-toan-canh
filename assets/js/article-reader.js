(function () {
  const article = document.getElementById("article");
  if (!article) return;

  const tocLinks = document.querySelectorAll(".toc a");
  const headings = article.querySelectorAll("h2, h3, h4");
  const blocks = article.querySelectorAll("p, ul, ol, blockquote, pre");

  /* ===== 1. Highlight mục đang đọc (TOC) ===== */
  if (headings.length && tocLinks.length) {
    const headingObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            tocLinks.forEach(link => {
              link.classList.toggle(
                "active",
                link.getAttribute("href") === "#" + id
              );
            });
          }
        });
      },
      {
        rootMargin: "-40% 0px -55% 0px",
        threshold: 0
      }
    );
    headings.forEach(h => headingObserver.observe(h));
  }

  /* ===== 2. Highlight đoạn đang đọc ===== */
  if (blocks.length) {
    const paragraphObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            blocks.forEach(b => {
              b.classList.remove("focus");
              b.classList.add("dim");
            });
            entry.target.classList.add("focus");
            entry.target.classList.remove("dim");
          }
        });
      },
      {
        rootMargin: "-45% 0px -45% 0px",
        threshold: 0
      }
    );
    blocks.forEach(b => paragraphObserver.observe(b));
  }

  /* ===== 3. Lưu vị trí đọc dở ===== */
  const storageKey = "reading-position:" + window.location.pathname;

  window.addEventListener("beforeunload", () => {
    localStorage.setItem(storageKey, window.scrollY);
  });

  const savedPosition = localStorage.getItem(storageKey);
  if (savedPosition) {
    window.scrollTo(0, parseInt(savedPosition, 10));
  }
})();
