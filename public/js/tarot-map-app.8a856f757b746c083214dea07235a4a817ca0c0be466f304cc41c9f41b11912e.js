// ns-hugo-imp:/Users/MN/goc-nhin-toan-canh/assets/js/tarot/tarot-state.js
var TarotState = {
  /* ===============================
     PHASE (TRẠNG THÁI CHÍNH)
     =============================== */
  /**
   * idle        – trạng thái ban đầu (deck A hiện, chờ xào)
   * a_to_b
   * shuffling
   * b_to_c
   * ready
   * selecting
   * revealed
   */
  phase: "idle",
  /* ===============================
     DECK DATA
     =============================== */
  totalCards: 78,
  /**
   * Thứ tự bộ bài sau khi random (OPTIONAL)
   * [{ id, reversed }]
   */
  deck: [],
  /**
   * Orientation-only cho các slot trải bài
   * true  = reversed
   * false = upright
   */
  spreadOrientation: [],
  /**
   * index của lá đang được chọn
   */
  selectedIndices: [],
  selected: [],
  /* ===============================
     FLAGS
     =============================== */
  isShuffling: false,
  isInteractive: false,
  deckLocked: false,
  hasViewedReading: false,
  /* ===============================
     API – STATE HELPERS
     =============================== */
  /**
   * RESET GAME
   * → Quay về trạng thái CÓ THỂ XÀO
   * → Không giữ lại bất kỳ lock / flag trung gian nào
   */
  reset() {
    this.phase = "idle";
    this.deck = [];
    this.spreadOrientation = [];
    this.selectedIndices = [];
    this.selected = [];
    this.isShuffling = false;
    this.isInteractive = false;
    this.deckLocked = false;
    this.hasViewedReading = false;
    console.log("[TarotState] reset \u2192 idle (shuffle available)");
  },
  /* ---------- PHASE ---------- */
  setPhase(next) {
    this.phase = next;
    console.log("[TarotState] phase \u2192", next);
  },
  isIdle() {
    return this.phase === "idle";
  },
  isShufflingPhase() {
    return this.phase === "shuffling";
  },
  isReady() {
    return this.phase === "ready";
  },
  /* ---------- DECK ---------- */
  initDeck(cards) {
    this.deck = cards;
    this.deckLocked = false;
    this.isShuffling = false;
    console.log("[TarotState] deck initialized:", cards.length);
  },
  lockDeck() {
    this.deckLocked = true;
  },
  unlockDeck() {
    this.deckLocked = false;
  },
  /* ---------- ORIENTATION ---------- */
  /**
   * Khởi tạo orientation-only cho spread
   * @param {number} count số slot trải
   */
  initOrientation(count) {
    this.spreadOrientation = Array.from(
      { length: count },
      () => Math.random() < 0.5
    );
    console.log(
      "[TarotState] spread orientation prepared:",
      this.spreadOrientation.length
    );
  },
  getOrientation(index) {
    return !!this.spreadOrientation[index];
  },
  /* ---------- INTERACTION ---------- */
  enableInteraction() {
    this.isInteractive = true;
  },
  disableInteraction() {
    this.isInteractive = false;
  },
  /* ---------- SELECT ---------- */
  selectCard(index) {
    if (!this.isInteractive) return;
    if (this.selectedIndices.includes(index)) return;
    this.selectedIndices.push(index);
    console.log("[TarotState] card selected:", index);
  },
  /* ---------- CHECK ---------- */
  canSelectMore(max = 3) {
    return this.selectedIndices.length < max;
  },
  canShuffle() {
    return this.phase === "idle" && !this.deckLocked && !this.isShuffling;
  },
  /* ---------- READING ---------- */
  canViewReading() {
    return this.phase === "revealed" && !this.hasViewedReading;
  },
  markReadingViewed() {
    this.hasViewedReading = true;
    console.log("[TarotState] reading viewed \u2192 locked");
  }
};

// ns-hugo-imp:/Users/MN/goc-nhin-toan-canh/assets/js/tarot/tarot-map.js
var TarotMap = {
  /* =====================
     ELEMENT REFERENCES
     ===================== */
  deckA: null,
  // deck úp
  deckB: null,
  // deck xào (STACK – deck-shuffle)
  deckC: null,
  // deck trải
  btnShuffle: null,
  btnViewReading: null,
  effects: null,
  /* =====================
     INIT
     ===================== */
  init() {
    this.deckA = document.getElementById("deck-closed");
    this.deckB = document.getElementById("deck-shuffle");
    this.deckC = document.getElementById("deck-spread");
    this.btnShuffle = document.getElementById("btn-shuffle");
    this.btnViewReading = document.getElementById("btn-view-reading");
    if (!this.deckA || !this.deckB || !this.deckC) {
      console.warn("[TarotMap] deck elements missing", {
        A: !!this.deckA,
        B: !!this.deckB,
        C: !!this.deckC
      });
      return false;
    }
    return true;
  },
  /* =====================
     HELPERS
     ===================== */
  getRect(el) {
    return el?.getBoundingClientRect();
  },
  /* ==================================================
     UI CONTROL – SHUFFLE BUTTON
     ================================================== */
  showShuffleButton() {
    const btn = this.btnShuffle;
    if (!btn) {
      console.warn("[TarotMap] shuffle button not found");
      return;
    }
    btn.style.display = "";
    btn.style.visibility = "";
    btn.style.opacity = "";
    btn.style.pointerEvents = "auto";
    btn.disabled = false;
    btn.classList.remove("hidden");
    console.log("[TarotMap] shuffle button restored");
  },
  hideShuffleButton() {
    const btn = this.btnShuffle;
    if (!btn) return;
    btn.style.display = "none";
    btn.style.pointerEvents = "none";
    btn.disabled = true;
  },
  /* ==================================================
     UI CONTROL – DECK A (CLOSED)
     ================================================== */
  showDeckA() {
    const deck = this.deckA;
    if (!deck) {
      console.warn("[TarotMap] deckA not found");
      return;
    }
    deck.classList.remove("is-hidden");
    deck.style.display = "";
    deck.style.visibility = "";
    deck.style.opacity = "";
    console.log("[TarotMap] deck A restored");
  },
  /* ==================================================
     INIT DECK A – CARD BACK
     ================================================== */
  initDeckCardBack() {
    const deck = this.deckA;
    if (!deck) {
      console.warn("[TarotMap] deckA not found (initDeckCardBack)");
      return false;
    }
    if (deck.querySelector("img")) {
      console.log("[TarotMap] deck card back already mounted");
      return true;
    }
    const img = document.createElement("img");
    img.src = "https://cdn.jsdelivr.net/gh/cuongpham0212/kho-anh@main/tarot/anh-mat-sau-la-bai-tarot.webp";
    img.alt = "Tarot Card Back";
    img.className = "tarot-card-back";
    deck.appendChild(img);
    console.log("[TarotMap] deck card back mounted");
    return true;
  },
  /* ==================================================
     UI CONTROL – DECK B (SHUFFLED STACK)
     ================================================== */
  hideDeckB() {
    const deck = this.deckB;
    if (!deck) return;
    deck.classList.remove("is-visible", "is-shuffling", "active", "show");
    deck.style.display = "none";
    deck.style.visibility = "hidden";
    deck.style.opacity = "0";
    deck.style.pointerEvents = "none";
    console.log("[TarotMap] deck B hidden");
  },
  showDeckB() {
    const deck = this.deckB;
    if (!deck) return;
    deck.style.display = "";
    deck.style.visibility = "";
    deck.style.opacity = "";
    deck.style.pointerEvents = "";
    deck.classList.remove("is-hidden");
    console.log("[TarotMap] deck B shown");
  },
  /* ==================================================
     UI CONTROL – STAGE TOP / GAME SPACE
     ================================================== */
  showStageTop() {
    const top = document.querySelector("[data-tarot-stage-top]");
    const space = document.querySelector("[data-tarot-space]");
    if (top) {
      top.style.display = "";
      top.style.visibility = "";
      top.style.opacity = "";
      top.style.pointerEvents = "auto";
    }
    if (space) {
      space.style.display = "";
      space.style.visibility = "";
      space.style.opacity = "";
      space.style.pointerEvents = "auto";
    }
    console.log("[TarotMap] stage top + game space restored");
  },
  /* ==================================================
   UI CONTROL – VIEW READING BUTTON
   ================================================== */
  lockViewReadingButton() {
    const btn = this.btnViewReading;
    if (!btn) return;
    btn.disabled = true;
    btn.style.pointerEvents = "none";
    btn.classList.add("is-locked");
  },
  unlockViewReadingButton() {
    const btn = this.btnViewReading;
    if (!btn) return;
    btn.disabled = false;
    btn.style.pointerEvents = "auto";
    btn.classList.remove("is-locked");
  }
};

