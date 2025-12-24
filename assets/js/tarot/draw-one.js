document.addEventListener("DOMContentLoaded", () => {
  const dataEl = document.getElementById("tarot-data");
  if (!dataEl) return;

  let cards = JSON.parse(dataEl.textContent);

// 🔒 FIX CUỐI: nếu Hugo stringify 2 lần
if (typeof cards === "string") {
  cards = JSON.parse(cards);
}

  const drawBtn = document.getElementById("draw-card");
  if (!drawBtn) return;

  const overlay = document.getElementById("tarot-overlay");
  const panel = document.querySelector(".tarot-panel");
  const result = document.getElementById("tarot-result");

  const cardBox = document.querySelector(".tarot-card");
  const img = document.getElementById("tarot-image");
  const name = document.getElementById("tarot-name");
  const summary = document.getElementById("tarot-summary");
  const emotion = document.getElementById("tarot-emotion");
  const guidance = document.getElementById("tarot-guidance");
  const link = document.getElementById("tarot-link");

  drawBtn.addEventListener("click", () => {
    // ===== SHOW OVERLAY =====
    if (overlay) overlay.hidden = false;

    // ===== RESET CARD STATE =====
    if (cardBox) cardBox.classList.remove("is-flipped");
    if (result) result.hidden = true;

    // ===== RANDOM DELAY (NGHI THỨC) =====
    setTimeout(() => {
      const card = cards[Math.floor(Math.random() * cards.length)];
      if (!card) {
        if (overlay) overlay.hidden = true;
        return;
      }

      if (img && card.image) {
        img.src = card.image;
        img.alt = card.title || "";
      }

      if (name) name.textContent = card.title || "";
      if (summary) summary.textContent = card.summary || "";
      if (emotion) emotion.textContent = card.emotion || "";
      if (guidance) guidance.textContent = card.guidance || "";
      if (link && card.url) link.href = card.url;

      // ===== STATE CHANGE =====
      document.body.classList.remove("tarot-before");
      document.body.classList.add("tarot-after");
      if (panel) panel.classList.add("is-active");

      // ===== SHOW RESULT =====
      if (result) result.hidden = false;

      // ===== FLIP CARD =====
      if (cardBox) {
        setTimeout(() => {
          cardBox.classList.add("is-flipped");
        }, 100);
      }

      if (overlay) overlay.hidden = true;
    }, 1600);
  });
});
