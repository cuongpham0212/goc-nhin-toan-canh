/**
 * ======================================================
 * FILE: deck-spread.js
 * VAI TRÒ:
 * - Quản lý bộ bài trải
 * - Cho phép user chọn 3 lá
 * - Hiệu ứng bay lá từ bộ trải → ô card rỗng
 *
 * KHÔNG LÀM:
 * - Không xáo bài
 * - Không overlay
 * - Không luận giải
 * ======================================================
 */

/* ================== DOM ELEMENTS ================== */
const deckSpread = document.getElementById('deck-spread');
const slots = document.querySelectorAll('.tarot-slot');

/* ================== CONFIG ================== */
const TOTAL_CARDS = 12; // số lá hiển thị để chọn
const MAX_SELECT = 3;

/* ================== STATE ================== */
let selectedCount = 0;
let isReady = false;

/* ================== INIT ================== */
function initDeckSpread() {
  if (!deckSpread || !slots.length) {
    console.warn('[deck-spread] Thiếu DOM cần thiết');
    return;
  }

  // Chờ file xáo bài báo xong
  window.addEventListener('tarot:shuffle:done', onShuffleDone);
}

document.addEventListener('DOMContentLoaded', initDeckSpread);

/* ================== EVENT ================== */
function onShuffleDone() {
  isReady = true;
  showSpreadDeck();
  renderCards();
}

/* ================== UI ================== */
function showSpreadDeck() {
  deckSpread.classList.add('is-active');
  deckSpread.setAttribute('aria-hidden', 'false');
}

/* ================== RENDER ================== */
function renderCards() {
  deckSpread.innerHTML = '';

  for (let i = 0; i < TOTAL_CARDS; i++) {
    const card = createSpreadCard(i);
    deckSpread.appendChild(card);
  }
}

/* ================== CARD ================== */
function createSpreadCard(index) {
  const card = document.createElement('div');
  card.className = 'tarot-spread-card';
  card.dataset.index = index;

  card.addEventListener('mouseenter', onCardHover);
  card.addEventListener('mouseleave', onCardLeave);
  card.addEventListener('click', onCardClick);

  return card;
}

/* ================== HOVER ================== */
function onCardHover(e) {
  if (!isReady) return;
  e.currentTarget.classList.add('is-hover');
}

function onCardLeave(e) {
  e.currentTarget.classList.remove('is-hover');
}

/* ================== CLICK ================== */
function onCardClick(e) {
  if (!isReady) return;
  if (selectedCount >= MAX_SELECT) return;

  const card = e.currentTarget;
  const slot = slots[selectedCount];
  if (!slot) return;

  selectedCount++;
  isReady = selectedCount < MAX_SELECT;

  flyCardToSlot(card, slot);
}

/* ================== ANIMATION ================== */
function flyCardToSlot(card, slot) {
  const cardRect = card.getBoundingClientRect();
  const slotRect = slot.getBoundingClientRect();

  // clone để bay
  const flyingCard = card.cloneNode(true);
  flyingCard.classList.add('is-flying');

  document.body.appendChild(flyingCard);

  // vị trí ban đầu
  setPosition(flyingCard, cardRect);

  // ẩn lá gốc
  card.classList.add('is-hidden');

  requestAnimationFrame(() => {
    // bay tới slot
    const dx = slotRect.left - cardRect.left;
    const dy = slotRect.top - cardRect.top;

    flyingCard.style.transform = `translate(${dx}px, ${dy}px) scale(0.9)`;
  });

  // kết thúc bay
  flyingCard.addEventListener('transitionend', () => {
    flyingCard.remove();
    placeCardInSlot(slot);
    checkComplete();
  }, { once: true });
}

/* ================== SLOT ================== */
function placeCardInSlot(slot) {
  const card = document.createElement('div');
  card.className = 'tarot-selected-card';
  slot.appendChild(card);
}

/* ================== COMPLETE ================== */
function checkComplete() {
  if (selectedCount === MAX_SELECT) {
    window.dispatchEvent(new CustomEvent('tarot:select:done'));
  }
}

/* ================== HELPERS ================== */
function setPosition(el, rect) {
  el.style.position = 'fixed';
  el.style.left = `${rect.left}px`;
  el.style.top = `${rect.top}px`;
}