// ns-hugo-imp:/Users/MN/goc-nhin-toan-canh/assets/js/tarot/tarot-effects.js
function flyCard(fromEl, toEl, options = {}) {
  if (!fromEl || !toEl) {
    console.warn("[TarotEffects] flyCard missing element");
    return;
  }
  const {
    duration = 600,
    rotate = 0,
    scale = 0.95,
    onComplete
  } = options;
  const fromRect = fromEl.getBoundingClientRect();
  const toRect = toEl.getBoundingClientRect();
  const dx = toRect.left + toRect.width / 2 - (fromRect.left + fromRect.width / 2);
  const dy = toRect.top + toRect.height / 2 - (fromRect.top + fromRect.height / 2);
  const img = fromEl.tagName === "IMG" ? fromEl : fromEl.querySelector("img");
  if (!img) {
    console.warn("[TarotEffects] no image to fly", fromEl);
    return;
  }
  const wrapper = document.createElement("div");
  wrapper.className = "tarot-fly-snake";
  wrapper.style.position = "fixed";
  wrapper.style.left = `${fromRect.left}px`;
  wrapper.style.top = `${fromRect.top}px`;
  wrapper.style.width = `${fromRect.width}px`;
  wrapper.style.height = `${fromRect.height}px`;
  wrapper.style.pointerEvents = "none";
  wrapper.style.zIndex = "9999";
  wrapper.style.willChange = "transform";
  const head = img.cloneNode(true);
  head.className = "tarot-fly-head";
  wrapper.appendChild(head);
  const SEGMENTS = 5;
  for (let i = 1; i <= SEGMENTS; i++) {
    const seg = img.cloneNode(true);
    seg.className = `tarot-fly-seg seg-${i}`;
    wrapper.appendChild(seg);
  }
  document.body.appendChild(wrapper);
  requestAnimationFrame(() => {
    wrapper.style.transition = `transform ${duration}ms cubic-bezier(.4,0,.2,1)`;
    wrapper.style.transform = `
      translate(${dx}px, ${dy}px)
      scale(${scale})
      rotate(${rotate}deg)
    `.trim();
  });
  wrapper.addEventListener(
    "transitionend",
    () => {
      wrapper.remove();
      onComplete && onComplete();
    },
    { once: true }
  );
}
function flyCardToSlot(fromEl, slotEl, options = {}) {
  if (!slotEl) return;
  flyCard(fromEl, slotEl, options);
}
function rand(min, max) {
  return min + Math.random() * (max - min);
}
function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}
function ensureShuffleStage(deckB) {
  const stage = deckB.querySelector("[data-shuffle-stage]") || deckB.querySelector(".tarot-shuffle-stage");
  if (!stage) return null;
  const cs = getComputedStyle(stage);
  if (cs.position === "static") {
    stage.style.position = "absolute";
    stage.style.inset = "0";
  }
  stage.style.pointerEvents = "none";
  stage.style.overflow = "visible";
  stage.style.zIndex = "5";
  return stage;
}
function clearStage(stage) {
  if (!stage) return;
  stage.innerHTML = "";
}
function spawnStageGhosts(deckB, stage, count = 12) {
  const img = deckB.querySelector(".tarot-deck img") || deckB.querySelector("img");
  if (!img) return [];
  const ghosts = [];
  const W = deckB.clientWidth || 80;
  const H = deckB.clientHeight || 120;
  for (let i = 0; i < count; i++) {
    const g = img.cloneNode(true);
    g.className = "tarot-shuffle-ghost";
    g.style.position = "absolute";
    g.style.left = "50%";
    g.style.top = "50%";
    g.style.width = "100%";
    g.style.height = "100%";
    g.style.transform = "translate(-50%, -50%)";
    g.style.opacity = String(rand(0.35, 0.85));
    g.style.pointerEvents = "none";
    g.style.willChange = "transform, opacity";
    g.style.filter = "blur(0.15px)";
    g.__seed = {
      a: rand(0, Math.PI * 2),
      s: rand(0.9, 1.8),
      rx: rand(W * 0.15, W * 0.75),
      ry: rand(H * 0.12, H * 0.65),
      rot: rand(-40, 40),
      sc: rand(0.92, 1.04),
      pop: rand(0.6, 1.2)
    };
    stage.appendChild(g);
    ghosts.push(g);
  }
  return ghosts;
}
function startShuffle(deckB) {
  if (!deckB) return;
  if (TarotState.deckLocked) {
    console.warn("[TarotEffects] deck locked \u2013 shuffle aborted");
    return;
  }
  if (deckB.__shuffleActive) return;
  deckB.__shuffleActive = true;
  deckB.classList.add("is-shuffling");
  const slotCount = document.querySelectorAll(".tarot-spread-slot")?.length || 3;
  TarotState.spreadOrientation = Array.from(
    { length: slotCount },
    () => Math.random() < 0.5
  );
  console.log(
    "[TarotEffects] orientation prepared:",
    TarotState.spreadOrientation
  );
  deckB.__shuffleTimer = setInterval(() => {
    if (TarotState.deckLocked) {
      stopShuffle(deckB);
      return;
    }
    const r = (Math.random() - 0.5) * 18;
    const x = (Math.random() - 0.5) * 14;
    const y = (Math.random() - 0.5) * 10;
    deckB.style.transform = `translate(${x}px, ${y}px) rotate(${r}deg)`;
  }, 70);
  const stage = ensureShuffleStage(deckB);
  if (!stage) {
    console.warn("[TarotEffects] shuffle stage not found \u2013 shake only");
    console.log("[TarotEffects] shuffle started");
    return;
  }
  clearStage(stage);
  const count = clamp(deckB.__ghostCount || 12, 8, 16);
  const ghosts = spawnStageGhosts(deckB, stage, count);
  deckB.__shuffleStage = stage;
  deckB.__shuffleGhosts = ghosts;
  const tick = () => {
    if (!deckB.__shuffleActive || TarotState.deckLocked) {
      stopShuffle(deckB);
      return;
    }
    const W = deckB.clientWidth || 80;
    const H = deckB.clientHeight || 120;
    for (const g of deckB.__shuffleGhosts || []) {
      const s = g.__seed;
      if (!s) continue;
      s.a += 0.12 * s.s;
      const dx = Math.sin(s.a) * s.rx * s.pop + rand(-6, 6);
      const dy = Math.cos(s.a * 1.35) * s.ry * s.pop + rand(-6, 6);
      const rot = s.rot + Math.sin(s.a * 1.8) * 30;
      const sc = s.sc + Math.sin(s.a * 1.6) * 0.05;
      const cdx = clamp(dx, -W * 0.85, W * 0.85);
      const cdy = clamp(dy, -H * 0.75, H * 0.75);
      g.style.transform = `
        translate(-50%, -50%)
        translate(${cdx}px, ${cdy}px)
        rotate(${rot}deg)
        scale(${sc})
      `.trim();
    }
    deckB.__shuffleRAF = requestAnimationFrame(tick);
  };
  deckB.__shuffleRAF = requestAnimationFrame(tick);
  console.log("[TarotEffects] shuffle started");
}
function stopShuffle(deckB) {
  if (!deckB) return;
  deckB.__shuffleActive = false;
  clearInterval(deckB.__shuffleTimer);
  deckB.__shuffleTimer = null;
  if (deckB.__shuffleRAF) {
    cancelAnimationFrame(deckB.__shuffleRAF);
    deckB.__shuffleRAF = null;
  }
  deckB.classList.remove("is-shuffling");
  deckB.style.transform = "none";
  if (deckB.__shuffleStage) {
    clearStage(deckB.__shuffleStage);
  }
  deckB.__shuffleGhosts = [];
  deckB.__shuffleStage = null;
  console.log("[TarotEffects] shuffle stopped");
}

