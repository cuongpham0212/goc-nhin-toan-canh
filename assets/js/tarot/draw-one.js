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

  if (!Array.isArray(cards) || cards.length === 0) return;

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

  const overlay = document.getElementById("tarot-overlay");
  const panel = document.querySelector(".tarot-panel");

  const readingBox = document.getElementById("tarot-reading");
  const reading1 = document.getElementById("reading-1");
  const reading2 = document.getElementById("reading-2");
  const reading3 = document.getElementById("reading-3");

  if (slots.length !== 3) return;

  /* ===============================
     HELPERS: decode double-stringify
     =============================== */
  function unwrapQuotedString(v) {
    if (typeof v !== "string") return v;
    // Trường hợp v = '"https://..."' hoặc '"Ace..."'
    const s = v.trim();
    if (s.length >= 2 && s[0] === '"' && s[s.length - 1] === '"') {
      return s.slice(1, -1);
    }
    return s;
  }

  function parseMaybeJSON(v) {
    if (v == null) return v;

    if (typeof v === "string") {
      let s = v.trim();

      // nếu là string có bọc ngoặc kép kiểu '"...""'
      s = unwrapQuotedString(s);

      // nếu trông giống JSON (array/object) thì parse
      if ((s.startsWith("{") && s.endsWith("}")) || (s.startsWith("[") && s.endsWith("]"))) {
        try {
          return JSON.parse(s);
        } catch (_) {
          return s;
        }
      }
      return s;
    }

    return v;
  }

  function normalizeCard(raw) {
    const card = { ...raw };

    // fix các field bị stringify 2 lần
    card.title = unwrapQuotedString(parseMaybeJSON(card.title));
    card.slug = unwrapQuotedString(parseMaybeJSON(card.slug));
    card.image = unwrapQuotedString(parseMaybeJSON(card.image));
    card.summary = unwrapQuotedString(parseMaybeJSON(card.summary));

    card.emotion = parseMaybeJSON(card.emotion);
    card.guidance = parseMaybeJSON(card.guidance);
    card.reading = parseMaybeJSON(card.reading);

    return card;
  }

  // normalize toàn bộ data 1 lần
  cards = cards.map(normalizeCard);

  function randomIndex(remainingIndexes) {
    const r = Math.floor(Math.random() * remainingIndexes.length);
    return remainingIndexes.splice(r, 1)[0];
  }

  function randomReversed() {
    return Math.random() < REVERSED_RATE;
  }

  function createFlipCard(frontSrc, isReversed = false) {
    const wrapper = document.createElement("div");
    wrapper.className = "tarot-card";
    if (isReversed) wrapper.classList.add("is-reversed");

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

  function toText(v) {
    // emotion/guidance có thể là array → join cho đẹp
    if (Array.isArray(v)) return v.join(", ");
    if (v == null) return "";
    return String(v);
  }

  function pickReading(card, isReversed, position, fallbackKey) {
    // reading có thể là object chuẩn {past:{upright,reversed},...}
    const reading = card?.reading;

    const block = reading?.[position];
    if (block && typeof block === "object") {
      const txt = isReversed
        ? block.reversed || block.upright || ""
        : block.upright || block.reversed || "";
      if (txt) return String(txt).trim();
    }

    // fallback
    const fb = card?.[fallbackKey] ?? card?.summary ?? "";
    return toText(fb).trim();
  }

  /* ===============================
     STATE
     =============================== */
  let remainingIndexes = cards.map((_, i) => i);
  let selectedCards = [];

  // init
  slots.forEach((slot) => {
    slot.innerHTML = "";
    slot.appendChild(createFlipCard(BACK_IMAGE));
  });

  /* ===============================
     CLICK SLOT → RANDOM → FLIP
     =============================== */
  slots.forEach((slot, slotIndex) => {
    slot.addEventListener("click", () => {
      if (selectedCards[slotIndex]) return;
      if (!remainingIndexes.length) return;

      const idx = randomIndex(remainingIndexes);
      const raw = cards[idx];
      const isReversed = randomReversed();

      const cardData = { ...raw, isReversed };
      selectedCards[slotIndex] = cardData;

      const frontSrc = (cardData.image && String(cardData.image).trim())
        ? String(cardData.image).trim()
        : BACK_IMAGE;

      slot.innerHTML = "";
      slot.appendChild(createFlipCard(frontSrc, isReversed));

      requestAnimationFrame(() => {
        slot.querySelector(".tarot-card")?.classList.add("is-flipped");
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
    if (selectedCards.filter(Boolean).length !== 3) return;

    if (overlay) overlay.hidden = false;

    setTimeout(() => {
      document.body.classList.remove("tarot-before");
      document.body.classList.add("tarot-after");
      panel?.classList.add("is-active");

      reading1.textContent = pickReading(
        selectedCards[0],
        selectedCards[0].isReversed,
        POSITIONS[0],
        "summary"
      );

      reading2.textContent = pickReading(
        selectedCards[1],
        selectedCards[1].isReversed,
        POSITIONS[1],
        "emotion"
      );

      reading3.textContent = pickReading(
        selectedCards[2],
        selectedCards[2].isReversed,
        POSITIONS[2],
        "guidance"
      );

      readingBox.hidden = false;
      if (overlay) overlay.hidden = true;

      readingBox.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 1200);
  });
});
