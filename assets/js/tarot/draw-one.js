document.addEventListener("DOMContentLoaded", () => {

  /* ===============================
     DEBUG SWITCH
     =============================== */
  const DEBUG = true; // đổi false khi ổn

  function dlog(...args) {
    if (DEBUG) console.log("[TAROT]", ...args);
  }
  function dwarn(...args) {
    if (DEBUG) console.warn("[TAROT]", ...args);
  }
  function derr(...args) {
    console.error("[TAROT]", ...args);
  }

  /* ===============================
     ELEMENTS
     =============================== */
  const shuffleBtn = document.querySelector(".tarot-shuffle-box button");
  const deckEl = document.querySelector(".tarot-deck"); // bộ bài (visual)
  const spreadArea = document.querySelector(".tarot-spread-area");
  const slots = document.querySelectorAll(".tarot-slot");

  const revealBtn = document.getElementById("reveal-reading");
  const resetBtn = document.getElementById("reset-tarot");

  const readingEl = document.getElementById("tarot-reading");
  const reading1 = document.getElementById("reading-1");
  const reading2 = document.getElementById("reading-2");
  const reading3 = document.getElementById("reading-3");

  const panelEl = document.querySelector(".tarot-panel");

  /* ===============================
     DATA LOAD (CARD LIBRARY)
     =============================== */
  const dataEl = document.getElementById("tarot-data");
  let cards = [];

  if (dataEl) {
    try {
      const raw = JSON.parse(dataEl.textContent);
      cards = Array.isArray(raw) ? raw : Object.values(raw);
    } catch (e) {
      derr("Invalid tarot-data JSON", e);
    }
  } else {
    derr("Missing #tarot-data element");
  }

  const BACK_IMAGE =
    "https://cdn.jsdelivr.net/gh/cuongpham0212/kho-anh@main/tarot/anh-mat-sau-la-bai-tarot.webp";

  /* ===============================
     QUICK SANITY CHECK (ONCE)
     =============================== */
  if (DEBUG) {
    dlog("cards length =", Array.isArray(cards) ? cards.length : "NOT ARRAY");
    if (Array.isArray(cards) && cards.length) {
      const sample = cards.find(x => x && (x.title || x.slug));
      dlog("sample card =", sample);
      const missing = cards.filter(c => !c?.image).length;
      dlog("cards missing image =", missing);
    }
  }

  /* ===============================
     STATE (DECK + POINTER)
     =============================== */
  let deck = [];           // deck thật (78 phần tử)
  let drawPointer = 0;     // con trỏ định mệnh
  let selected = [];       // 3 lá đã rút (deckItem)
  let hasSpread = false;
  let isFlying = false;

  const VISIBLE_COUNT = 24;
  const POSITIONS = ["past", "present", "future"];

  /* ===============================
     UTILS
     =============================== */
  function normCard(c) {
    return {
      title: c?.title ?? "",
      slug: c?.slug ?? "",
      image: c?.image ?? "",
      reading: c?.reading ?? {}
    };
  }

  function shuffleInPlace(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /* ===============================
     BUILD DECK – KHÓA ĐỊNH MỆNH (1 LẦN)
     deckItem = { deckIndex, cardIndex, isReversed, drawn }
     =============================== */
  function buildDeck() {
    const lib = cards.map(normCard);
    const idx = Array.from({ length: lib.length }, (_, i) => i);
    shuffleInPlace(idx);

    const out = idx.map((cardIndex, deckIndex) => ({
      deckIndex,
      cardIndex,
      isReversed: Math.random() < 0.5,
      drawn: false
    }));

    if (DEBUG) {
      const first3 = out.slice(0, 3).map(it => {
        const c = normCard(cards[it.cardIndex]);
        return { deckIndex: it.deckIndex, title: c.title, image: c.image, reversed: it.isReversed };
      });
      dlog("deck built. first3 =", first3);
    }

    return out;
  }

  function getCardFromDeckItem(item) {
    const c = cards[item.cardIndex];
    return normCard(c);
  }

  /* ===============================
     UI RESET (KHÔNG ĐỤNG DATA)
     =============================== */
  function resetUI() {
    spreadArea.innerHTML = "";
    slots.forEach(s => {
      s.innerHTML = "";
      s.style.background = "none";
    });

    selected = [];
    drawPointer = 0;
    hasSpread = false;
    isFlying = false;

    revealBtn.disabled = true;
    revealBtn.classList.add("is-disabled");

    if (reading1) reading1.textContent = "";
    if (reading2) reading2.textContent = "";
    if (reading3) reading3.textContent = "";
    if (readingEl) readingEl.hidden = true;

    document.body.classList.remove("tarot-shuffled", "tarot-after");
    document.body.classList.add("tarot-before");
    panelEl?.classList.remove("is-active");
  }

  /* ===============================
     SHUFFLE ANIMATION (VISUAL)
     =============================== */
  function shuffleAnimation() {
    if (!deckEl) return;

    deckEl.classList.add("is-shuffling");

    const imgs = deckEl.querySelectorAll("img");
    imgs.forEach((img, i) => {
      img.style.setProperty("--sx", `${(Math.random() - 0.5) * 18}px`);
      img.style.setProperty("--sy", `${(Math.random() - 0.5) * 12}px`);
      img.style.setProperty("--sr", `${(Math.random() - 0.5) * 10}deg`);
      img.style.setProperty("--sz", `${i * 3}px`);
    });

    setTimeout(() => {
      deckEl.classList.remove("is-shuffling");
      imgs.forEach((img, i) => {
        img.style.setProperty("--sx", `0px`);
        img.style.setProperty("--sy", `0px`);
        img.style.setProperty("--sr", `0deg`);
        img.style.setProperty("--sz", `${i * 3}px`);
      });
    }, 600);
  }

  /* ===============================
     RENDER SPREAD (24 PLACEHOLDER)
     =============================== */
  function renderSpread() {
    spreadArea.innerHTML = "";

    const total = VISIBLE_COUNT;
    const radius = 320;
    const yLift = 100;
    const rotateMax = 18;

    for (let i = 0; i < total; i++) {
      const el = document.createElement("img");
      el.src = BACK_IMAGE;
      el.className = "tarot-card tarot-spread-card";

      el.style.setProperty("--x", "0px");
      el.style.setProperty("--y", "0px");
      el.style.setProperty("--r", "0deg");

      el.style.opacity = "0";
      el.style.pointerEvents = "none";

      spreadArea.appendChild(el);

      const t = i / (total - 1);
      const angle = Math.PI * (t - 0.5);

      const x = Math.sin(angle) * radius;
      const y = -Math.cos(angle) * yLift;
      const r = angle * rotateMax;

      setTimeout(() => {
        el.style.opacity = "1";
        el.style.pointerEvents = "auto";
        el.classList.add("is-dealt");
        el.style.setProperty("--x", `${x}px`);
        el.style.setProperty("--y", `${y}px`);
        el.style.setProperty("--r", `${r}deg`);
      }, i * 18);

      el.addEventListener("click", () => pickCard(el));
    }

    hasSpread = true;
    document.body.classList.remove("tarot-before");
    document.body.classList.add("tarot-shuffled");
  }

  /* ===============================
     PICK CARD (DECK POINTER)
     =============================== */
  function pickCard(el) {
    if (!hasSpread || isFlying) return;
    if (selected.length >= 3) return;

    const item = deck[drawPointer];
    if (!item) return;

    isFlying = true;

    item.drawn = true;
    drawPointer++;
    selected.push(item);

    el.classList.add("is-picked");
    el.style.pointerEvents = "none";
    el.style.opacity = "0.35";

    const slot = slots[selected.length - 1];
    if (!slot) {
      isFlying = false;
      return;
    }

    const from = el.getBoundingClientRect();
    const to = slot.getBoundingClientRect();

    const ghost = document.createElement("img");
    ghost.src = BACK_IMAGE;
    ghost.className = "tarot-card tarot-fly-card";
    document.body.appendChild(ghost);

    ghost.style.left = `${from.left}px`;
    ghost.style.top = `${from.top}px`;
    ghost.style.width = `${from.width}px`;
    ghost.style.height = `${from.height}px`;

    requestAnimationFrame(() => {
      ghost.style.transform = `
        translate(${to.left - from.left}px, ${to.top - from.top}px)
        scale(0.95)
      `;
    });

    setTimeout(() => {
      ghost.remove();

      const c = getCardFromDeckItem(item);

      // ===== DEBUG CRITICAL =====
      if (DEBUG) {
        dlog("picked item =", item);
        dlog("picked card =", { title: c.title, slug: c.slug, image: c.image });
      }

      slot.innerHTML = "";
      slot.style.background = "none";

      const img = document.createElement("img");
      img.alt = c.title || c.slug || "Tarot card";
      img.className = "tarot-selected-card";

      // ĐỪNG che lỗi: nếu image rỗng thì log rõ
      if (!c.image) {
        dwarn("Missing image for card:", c.title || c.slug, "=> fallback BACK_IMAGE");
        img.src = BACK_IMAGE;
      } else {
        img.src = c.image;
      }

      // bắt lỗi load ảnh (CDN 404, typo, v.v.)
      img.onerror = () => {
        derr("Image failed to load:", img.src, "card =", c);
        img.src = BACK_IMAGE;
      };

      // xoay ngược xuôi
      if (item.isReversed) {
        img.classList.add("is-reversed");
        img.style.transform = "rotate(180deg)";
      } else {
        img.style.transform = "rotate(0deg)";
      }

      slot.appendChild(img);

      // Debug: confirm DOM src
      if (DEBUG) {
        setTimeout(() => {
          const real = slot.querySelector("img");
          dlog("slot img src =", real?.getAttribute("src"));
          dlog("slot img currentSrc =", real?.currentSrc);
        }, 0);
      }

      isFlying = false;

      if (selected.length === 3) {
        revealBtn.disabled = false;
        revealBtn.classList.remove("is-disabled");
      }
    }, 420);
  }

  /* ===============================
     RENDER READING
     =============================== */
  function renderReading() {
    if (selected.length !== 3) return;

    const texts = selected.map((item, i) => {
      const pos = POSITIONS[i];
      const c = getCardFromDeckItem(item);

      const node = c.reading?.[pos];
      if (!node) {
        dwarn("Missing reading node:", c.title || c.slug, "pos =", pos, "reading =", c.reading);
        return "";
      }

      const text = item.isReversed ? (node.reversed || "") : (node.upright || "");
      if (!text) {
        dwarn("Empty reading text:", c.title || c.slug, "pos =", pos, "reversed =", item.isReversed);
      }
      return text;
    });

    if (reading1) reading1.textContent = texts[0] || "";
    if (reading2) reading2.textContent = texts[1] || "";
    if (reading3) reading3.textContent = texts[2] || "";

    if (readingEl) readingEl.hidden = false;

    if (DEBUG) {
      dlog("reading rendered. lengths =", texts.map(t => (t || "").length));
    }
  }

  /* ===============================
     EVENTS
     =============================== */
  shuffleBtn?.addEventListener("click", () => {
    resetUI();

    if (!Array.isArray(cards) || cards.length < 10) {
      derr("Tarot cards not loaded or too few:", cards);
      return;
    }

    deck = buildDeck();
    shuffleAnimation();
    setTimeout(renderSpread, 550);
  });

  revealBtn?.addEventListener("click", () => {
    if (selected.length !== 3) return;

    document.body.classList.add("tarot-after");
    panelEl?.classList.add("is-active");

    if (readingEl) readingEl.hidden = false; // BẮT BUỘC
    renderReading();

    readingEl?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  resetBtn?.addEventListener("click", () => {
    resetUI();
  });

});