// ns-hugo-imp:/Users/MN/goc-nhin-toan-canh/assets/js/tarot/tarot-spread-illusion.js
function rand2(min, max) {
  return min + Math.random() * (max - min);
}
function runSpreadIllusion({
  fromEl,
  // nơi lấy img
  originEl = null,
  // nơi xuất phát (ưu tiên)
  slots,
  ghostCount = 8,
  duration = 900,
  onComplete
}) {
  if (!fromEl || !slots || !slots.length) {
    console.warn("[SpreadIllusion] missing elements");
    onComplete && onComplete();
    return;
  }
  const img = fromEl.querySelector("img") || fromEl;
  if (!img) {
    console.warn("[SpreadIllusion] no image");
    onComplete && onComplete();
    return;
  }
  const fr = (originEl || fromEl).getBoundingClientRect();
  slots.forEach((slot, index) => {
    slot.dataset.deckIndex = index;
  });
  const targets = [];
  for (let i = 0; i < ghostCount; i++) {
    const idx = Math.floor(i * slots.length / ghostCount);
    targets.push(slots[idx]);
  }
  let finished = 0;
  targets.forEach((slot, i) => {
    const tr = slot.getBoundingClientRect();
    const ghost = img.cloneNode(true);
    ghost.className = "tarot-spread-ghost";
    ghost.style.position = "fixed";
    ghost.style.left = `${fr.left}px`;
    ghost.style.top = `${fr.top}px`;
    ghost.style.width = `${fr.width}px`;
    ghost.style.height = `${fr.height}px`;
    ghost.style.pointerEvents = "none";
    ghost.style.zIndex = "9999";
    ghost.style.opacity = "0.85";
    ghost.style.transition = `
      transform ${duration}ms cubic-bezier(.4,0,.2,1),
      opacity ${duration * 0.8}ms ease
    `;
    document.body.appendChild(ghost);
    const dx = tr.left + tr.width / 2 - (fr.left + fr.width / 2);
    const dy = tr.top + tr.height / 2 - (fr.top + fr.height / 2);
    const rotate = rand2(-18, 18);
    const delay = i * 70;
    setTimeout(() => {
      ghost.style.transform = `
        translate(${dx}px, ${dy}px)
        rotate(${rotate}deg)
      `;
      ghost.style.opacity = "0";
    }, delay);
    ghost.addEventListener(
      "transitionend",
      () => {
        ghost.remove();
        finished++;
        if (finished === targets.length) {
          onComplete && onComplete();
        }
      },
      { once: true }
    );
  });
}

