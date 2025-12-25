document.addEventListener("DOMContentLoaded", () => {
  const dataEl = document.getElementById("tarot-data");
  if (!dataEl) return;

  let cards = JSON.parse(dataEl.textContent);
  if (typeof cards === "string") cards = JSON.parse(cards);
  if (!Array.isArray(cards) || cards.length === 0) return;

  /* ===============================
     CONSTANTS
     =============================== */
  const BACK_IMAGE =
    "https://cdn.jsdelivr.net/gh/cuongpham0212/kho-anh@main/tarot/anh-mat-sau-la-bai-tarot.webp";

  /* ===============================
     ELEMENTS
     =============================== */
  const slots = document.querySelectorAll(".tarot-slot");
  const revealBtn = document.getElementById("reveal-reading");

  const overlay = document.getElementById("tarot-overlay");
  const panel = document.querySelector(".tarot-panel");

  const readingBox = document.getElementById("tarot-reading");
  const reading1 = document.getElementById("reading-1");
  const reading2 = document.getElementById("reading-2");
  const reading3 = document.getElementById("reading-3");

  if (slots.length !== 3) return;

  /* ===============================
     STATE
     =============================== */
  let remainingIndexes = cards.map((_, i) => i);
  let selectedCards = [];

  /* ===============================
     HELPERS
     =============================== */
  function randomIndex() {
    const r = Math.floor(Math.random() * remainingIndexes.length);
    return remainingIndexes.splice(r, 1)[0];
  }

  function createFlipCard(frontSrc) {
    const wrapper = document.createElement("div");
    wrapper.className = "tarot-card";

    const back = document.createElement("div");
    back.className = "tarot-face back";
    back.innerHTML = `<img src="${BACK_IMAGE}" alt="Tarot back">`;

    const front = document.createElement("div");
    front.className = "tarot-face front";
    front.innerHTML = `<img src="${frontSrc}" alt="Tarot front">`;

    wrapper.appendChild(back);
    wrapper.appendChild(front);
    return wrapper;
  }

  /* ===============================
     INIT SLOTS (3 LÁ ÚP)
     =============================== */
  slots.forEach((slot) => {
    slot.innerHTML = "";
    const flip = createFlipCard(BACK_IMAGE);
    slot.appendChild(flip);
  });

  /* ===============================
     CLICK SLOT → RANDOM → FLIP
     =============================== */
  slots.forEach((slot, slotIndex) => {
    slot.addEventListener("click", () => {
      if (selectedCards[slotIndex]) return;
      if (remainingIndexes.length === 0) return;

      const index = randomIndex();
      const cardData = cards[index];
      selectedCards[slotIndex] = cardData;

      const flip = slot.querySelector(".tarot-card");
      const frontImg = flip.querySelector(".tarot-face.front img");

      frontImg.src =
        cardData.image && cardData.image.trim()
          ? cardData.image
          : BACK_IMAGE;

      requestAnimationFrame(() => {
        flip.classList.add("is-flipped");
      });

      if (selectedCards.filter(Boolean).length === 3) {
        revealBtn.disabled = false;
      }
    });
  });

  /* ===============================
     REVEAL READING
     =============================== */
  revealBtn.addEventListener("click", () => {
    if (selectedCards.length !== 3) return;

    overlay && (overlay.hidden = false);

    setTimeout(() => {
      document.body.classList.remove("tarot-before");
      document.body.classList.add("tarot-after");
      panel?.classList.add("is-active");

      reading1.textContent =
        selectedCards[0].summary || selectedCards[0].guidance || "";

      reading2.textContent =
        selectedCards[1].summary || selectedCards[1].emotion || "";

      reading3.textContent =
        selectedCards[2].guidance || selectedCards[2].summary || "";

      readingBox.hidden = false;
      overlay.hidden = true;

      readingBox.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 1200);
  });
});
