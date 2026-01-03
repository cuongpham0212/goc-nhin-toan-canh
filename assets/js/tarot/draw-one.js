document.addEventListener("DOMContentLoaded", () => {
  const dataEl = document.getElementById("tarot-data");
  if (!dataEl) return;

  let cards;
  try {
    cards = JSON.parse(dataEl.textContent);
    if (typeof cards === "string") cards = JSON.parse(cards);
  } catch (e) {
    console.error("Invalid tarot-data JSON", e);
    return;
  }

  if (!Array.isArray(cards) || cards.length < 3) return;

  /* ===============================
     CONSTANTS
     =============================== */
  const BACK_IMAGE =
    "https://cdn.jsdelivr.net/gh/cuongpham0212/kho-anh@main/tarot/anh-mat-sau-la-bai-tarot.webp";
  const REVERSED_RATE = 0.5;
  const POSITIONS = ["past", "present", "future"];

  /* ===============================
     ELEMENTS
     =============================== */
  const slots = document.querySelectorAll(".tarot-slot");
  const revealBtn = document.getElementById("reveal-reading");
  const resetBtn = document.getElementById("reset-tarot");

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
  let remainingIndexes = [];
  let selectedCards = [];
  let loadedCount = 0;

  /* ===============================
     HELPERS
     =============================== */
  function randomIndex() {
    const r = Math.floor(Math.random() * remainingIndexes.length);
    return remainingIndexes.splice(r, 1)[0];
  }

  function randomReversed() {
    return Math.random() < REVERSED_RATE;
  }

  function isAllCardsReady() {
    return (
      loadedCount === 3 &&
      selectedCards.length === 3 &&
      selectedCards.every((c) => c && typeof c === "object")
    );
  }

  function tryEnableReveal() {
    if (isAllCardsReady()) {
      revealBtn.disabled = false;
      revealBtn.classList.remove("is-disabled");
    }
  }

  /* ===============================
     BUILD CARD DOM
     =============================== */
  function buildCards() {
    slots.forEach((slot) => {
      slot.innerHTML = "";
      slot.classList.remove("is-locked");

      const card = document.createElement("div");
      card.className = "tarot-card";

      const back = document.createElement("div");
      back.className = "tarot-face back";
      back.innerHTML = `<img src="${BACK_IMAGE}" alt="">`;

      const front = document.createElement("div");
      front.className = "tarot-face front";
      front.innerHTML = `<img src="" alt="">`;

      card.appendChild(back);
      card.appendChild(front);
      slot.appendChild(card);
    });
  }

  /* ===============================
     BIND SLOT EVENTS
     =============================== */
  function bindSlotEvents() {
    slots.forEach((slot, slotIndex) => {
      slot.onclick = null;

      slot.onclick = () => {
        if (slot.classList.contains("is-locked")) return;
        if (!remainingIndexes.length) return;

        slot.classList.add("is-locked");

        const idx = randomIndex();
        const raw = cards[idx];
        const isReversed = randomReversed();

        selectedCards[slotIndex] = { ...raw, isReversed };

        const cardEl = slot.querySelector(".tarot-card");
        const frontImg = cardEl.querySelector(".tarot-face.front img");

        const src =
          raw.image && String(raw.image).trim()
            ? String(raw.image).trim()
            : BACK_IMAGE;

        const preload = new Image();
        preload.src = src;

        preload.onload = () => {
          frontImg.src = src;
          cardEl.classList.toggle("is-reversed", isReversed);

          cardEl.getBoundingClientRect();
          requestAnimationFrame(() => {
            cardEl.classList.add("is-flipped");
          });

          loadedCount++;
          tryEnableReveal();
        };
      };
    });
  }

  /* ===============================
     RESET ALL
     =============================== */
  function resetAll() {
    remainingIndexes = cards.map((_, i) => i);
    selectedCards = new Array(3).fill(null);
    loadedCount = 0;

    revealBtn.disabled = true;
    revealBtn.classList.add("is-disabled");
    revealBtn.hidden = false;

    readingBox.hidden = true;
    panel?.classList.remove("is-active");

    document.body.classList.add("tarot-before");
    document.body.classList.remove("tarot-after");

    buildCards();
    bindSlotEvents();
  }

  /* ===============================
     READING PICKER
     =============================== */
  function pickReading(card, position, fallbackKey) {
    if (!card) return "";

    const reading = card.reading?.[position];
    if (reading && typeof reading === "object") {
      return card.isReversed
        ? reading.reversed || reading.upright || ""
        : reading.upright || reading.reversed || "";
    }
    return card[fallbackKey] || card.summary || "";
  }

  /* ===============================
     REVEAL
     =============================== */
  revealBtn.addEventListener("click", () => {
    if (!isAllCardsReady()) return;

    // MỞ OVERLAY
    if (overlay) overlay.hidden = false;
    window.startStars?.();

    // ⏳ TẮT OVERLAY SAU 3 GIÂY
    setTimeout(() => {
      if (overlay) overlay.hidden = true;
      window.stopStars?.();
    }, 3000);

    setTimeout(() => {
      document.body.classList.remove("tarot-before");
      document.body.classList.add("tarot-after");
      panel?.classList.add("is-active");

      reading1.textContent = pickReading(selectedCards[0], "past", "summary");
      reading2.textContent = pickReading(selectedCards[1], "present", "emotion");
      reading3.textContent = pickReading(selectedCards[2], "future", "guidance");

      readingBox.hidden = false;
      readingBox.scrollIntoView({ behavior: "smooth" });
    }, 600);
  });


  resetBtn?.addEventListener("click", resetAll);

  /* ===============================
     INIT
     =============================== */
  resetAll();
});