// ns-hugo-imp:/Users/MN/goc-nhin-toan-canh/assets/js/tarot/tarot-flow.js
function initTarotFlow() {
  if (!TarotMap.btnShuffle) return;
  const ALLOW_SHUFFLE_PHASE = ["idle", "toShuffle"];
  TarotMap.btnShuffle.addEventListener("click", () => {
    if (!ALLOW_SHUFFLE_PHASE.includes(TarotState.phase)) {
      console.warn("[TarotFlow] shuffle blocked, phase:", TarotState.phase);
      return;
    }
    console.log("[TarotFlow] shuffle clicked");
    TarotState.phase = "toShuffle";
    flyCard(TarotMap.deckA, TarotMap.deckB, {
      rotate: 12,
      onComplete() {
        document.dispatchEvent(new CustomEvent("tarot:camera:focus", {
          detail: {
            y: TarotMap.deckB.getBoundingClientRect().top + TarotMap.deckB.getBoundingClientRect().height / 2
          }
        }));
        TarotMap.deckA.classList.add("is-hidden");
        if (TarotMap.btnShuffle) {
          TarotMap.hideShuffleButton();
        }
        TarotMap.deckB.classList.add("is-visible");
        requestAnimationFrame(() => {
          TarotState.phase = "shuffling";
          startShuffle(TarotMap.deckB);
        });
        setTimeout(() => {
          stopShuffle(TarotMap.deckB);
          TarotState.phase = "toSpread";
          const flat = document.querySelector(".tarot-flat-deck");
          if (!flat) {
            console.warn("[TarotFlow] no flat deck (.tarot-flat-deck)");
            return;
          }
          const from = TarotMap.deckB;
          const img = from.tagName === "IMG" ? from : from.querySelector("img");
          if (!img) {
            console.warn("[TarotFlow] no card image to fly");
            return;
          }
          const frFrom = from.getBoundingClientRect();
          const frFlat = flat.getBoundingClientRect();
          document.dispatchEvent(new CustomEvent("tarot:camera:focus", {
            detail: {
              y: frFlat.top + frFlat.height / 2
            }
          }));
          const ghost = img.cloneNode(true);
          ghost.style.position = "fixed";
          ghost.style.left = `${frFrom.left}px`;
          ghost.style.top = `${frFrom.top}px`;
          ghost.style.width = `${frFrom.width}px`;
          ghost.style.height = `${frFrom.height}px`;
          ghost.style.pointerEvents = "none";
          ghost.style.zIndex = "9999";
          ghost.style.transition = "transform 700ms cubic-bezier(.4,0,.2,1)";
          document.body.appendChild(ghost);
          const dx = frFlat.left + frFlat.width / 2 - (frFrom.left + frFrom.width / 2);
          const dy = frFlat.top + frFlat.height / 2 - (frFrom.top + frFrom.height / 2);
          requestAnimationFrame(() => {
            ghost.style.transform = `translate(${dx}px, ${dy}px) rotate(-6deg)`;
          });
          ghost.addEventListener(
            "transitionend",
            () => {
              ghost.remove();
              TarotMap.deckB.classList.remove("is-visible");
              const slots = document.querySelectorAll(".tarot-spread-slot");
              if (!slots.length) {
                console.warn("[TarotFlow] no spread slots");
                return;
              }
              runSpreadIllusion({
                fromEl: TarotMap.deckB,
                originEl: flat,
                slots,
                ghostCount: 8,
                duration: 900,
                onComplete() {
                  const spreadArea = document.querySelector(".tarot-spread-area");
                  if (spreadArea) {
                    const r = spreadArea.getBoundingClientRect();
                    document.dispatchEvent(new CustomEvent("tarot:camera:focus", {
                      detail: {
                        y: r.top + r.height / 2
                      }
                    }));
                  }
                  const cardBackSrc = TarotMap.deckB.querySelector("img")?.src;
                  if (cardBackSrc) {
                    populateSpreadSlots(slots, cardBackSrc);
                  } else {
                    console.warn("[TarotFlow] no card back src");
                  }
                  TarotMap.deckC.classList.add("is-visible");
                  TarotMap.deckC.classList.add("is-interactive");
                  document.querySelector(".tarot-spread-area")?.classList.add("is-interactive");
                  TarotState.phase = "spread";
                  console.log("[TarotFlow] spread ready");
                  document.dispatchEvent(
                    new CustomEvent("tarot:ritual-complete")
                  );
                }
              });
            },
            { once: true }
          );
        }, 4e3);
      }
    });
  });
  window.addEventListener("tarot:reveal:done", () => {
    if (!TarotState.hasViewedReading) {
      TarotState.markReadingViewed();
    }
  });
}
function populateSpreadSlots(slots, cardBackSrc) {
  const orientation = TarotState.spreadOrientation || [];
  slots.forEach((slot, index) => {
    if (slot.querySelector("img")) return;
    const img = document.createElement("img");
    img.src = cardBackSrc;
    img.alt = "Tarot card";
    img.className = "tarot-card-back";
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.display = "block";
    if (orientation[index] === true) {
      img.style.transform = "rotate(180deg)";
    } else {
      img.style.transform = "none";
    }
    img.style.opacity = "0";
    img.style.transition = "opacity 200ms ease, transform 200ms ease";
    slot.appendChild(img);
    requestAnimationFrame(() => {
      img.style.opacity = "1";
    });
  });
}

// ns-hugo-imp:/Users/MN/goc-nhin-toan-canh/assets/js/tarot/tarot-spread-layout.js
function createTarotSpreadLayout({
  container,
  cardCount = 78,
  // kích thước card – đúng với UI hiện tại
  cardWidth = 72,
  cardHeight = 120,
  // độ xoè & giãn
  arc = 140,
  // độ mở quạt
  spreadFactor = 1.25,
  // giãn ngang (khoảng cách lá)
  // 🔥 danh sách slug (78 lá)
  slugs = []
} = {}) {
  if (!container) {
    console.warn("[TarotSpreadLayout] container not found");
    return;
  }
  container.innerHTML = "";
  container.classList.add("tarot-spread-layout");
  const area = container.closest(".tarot-spread-area");
  if (!area) {
    console.warn("[TarotSpreadLayout] tarot-spread-area not found");
    return;
  }
  const rect = area.getBoundingClientRect();
  const W = rect.width;
  const H = rect.height;
  if (!W || !H) {
    console.warn("[TarotSpreadLayout] invalid spread area size", { W, H });
    return;
  }
  const start = -arc / 2;
  const step = cardCount > 1 ? arc / (cardCount - 1) : 0;
  for (let i = 0; i < cardCount; i++) {
    const angle = start + step * i;
    const rad = angle * Math.PI / 180;
    const x = Math.sin(rad) * (W / 2 - cardWidth) * spreadFactor;
    const y = (1 - Math.cos(rad)) * (H - cardHeight);
    const slot = document.createElement("div");
    slot.className = "tarot-spread-slot";
    slot.dataset.index = i;
    if (slugs[i]) {
      slot.dataset.slug = slugs[i];
    }
    slot.style.position = "absolute";
    slot.style.left = "50%";
    slot.style.top = "0";
    slot.style.width = `${cardWidth}px`;
    slot.style.height = `${cardHeight}px`;
    slot.style.transform = `
      translate(${x}px, ${y}px)
      rotate(${angle}deg)
    `;
    slot.style.transformOrigin = "center top";
    container.appendChild(slot);
  }
  console.log("[TarotSpreadLayout] FINAL spread rendered:", cardCount);
}

