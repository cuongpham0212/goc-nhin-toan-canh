/**
 * ======================================================
 * FILE: shuffle-overlay.js
 * ======================================================
 */

/* ================== CONFIG ================== */
const CARD_COUNT = 36;
const SHUFFLE_DURATION = 2000;
const FLY_DELAY = 60;

const CARD_WIDTH = 78;
const CARD_HEIGHT = 132;
const GHOST_LIFT = 40;
const GHOST_DURATION = 120;

/* ================== STATE ================== */
let isShuffling = false;

/* ================== EVENT ================== */
document.addEventListener('tarot:shuffle:start', async () => {
  const overlay = document.getElementById('tarot-shuffle-overlay');
  const shuffleStage = overlay?.querySelector('.tarot-shuffle-stage');
  const deckClosed = document.getElementById('deck-closed');
  const deckSpread = document.getElementById('deck-spread');

  if (!overlay || !shuffleStage || !deckClosed || !deckSpread) return;
  if (isShuffling) return;
  isShuffling = true;

  prepareOverlay(overlay, shuffleStage);
  await nextFrame();
  await wait(40);

  await startShuffleSequence({
    overlay,
    shuffleStage,
    deckClosed,
    deckSpread
  });
});

/* ================== MAIN ================== */
async function startShuffleSequence(ctx) {
  await flyCardsFromClosedDeck(ctx);
  await shuffleCards(ctx);
  await flyCardsToSpreadDeck(ctx);
  finishShuffle(ctx);
}

/* ================== PREPARE ================== */
function prepareOverlay(overlay, shuffleStage) {
  overlay.classList.add('is-active');
  overlay.setAttribute('aria-hidden', 'false');
  shuffleStage.innerHTML = '';
}

/* ================== STEP 2 – GHOST BAY THẬT ================== */
async function flyCardsFromClosedDeck({ shuffleStage, deckClosed }) {
  const stageRect = shuffleStage.getBoundingClientRect();
  if (!stageRect.width) return;

  const deckScale = getElementScale(deckClosed);

  for (let i = 0; i < CARD_COUNT; i++) {
    const deckRect = deckClosed.getBoundingClientRect();

    /* ===== 1. TẠO GHOST – ĂN ĐÚNG SCALE DECK ===== */
    const ghost = document.createElement('div');
    ghost.className = 'tarot-shuffle-card tarot-ghost-card';
    ghost.style.position = 'fixed';
    ghost.style.width = `${CARD_WIDTH * deckScale}px`;
    ghost.style.height = `${CARD_HEIGHT * deckScale}px`;
    ghost.style.left =
      `${deckRect.left + deckRect.width / 2 - (CARD_WIDTH * deckScale) / 2}px`;
    ghost.style.top = `${deckRect.top + 6 * deckScale}px`;
    ghost.style.transform = `scale(${deckScale})`;
    ghost.style.transformOrigin = 'top center';
    ghost.style.pointerEvents = 'none';
    ghost.style.zIndex = 999;

    document.body.appendChild(ghost);

    /* ===== 2. GHOST BAY NGẮN – NHANH – RÕ ===== */
    ghost.getBoundingClientRect();
    requestAnimationFrame(() => {
      ghost.style.transition = `transform ${GHOST_DURATION}ms ease-out`;
      ghost.style.transform =
        `translate3d(0, -${GHOST_LIFT * deckScale}px, 0) scale(${deckScale}) rotate(-4deg)`;
    });

    /* ===== 3. CARD THẬT TIẾP NHẬN ĐIỂM CUỐI GHOST ===== */
    const card = document.createElement('div');
    card.className = 'tarot-shuffle-card';
    shuffleStage.appendChild(card);

    const ghostEndPoint = {
      left: deckRect.left + deckRect.width / 2 - CARD_WIDTH / 2,
      top: deckRect.top - GHOST_LIFT * deckScale
    };

    setBasePosition(card, ghostEndPoint, stageRect);

    card.getBoundingClientRect();
    await wait(FLY_DELAY);
    moveToRandom(card);

    /* ===== 4. XOÁ GHOST SAU KHI ĐÃ TRUYỀN VECTOR ===== */
    await wait(GHOST_DURATION);
    ghost.remove();

    await wait(16); // ~1 frame
  }

  fadeOutDeckAndButton(deckClosed);
  await wait(450);
}

/* ================== STEP 3 ================== */
async function shuffleCards({ shuffleStage }) {
  const cards = shuffleStage.querySelectorAll('.tarot-shuffle-card');
  const start = Date.now();

  while (Date.now() - start < SHUFFLE_DURATION) {
    cards.forEach(card => moveToRandom(card, true));
    await wait(260);
  }
}

/* ================== STEP 4 ================== */
async function flyCardsToSpreadDeck({ shuffleStage, deckSpread }) {
  const targetRect = deckSpread.getBoundingClientRect();
  const stageRect = shuffleStage.getBoundingClientRect();
  const cards = Array.from(shuffleStage.children);

  for (const card of cards) {
    await wait(FLY_DELAY);
    moveToTarget(card, targetRect, stageRect);
  }

  await wait(500);
}

/* ================== FINISH ================== */
function finishShuffle({ overlay, shuffleStage }) {
  overlay.classList.remove('is-active');
  overlay.setAttribute('aria-hidden', 'true');
  shuffleStage.innerHTML = '';
  isShuffling = false;
  document.dispatchEvent(new CustomEvent('tarot:shuffle:done'));
}

/* ================== HELPERS ================== */
function getElementScale(el) {
  const tr = getComputedStyle(el).transform;
  if (!tr || tr === 'none') return 1;
  const m = tr.match(/matrix\(([^)]+)\)/);
  if (!m) return 1;
  const [a, b] = m[1].split(',').map(Number);
  return Math.sqrt(a * a + b * b);
}

function setBasePosition(el, fromPoint, stageRect) {
  const x = fromPoint.left - stageRect.left;
  const y = fromPoint.top - stageRect.top;
  el.dataset.baseX = x;
  el.dataset.baseY = y;
  el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
}

function moveToRandom(el, rotate = false) {
  const baseX = +el.dataset.baseX;
  const baseY = +el.dataset.baseY;
  const dx = Math.random() * 220 - 110;
  const dy = Math.random() * 150 - 75;
  const r = rotate ? Math.random() * 160 - 80 : 0;

  el.style.transform =
    `translate3d(${baseX + dx}px, ${baseY + dy}px, 0) rotate(${r}deg)`;
}

function moveToTarget(el, targetRect, stageRect) {
  const x = targetRect.left - stageRect.left;
  const y = targetRect.top - stageRect.top;
  el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
}

function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function nextFrame() {
  return new Promise(r => requestAnimationFrame(r));
}

function fadeOutDeckAndButton(deckClosed) {
  const shuffleBtn = document.getElementById('tarot-shuffle-btn');
  if (!deckClosed) return;

  // deck úp
  deckClosed.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
  deckClosed.style.opacity = '0';
  deckClosed.style.transform = 'scale(0.96)';

  // nút xào bài
  if (shuffleBtn) {
    shuffleBtn.style.transition = 'opacity 0.3s ease';
    shuffleBtn.style.opacity = '0';
    shuffleBtn.style.pointerEvents = 'none';
  }

  // dọn DOM sau khi fade
  setTimeout(() => {
    deckClosed.classList.add('is-hidden');
    if (shuffleBtn) shuffleBtn.classList.add('is-hidden');
  }, 450);
}
