/**
 * ======================================================
 * FILE: deck-closed.js
 * VAI TRÒ:
 * - Quản lý bộ bài úp
 * - Quản lý nút "Xào bài"
 * - Khi click:
 *   + Ẩn nút xào
 *   + Ẩn bộ bài úp
 *   + GỬI tín hiệu bắt đầu xáo
 *
 * LƯU Ý:
 * - File này KHÔNG hiển thị overlay
 * - Overlay do shuffle-overlay.js quản lý
 * ======================================================
 */

/* ================== DOM ELEMENTS ================== */
const deckClosed = document.getElementById('deck-closed');
const shuffleBtn = document.getElementById('tarot-shuffle-btn');

/* ================== STATE ================== */
let hasShuffled = false;

/* ================== INIT ================== */
function initDeckClosed() {
  if (!deckClosed || !shuffleBtn) {
    console.warn('[deck-closed] Thiếu DOM cần thiết');
    return;
  }

  shuffleBtn.addEventListener('click', handleShuffleClick);
  console.log('[deck-closed] ready');
}

/* ================== EVENT HANDLER ================== */
function handleShuffleClick() {
  if (hasShuffled) return;
  hasShuffled = true;

  console.log('[deck-closed] shuffle clicked');

  // 3. 🔥 GỬI TÍN HIỆU BẮT ĐẦU XÀO (EVENT BUS = DOCUMENT)
  document.dispatchEvent(
    new CustomEvent('tarot:shuffle:start', {
      detail: { source: 'deck-closed' }
    })
  );
}

/* ================== AUTO INIT ================== */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDeckClosed);
} else {
  initDeckClosed();
}