// ns-hugo-imp:/Users/MN/goc-nhin-toan-canh/assets/js/tarot/tarot-data.js
var TAROT_CARDS = null;
async function loadTarotData() {
  if (TAROT_CARDS) return TAROT_CARDS;
  const res = await fetch("/tarot/index.json");
  if (!res.ok) throw new Error("Failed to load tarot data");
  TAROT_CARDS = await res.json();
  console.log("[TarotData] loaded", TAROT_CARDS.length);
  return TAROT_CARDS;
}
function getTarotCardBySlug(slug) {
  if (!slug || !TAROT_CARDS) return null;
  return TAROT_CARDS.find((c) => c.slug === slug) || null;
}

// ns-hugo-imp:/Users/MN/goc-nhin-toan-canh/assets/js/tarot/tarot-pick.js
function initTarotPick() {
  const spreadArea = TarotMap.deckC;
  if (!spreadArea) return;
  const slots = document.querySelectorAll(".tarot-slot[data-slot]");
  if (!slots.length) return;
  TarotState.selected = TarotState.selected || [];
  spreadArea.addEventListener("click", (e) => {
    if (TarotState._resetting) {
      console.warn("[TarotPick] blocked during reset");
      return;
    }
    const slotEl = e.target.closest(".tarot-spread-slot");
    if (!slotEl) return;
    if (TarotState.selected.length >= 3) return;
    if (slotEl.classList.contains("is-picked") || slotEl.style.pointerEvents === "none") return;
    const img = slotEl.querySelector("img");
    if (!img) return;
    const cardSlug = slotEl.dataset.slug;
    if (!cardSlug) return;
    const cardData = getTarotCardBySlug(cardSlug);
    if (!cardData) return;
    const pickIndex = TarotState.selected.length;
    const targetSlot = slots[pickIndex];
    if (!targetSlot) return;
    const deckIndex = slotEl.dataset.deckIndex !== void 0 ? Number(slotEl.dataset.deckIndex) : null;
    const isReversed = deckIndex !== null ? TarotState.spreadOrientation?.[deckIndex] : false;
    const fromRect = img.getBoundingClientRect();
    const toRect = targetSlot.getBoundingClientRect();
    document.dispatchEvent(
      new CustomEvent("tarot:camera:focus", {
        detail: {
          y: toRect.top + toRect.height / 2
        }
      })
    );
    const ghost = img.cloneNode(true);
    ghost.style.position = "fixed";
    ghost.style.left = `${fromRect.left}px`;
    ghost.style.top = `${fromRect.top}px`;
    ghost.style.width = `${fromRect.width}px`;
    ghost.style.height = `${fromRect.height}px`;
    ghost.style.zIndex = "9999";
    ghost.style.pointerEvents = "none";
    ghost.style.transition = "transform 600ms cubic-bezier(.4,0,.2,1)";
    document.body.appendChild(ghost);
    const dx = toRect.left + toRect.width / 2 - (fromRect.left + fromRect.width / 2);
    const dy = toRect.top + toRect.height / 2 - (fromRect.top + fromRect.height / 2);
    requestAnimationFrame(() => {
      ghost.style.transform = `translate(${dx}px, ${dy}px) scale(0.95)`;
    });
    ghost.addEventListener("transitionend", () => {
      ghost.remove();
      const pickedImg = document.createElement("img");
      pickedImg.src = cardData.image;
      pickedImg.alt = cardData.title;
      pickedImg.style.width = "100%";
      pickedImg.style.height = "100%";
      pickedImg.style.display = "block";
      if (isReversed) {
        pickedImg.style.transform = "rotate(180deg)";
      }
      targetSlot.innerHTML = "";
      targetSlot.appendChild(pickedImg);
      targetSlot.dataset.slug = cardSlug;
      targetSlot.dataset.reversed = isReversed ? "1" : "0";
      slotEl.classList.add("is-picked");
      slotEl.style.opacity = "0.35";
      slotEl.style.pointerEvents = "none";
      TarotState.selected.push({
        slug: cardSlug,
        title: cardData.title,
        position: ["past", "present", "future"][pickIndex],
        reversed: isReversed
      });
      if (TarotState.selected.length === 3) {
        spreadArea.classList.remove("is-interactive");
        const btn = document.getElementById("btn-reading");
        if (btn) {
          btn.disabled = false;
          btn.classList.remove("is-disabled");
        }
        const after = document.querySelector("[data-tarot-after]");
        if (after) after.style.pointerEvents = "auto";
        const reading = document.getElementById("reading-content");
        if (reading) reading.classList.add("hidden");
        if (btn) {
          const r = btn.getBoundingClientRect();
          document.dispatchEvent(
            new CustomEvent("tarot:camera:focus", {
              detail: {
                y: r.top + r.height / 2
              }
            })
          );
        }
      }
    }, { once: true });
  });
}

// ns-hugo-imp:/Users/MN/goc-nhin-toan-canh/assets/js/tarot/tarot-reading.js
function initTarotReading() {
  const btn = document.getElementById("btn-reading");
  if (!btn) return;
  btn.addEventListener("click", () => {
    if (!TarotState.selected || TarotState.selected.length !== 3) return;
    if (TarotState.hasViewedReading) {
      console.warn("[TarotReading] reading already viewed \u2013 blocked");
      return;
    }
    console.log("[TarotReading] reveal start");
    window.dispatchEvent(new CustomEvent("tarot:reveal:start"));
  });
  window.addEventListener("tarot:reveal:done", renderReading);
  window.addEventListener("tarot:reveal:start", () => {
    playRitualOverlay({ duration: 5e3 });
  });
}
function playRitualOverlay({ duration = 5e3 } = {}) {
  const overlay = document.getElementById("tarot-overlay");
  if (!overlay) {
    window.dispatchEvent(new CustomEvent("tarot:reveal:done"));
    return;
  }
  overlay.classList.add("is-active");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("overlay-lock");
  setTimeout(() => {
    overlay.classList.remove("is-active");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("overlay-lock");
    window.dispatchEvent(new CustomEvent("tarot:reveal:done"));
  }, duration);
}
function renderReading() {
  console.log("[TarotReading] render reading");
  const container = document.getElementById("reading-content");
  if (!container) return;
  container.innerHTML = "";
  container.classList.remove("hidden");
  const labels = ["Qu\xE1 kh\u1EE9", "Hi\u1EC7n t\u1EA1i", "H\u01B0\u1EDBng \u0111i"];
  TarotState.selected.forEach((sel, i) => {
    const card = getTarotCardBySlug(sel.slug);
    if (!card || !card.reading) return;
    const position = sel.position;
    const readingBlock = card.reading[position];
    if (!readingBlock) return;
    const text = sel.reversed ? readingBlock.reversed || readingBlock.upright : readingBlock.upright;
    const section = document.createElement("section");
    section.className = "tarot-reading-section";
    section.innerHTML = `
      <h3>
        ${labels[i]} \u2013 ${card.title}
        ${sel.reversed ? " (Ng\u01B0\u1EE3c)" : ""}
      </h3>
      <div class="tarot-reading-text">
        ${text}
      </div>
    `;
    container.appendChild(section);
  });
  container.scrollIntoView({ behavior: "smooth", block: "start" });
  console.log("[TarotReading] reading rendered");
  document.dispatchEvent(new CustomEvent("tarot:reading-rendered"));
  TarotState.markReadingViewed();
  const btn = document.getElementById("btn-reading");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Lu\u1EADn gi\u1EA3i \u0111\xE3 \u0111\u01B0\u1EE3c hi\u1EC3n th\u1ECB";
    btn.classList.add("is-locked");
  }
}

// ns-hugo-imp:/Users/MN/goc-nhin-toan-canh/assets/js/tarot/tarot-overlay.js
var ctx;
var stars = [];
var animationId = null;
var running = false;
var startTime = 0;
var overlayEl = null;
var canvasEl = null;
var contentEl = null;
var planetSystem = null;
var orbits = [];
function initTarotOverlay() {
  overlayEl = document.getElementById("tarot-overlay");
  canvasEl = document.getElementById("stars-canvas");
  contentEl = overlayEl?.querySelector(".overlay-content");
  planetSystem = overlayEl?.querySelector(".planet-system");
  orbits = overlayEl ? Array.from(overlayEl.querySelectorAll(".orbit")) : [];
  if (!overlayEl || !canvasEl || !contentEl || !planetSystem) {
    console.warn("[tarot-overlay] missing overlay elements");
    return;
  }
  ctx = canvasEl.getContext("2d");
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("tarot:reveal:start", showOverlay);
  console.log("[tarot-overlay] ready");
}
function showOverlay() {
  if (running) return;
  overlayEl.classList.add("is-active");
  overlayEl.removeAttribute("hidden");
  overlayEl.setAttribute("aria-hidden", "false");
  let ritualText = overlayEl.querySelector(".ritual-text");
  if (!ritualText) {
    ritualText = document.createElement("div");
    ritualText.className = "ritual-text";
    ritualText.innerHTML = `
      <p>H\xE3y h\xEDt m\u1ED9t h\u01A1i th\u1EADt s\xE2u, bu\xF4ng b\u1ECF m\u1ECDi suy ngh\u0129,</p>
      <p>v\xE0 \u0111\u1EC3 k\u1EBFt n\u1ED1i n\u0103ng l\u01B0\u1EE3ng v\u1EDBi nh\u1EEFng l\xE1 b\xE0i d\u1EABn l\u1ED1i cho b\u1EA1n.</p>
    `;
    overlayEl.appendChild(ritualText);
  }
  ritualText.style.opacity = "0";
  ritualText.style.transition = "opacity 600ms ease";
  ritualText.style.position = "fixed";
  ritualText.style.left = "50%";
  ritualText.style.top = "6%";
  ritualText.style.transform = "translateX(-50%)";
  ritualText.style.textAlign = "center";
  ritualText.style.pointerEvents = "none";
  ritualText.style.zIndex = "40";
  ritualText.style.color = "#fff8e1";
  ritualText.style.fontSize = "1.6rem";
  ritualText.style.fontWeight = "500";
  ritualText.style.letterSpacing = "0.14em";
  ritualText.style.lineHeight = "2";
  ritualText.style.color = "rgba(255, 248, 225, 0.95)";
  ritualText.style.textShadow = `
    0 2px 12px rgba(0,0,0,0.9),
    0 0 22px rgba(255,220,160,0.45),
    0 0 48px rgba(120,160,255,0.18)
  `;
  ritualText.style.filter = `
    drop-shadow(0 0 14px rgba(255,220,160,0.25))
  `;
  ritualText.style.background = "transparent";
  ritualText.style.padding = "0";
  ritualText.style.borderRadius = "0";
  ritualText.style.padding = "18px 28px";
  ritualText.style.borderRadius = "14px";
  ritualText.style.textShadow = `
    0 3px 14px rgba(0,0,0,0.95),
    0 0 28px rgba(255,220,160,0.6)
  `;
  ritualText.style.maxWidth = "1100px";
  ritualText.style.width = "92vw";
  ritualText.style.boxSizing = "border-box";
  contentEl.style.position = "fixed";
  contentEl.style.top = "50%";
  contentEl.style.left = "50%";
  contentEl.style.transform = "translate(-50%, -50%)";
  contentEl.style.margin = "0";
  contentEl.style.padding = "0";
  contentEl.style.filter = "none";
  startTime = Date.now();
  requestAnimationFrame(() => {
    ritualText.style.opacity = "1";
  });
  running = true;
  initStars();
  animate();
}
function initStars() {
  const STAR_COUNT = window.innerWidth < 768 ? 160 : 320;
  const CROSS_STAR_COUNT = Math.floor(STAR_COUNT * 0.08);
  stars = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    const depth = Math.random();
    stars.push({
      type: "dot",
      x: Math.random() * canvasEl.width,
      y: Math.random() * canvasEl.height,
      r: depth < 0.7 ? Math.random() * 0.8 + 0.3 : Math.random() * 1.6 + 0.8,
      baseO: Math.random() * 0.5 + 0.3,
      o: 0,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.6 + 0.4,
      glow: depth < 0.85 ? 0 : 10
    });
  }
  const centerX = canvasEl.width / 2;
  const centerY = canvasEl.height / 2;
  const radiusBase = Math.min(canvasEl.width, canvasEl.height) * 0.35;
  for (let i = 0; i < CROSS_STAR_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = radiusBase * (0.6 + Math.random() * 0.5);
    stars.push({
      type: "cross",
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
      size: Math.random() * 4 + 5,
      baseO: Math.random() * 0.5 + 0.4,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.8 + 0.6,
      /* 🔮 RITUAL PROPERTIES */
      bornAt: Date.now() + 500 + Math.random() * 800,
      // delay xuất hiện
      rotation: Math.random() * Math.PI,
      rotSpeed: (Math.random() * 0.3 - 0.15) * 0.15
    });
  }
}
function animate() {
  if (!running) return;
  drawStars();
  animatePlanetSystem();
  animationId = requestAnimationFrame(animate);
}
function drawStars() {
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  const t = Date.now() * 1e-3;
  stars.forEach((s) => {
    if (s.type === "cross") {
      const now = Date.now();
      if (now < s.bornAt) return;
    }
    const pulse = Math.pow(
      Math.sin(t * s.speed * 1.6 + s.phase) * 0.5 + 0.5,
      0.6
    );
    let opacity = s.baseO * (0.6 + pulse * 0.8);
    if (s.type === "cross") {
      const age = Math.min(1, (Date.now() - s.bornAt) / 600);
      opacity *= age;
    }
    if (s.type === "dot") {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${opacity})`;
      if (s.glow) {
        ctx.shadowBlur = s.glow;
        ctx.shadowColor = "rgba(160,180,255,0.6)";
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.fill();
    }
    if (s.type === "cross") {
      drawCrossStar(s, opacity, pulse);
    }
  });
  ctx.shadowBlur = 0;
}
function drawCrossStar(s, opacity, pulse) {
  const size = s.size * (0.85 + pulse * 0.9);
  const long = size;
  const short = size * 0.35;
  ctx.save();
  ctx.translate(s.x, s.y);
  s.rotation += s.rotSpeed;
  ctx.rotate(s.rotation);
  ctx.strokeStyle = `rgba(180,200,255,${opacity * 0.7})`;
  ctx.lineWidth = 1;
  ctx.shadowBlur = 10;
  ctx.shadowColor = "rgba(140,170,255,0.45)";
  ctx.beginPath();
  ctx.moveTo(0, -long);
  ctx.lineTo(0, long);
  ctx.moveTo(-short, 0);
  ctx.lineTo(short, 0);
  ctx.stroke();
  const coreRadius = size * 0.2;
  const coreGlow = 20 + pulse * 28;
  ctx.beginPath();
  ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255,230,190,${opacity * (1 + pulse * 0.5)})`;
  ctx.shadowBlur = coreGlow;
  ctx.shadowColor = "rgba(255,200,140,0.9)";
  ctx.fill();
  ctx.restore();
}
function animatePlanetSystem() {
  if (!planetSystem) return;
  const t = Date.now() * 1e-3;
  planetSystem.style.width = "90vmin";
  planetSystem.style.height = "90vmin";
  planetSystem.style.position = "relative";
  planetSystem.style.margin = "0";
  planetSystem.style.filter = "none";
  const planet = planetSystem.querySelector(".planet");
  if (planet) {
    planet.style.width = "40%";
    planet.style.height = "40%";
    const scale = 1.05 + Math.sin(t * 1.2) * 0.08;
    planet.style.transform = `scale(${scale})`;
    planet.style.filter = "brightness(1)";
    planet.style.boxShadow = "none";
  }
  orbits.forEach((orbit, i) => {
    const speed = i === 0 ? 0.35 : -0.25;
    const angle = t * speed;
    const depth = (Math.sin(t * speed) + 1) / 2;
    orbit.style.transform = `rotate(${angle}rad)`;
    orbit.style.zIndex = Math.round(depth * 10);
    const moon = orbit.querySelector(".moon");
    if (moon) {
      moon.style.width = "20%";
      moon.style.height = "20%";
      const scale = 1.1 + depth * 0.5;
      const blur = (1 - depth) * 1.2;
      moon.style.transform = `
        translate(-50%, -50%)
        translateX(${i === 0 ? "58%" : "72%"})
        scale(${scale})
      `;
      moon.style.filter = `blur(${blur}px) brightness(1.05)`;
      moon.style.boxShadow = "none";
      moon.style.opacity = 0.7 + depth * 0.3;
    }
  });
}
function resizeCanvas() {
  if (!canvasEl) return;
  canvasEl.width = window.innerWidth;
  canvasEl.height = window.innerHeight;
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTarotOverlay);
} else {
  initTarotOverlay();
}

// ns-hugo-imp:/Users/MN/goc-nhin-toan-canh/assets/js/tarot/tarot-camera.js
var TarotCamera = {
  stageEl: null,
  paddingDesktop: 80,
  paddingMobile: 120,
  mobileBreakpoint: 768,
  init(stageSelector) {
    this.stageEl = document.querySelector(stageSelector);
    if (!this.stageEl) {
      console.warn("[TarotCamera] Stage element not found:", stageSelector);
      return;
    }
    this.bindEvents();
    console.log("[TarotCamera] Initialized");
  },
  getPadding() {
    return window.innerWidth <= this.mobileBreakpoint ? this.paddingMobile : this.paddingDesktop;
  },
  /**
   * 🎥 Camera assist theo VIEWPORT (KHÔNG theo stage)
   * targetY: viewport-based Y
   */
  ensureVisible(targetY) {
    const padding = this.getPadding();
    const viewportTop = 0 + padding;
    const viewportBottom = window.innerHeight - padding;
    console.group("[TarotCamera] ensureVisible");
    console.log("targetY:", targetY);
    console.log("viewportTop:", viewportTop);
    console.log("viewportBottom:", viewportBottom);
    if (targetY < viewportTop) {
      console.log("\u2B06\uFE0F scroll UP");
      window.scrollBy({
        top: targetY - viewportTop,
        behavior: "smooth"
      });
    } else if (targetY > viewportBottom) {
      console.log("\u2B07\uFE0F scroll DOWN");
      window.scrollBy({
        top: targetY - viewportBottom,
        behavior: "smooth"
      });
    } else {
      console.log("\u23F9\uFE0F NO SCROLL (target inside viewport)");
    }
    console.groupEnd();
  },
  scrollToReading(selector = "#tarot-reading") {
    const el = document.querySelector(selector);
    if (!el) {
      console.warn("[TarotCamera] reading section not found:", selector);
      return;
    }
    el.scrollIntoView({
      behavior: "instant",
      block: "start"
    });
  },
  bindEvents() {
    document.addEventListener("tarot:camera:focus", (e) => {
      if (typeof e.detail?.y === "number") {
        this.ensureVisible(e.detail.y);
      }
    });
    document.addEventListener("tarot:camera:to-reading", () => {
      this.scrollToReading();
    });
    document.addEventListener("tarot:camera:anchor", (e) => {
      const selector = e.detail?.selector;
      if (!selector) return;
      const el = document.querySelector(selector);
      if (!el) return;
      const r = el.getBoundingClientRect();
      this.ensureVisible(r.top + r.height / 2);
    });
  }
};

// <stdin>
console.log("[TarotMap] bundle loaded");
function showAfterStage() {
  const after = document.querySelector("[data-tarot-after]");
  if (!after) {
    console.warn("[TarotMap] after-stage not found");
    return false;
  }
  after.classList.remove("hidden");
  after.style.display = "block";
  after.style.visibility = "visible";
  after.style.opacity = "1";
  console.log("[TarotMap] after-stage shown");
  return true;
}
function hideAfterStage() {
  const reading = document.getElementById("reading-content");
  if (reading) {
    reading.innerHTML = "";
    reading.classList.add("hidden");
  }
  const btnReading = document.getElementById("btn-reading");
  if (btnReading) {
    btnReading.disabled = true;
    btnReading.classList.add("is-disabled");
  }
  const after = document.querySelector("[data-tarot-after]");
  if (!after) return false;
  after.classList.add("hidden");
  after.style.display = "";
  after.style.visibility = "";
  after.style.opacity = "";
  console.log("[TarotMap] after-stage hidden");
  return true;
}
function showResetButton() {
  const btn = document.querySelector("#btn-reset");
  if (!btn) {
    console.warn("[TarotMap] reset button not found");
    return false;
  }
  btn.classList.remove("hidden");
  btn.disabled = false;
  btn.removeAttribute("disabled");
  console.log("[TarotMap] reset button shown");
  return true;
}
function clearSpreadCardsOnly() {
  const slots = document.querySelectorAll(".tarot-spread-slot");
  if (!slots.length) {
    console.warn("[TarotMap] no spread slots to clear");
    return false;
  }
  slots.forEach((s) => s.innerHTML = "");
  console.log("[TarotMap] spread cards cleared, slots kept:", slots.length);
  return true;
  document.querySelectorAll(".tarot-spread-slot").forEach((slot) => {
    slot.classList.remove("is-picked");
    slot.style.pointerEvents = "";
    slot.style.opacity = "";
  });
}
function clearSelectedSlots() {
  const slots = document.querySelectorAll(".tarot-slot[data-slot]");
  if (!slots.length) {
    console.warn("[TarotMap] no selected slots to clear");
    return false;
  }
  slots.forEach((s) => s.innerHTML = "");
  console.log("[TarotMap] selected slots cleared:", slots.length);
  return true;
}
function lockDeckNow(reason = "") {
  if (TarotState.deckLocked) return;
  TarotState.deckLocked = true;
  console.log("[TarotMap] deck locked", reason ? `\u2013 ${reason}` : "");
  TarotMap.hideDeckB();
  document.dispatchEvent(new CustomEvent("tarot:deck-locked"));
}
function unlockDeckNow(reason = "") {
  TarotState.deckLocked = false;
  console.log("[TarotMap] deck unlocked", reason ? `\u2013 ${reason}` : "");
  TarotMap.showDeckB();
  document.dispatchEvent(new CustomEvent("tarot:deck-unlocked"));
}
function handleReset() {
  console.log("[TarotMap] reset handling");
  TarotState._resetting = true;
  unlockDeckNow("reset");
  hideAfterStage();
  clearSpreadCardsOnly();
  clearSelectedSlots();
  document.querySelectorAll(".tarot-spread-slot").forEach((slot) => {
    slot.classList.remove("is-picked");
    slot.style.pointerEvents = "";
    slot.style.opacity = "";
  });
  TarotState.phase = "idle";
  TarotState.selected = [];
  TarotState.reading = null;
  TarotState.spreadOrientation = [];
  TarotState.drawPointer = 0;
  TarotState.hasViewedReading = false;
  const btnReading = document.getElementById("btn-reading");
  if (btnReading) {
    btnReading.disabled = false;
    btnReading.textContent = "Xem lu\u1EADn gi\u1EA3i";
    btnReading.classList.remove("is-locked", "is-disabled");
  }
  TarotMap.deckC?.classList.remove("is-visible", "is-interactive");
  document.querySelector(".tarot-spread-area")?.classList.remove("is-interactive");
  TarotMap.deckB?.classList.remove(
    "is-visible",
    "is-shuffling",
    "active",
    "show"
  );
  if (TarotMap.deckB) TarotMap.deckB.style.display = "";
  TarotMap.showStageTop();
  TarotMap.deckA?.classList.remove("is-hidden");
  TarotMap.showDeckA();
  TarotMap.showShuffleButton();
  const img = document.querySelector("#deck-closed img");
  if (img) img.style.display = "";
  console.log("[TarotMap] reset \u2192 idle UI fully restored");
  document.dispatchEvent(new CustomEvent("tarot:reset"));
  requestAnimationFrame(() => {
    TarotState._resetting = false;
  });
}
document.addEventListener("DOMContentLoaded", async () => {
  console.log("[TarotMap] DOM ready");
  if (!TarotMap.init()) return;
  if (TarotCamera && typeof TarotCamera.init === "function") {
    TarotCamera.init(".tarot-deck-area");
  }
  TarotMap.initDeckCardBack();
  if (!TarotState.phase) TarotState.phase = "idle";
  if (typeof TarotState.deckLocked !== "boolean") TarotState.deckLocked = false;
  const cards = await loadTarotData();
  TarotState.tarotSlugs = cards.map((c) => c.slug);
  console.log("[TarotMap] tarotSlugs ready:", TarotState.tarotSlugs.length);
  const spreadSlots = document.querySelector(".tarot-spread-slots");
  if (!spreadSlots) return;
  createTarotSpreadLayout({
    container: spreadSlots,
    cardCount: 78,
    slugs: TarotState.tarotSlugs
  });
  document.dispatchEvent(new CustomEvent("tarot:spread-layout-ready"));
  TarotMap.effects = {
    flyCard,
    flyCardToSlot,
    startShuffle,
    stopShuffle
  };
  initTarotFlow();
  initTarotPick();
  initTarotReading();
  document.addEventListener("tarot:ritual-complete", () => {
    console.log("[TarotMap] ritual complete event received");
    lockDeckNow("ritual-complete");
    showAfterStage();
    showResetButton();
  });
  document.addEventListener("click", (e) => {
    const btn = e.target.closest('[data-action="reset"]');
    if (!btn) return;
    console.log("[TarotMap] reset clicked");
    handleReset();
  });
  window.__TAROT_MAP__ = {
    state: TarotState,
    map: TarotMap,
    ui: { showAfterStage, hideAfterStage, showResetButton },
    reset: handleReset,
    lockDeckNow,
    unlockDeckNow
  };
  window.TarotState = TarotState;
  console.log("[TarotMap] bootstrap complete");
});
