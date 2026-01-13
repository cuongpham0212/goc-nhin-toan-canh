/* ======================================================
   TAROT MAP APP – MAIN ENTRY (LIGHTWEIGHT)
   HTML MAP + FLOW BASED
   ====================================================== */

/* ---------- IMPORT ---------- */
import { TarotState } from './tarot-state.js'
import { TarotMap } from './tarot-map.js'
import { initTarotFlow } from './tarot-flow.js'
import { createTarotSpreadLayout } from './tarot-spread-layout.js'
import {
  flyCard,
  flyCardToSlot,
  startShuffle,
  stopShuffle
} from './tarot-effects.js'
import { initTarotPick } from './tarot-pick.js'
import { loadTarotData } from './tarot-data.js'
import { initTarotReading } from './tarot-reading.js'
import '/js/tarot/tarot-overlay.js'
import { TarotCamera } from './tarot-camera.js'

console.log('[TarotMap] bundle loaded')

/* ======================================================
   UI HELPERS
   ====================================================== */

function showAfterStage() {
  const after = document.querySelector('[data-tarot-after]')
  if (!after) {
    console.warn('[TarotMap] after-stage not found')
    return false
  }

  after.classList.remove('hidden')
  after.style.display = 'block'
  after.style.visibility = 'visible'
  after.style.opacity = '1'

  console.log('[TarotMap] after-stage shown')
  return true
}

function hideAfterStage() {
  /* 🔥 RESET UI LUẬN GIẢI TRIỆT ĐỂ */
  const reading = document.getElementById('reading-content')
  if (reading) {
    reading.innerHTML = ''
    reading.classList.add('hidden')
  }

  const btnReading = document.getElementById('btn-reading')
  if (btnReading) {
    btnReading.disabled = true
    btnReading.classList.add('is-disabled')
  }
  const after = document.querySelector('[data-tarot-after]')
  if (!after) return false

  after.classList.add('hidden')
  after.style.display = ''
  after.style.visibility = ''
  after.style.opacity = ''

  console.log('[TarotMap] after-stage hidden')
  return true
}

function showResetButton() {
  const btn = document.querySelector('#btn-reset')
  if (!btn) {
    console.warn('[TarotMap] reset button not found')
    return false
  }

  btn.classList.remove('hidden')
  btn.disabled = false
  btn.removeAttribute('disabled')

  console.log('[TarotMap] reset button shown')
  return true
}

/* ---------- CLEAR SPREAD CARDS ONLY (KEEP SLOTS) ---------- */
function clearSpreadCardsOnly() {
  const slots = document.querySelectorAll('.tarot-spread-slot')
  if (!slots.length) {
    console.warn('[TarotMap] no spread slots to clear')
    return false
  }
  slots.forEach(s => (s.innerHTML = '')) // chỉ xoá ảnh trong slot
  console.log('[TarotMap] spread cards cleared, slots kept:', slots.length)
  return true
  /* ==================================================
   3.5) RESET TRẠNG THÁI PICKED (CỐT LÕI)
   ================================================== */
  document.querySelectorAll('.tarot-spread-slot').forEach(slot => {
    slot.classList.remove('is-picked')
    slot.style.pointerEvents = ''
    slot.style.opacity = ''
  })
}

/* ---------- CLEAR SPREAD LAYOUT (REMOVE SLOTS – RARE USE) ---------- */
function clearSpreadLayout() {
  const container = document.querySelector('.tarot-spread-slots')
  if (!container) {
    console.warn('[TarotMap] spread slots container not found')
    return false
  }

  container.innerHTML = ''
  console.log('[TarotMap] spread layout fully cleared (slots removed)')
  return true
}

/* ---------- CLEAR SELECTED (3 SLOT AFTER-STAGE) ---------- */
function clearSelectedSlots() {
  const slots = document.querySelectorAll('.tarot-slot[data-slot]')
  if (!slots.length) {
    console.warn('[TarotMap] no selected slots to clear')
    return false
  }
  slots.forEach(s => (s.innerHTML = ''))
  console.log('[TarotMap] selected slots cleared:', slots.length)
  return true
}

/* ---------- CLEAR SPREAD (🔥) ---------- */
function resetSpreadSlotsFully() {
  const slots = document.querySelectorAll('.tarot-spread-slot')
  if (!slots.length) {
    console.warn('[TarotMap] no spread slots to reset')
    return false
  }

  slots.forEach((slot, index) => {
    slot.innerHTML = ''                  // xoá ảnh
    slot.removeAttribute('data-card')    // xoá mapping lá
    slot.removeAttribute('data-slug')
    slot.removeAttribute('data-orientation')
    slot.classList.remove('is-filled')
  })

  console.log('[TarotMap] spread slots fully reset:', slots.length)
  return true
}

/* ======================================================
   DECK LOCK (✅ KHÓA ĐÚNG LÚC – SAU NGHI THỨC)
   ====================================================== */

function lockDeckNow(reason = '') {
  if (TarotState.deckLocked) return

  TarotState.deckLocked = true
  console.log('[TarotMap] deck locked', reason ? `– ${reason}` : '')

  // ẩn deck B ngay khi khóa
  TarotMap.hideDeckB()

  document.dispatchEvent(new CustomEvent('tarot:deck-locked'))
}

function unlockDeckNow(reason = '') {
  TarotState.deckLocked = false
  console.log('[TarotMap] deck unlocked', reason ? `– ${reason}` : '')

  TarotMap.showDeckB()

  document.dispatchEvent(new CustomEvent('tarot:deck-unlocked'))
}

/* ======================================================
   RESET HANDLER – FINAL (PICK SAFE)
   ====================================================== */

function handleReset() {
  console.log('[TarotMap] reset handling')

  /* ⛔ CHẶN PICK TRONG TOÀN BỘ RESET */
  TarotState._resetting = true

  /* 1) MỞ KHÓA LOGIC */
  unlockDeckNow('reset')

  /* 2) ẨN AFTER-STAGE */
  hideAfterStage()

  /* 3) CLEAR UI TRẢI BÀI (GIỮ SLOT) */
  clearSpreadCardsOnly()
  clearSelectedSlots()

  /* 🔥 3.5) RESET TRẠNG THÁI PICKED (CỐT LÕI) */
  document.querySelectorAll('.tarot-spread-slot').forEach(slot => {
    slot.classList.remove('is-picked')
    slot.style.pointerEvents = ''
    slot.style.opacity = ''
  })

  /* 4) RESET STATE */
  TarotState.phase = 'idle'
  TarotState.selected = []
  TarotState.reading = null
  TarotState.spreadOrientation = []
  TarotState.drawPointer = 0
  TarotState.hasViewedReading = false

  /* 🔓 RESET VIEW READING BUTTON */
  const btnReading = document.getElementById('btn-reading')
  if (btnReading) {
    btnReading.disabled = false
    btnReading.textContent = 'Xem luận giải'
    btnReading.classList.remove('is-locked', 'is-disabled')
  }

  /* 5) RESET DECK C (SPREAD) */
  TarotMap.deckC?.classList.remove('is-visible', 'is-interactive')
  document
    .querySelector('.tarot-spread-area')
    ?.classList.remove('is-interactive')

  /* 6) RESET DECK B (SHUFFLE) */
  TarotMap.deckB?.classList.remove(
    'is-visible',
    'is-shuffling',
    'active',
    'show'
  )
  if (TarotMap.deckB) TarotMap.deckB.style.display = ''

  /* 7) MỞ LẠI STAGE TOP + GAME SPACE */
  TarotMap.showStageTop()

  /* 8) KHÔI PHỤC DECK A + NÚT XÀO */
  TarotMap.deckA?.classList.remove('is-hidden')
  TarotMap.showDeckA()
  TarotMap.showShuffleButton()

  /* 9) DỌN INLINE STYLE DI SẢN */
  const img = document.querySelector('#deck-closed img')
  if (img) img.style.display = ''

  /* 10) BÁO RESET */
  console.log('[TarotMap] reset → idle UI fully restored')
  document.dispatchEvent(new CustomEvent('tarot:reset'))

  /* ✅ MỞ PICK TRỞ LẠI – SAU KHI DOM ỔN ĐỊNH */
  requestAnimationFrame(() => {
    TarotState._resetting = false
  })
}

/* ======================================================
   BOOTSTRAP – SINGLE SOURCE OF TRUTH
   ====================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[TarotMap] DOM ready')

  /* ---------- INIT MAP ---------- */
  if (!TarotMap.init()) return

  /* ---------- INIT CAMERA (VIEWPORT ASSIST) ---------- */
  if (TarotCamera && typeof TarotCamera.init === 'function') {
    TarotCamera.init('.tarot-deck-area')
  }

  /* ---------- INIT DECK CARD BACK (PHẢI CÓ) ---------- */
  TarotMap.initDeckCardBack()

  /* ---------- INIT STATE ---------- */
  if (!TarotState.phase) TarotState.phase = 'idle'
  if (typeof TarotState.deckLocked !== 'boolean') TarotState.deckLocked = false

  /* ---------- LOAD TAROT DATA ---------- */
  const cards = await loadTarotData()
  TarotState.tarotSlugs = cards.map(c => c.slug)

  console.log('[TarotMap] tarotSlugs ready:', TarotState.tarotSlugs.length)

  /* ---------- RENDER SPREAD LAYOUT (slots rỗng) ---------- */
  const spreadSlots = document.querySelector('.tarot-spread-slots')
  if (!spreadSlots) return

  createTarotSpreadLayout({
    container: spreadSlots,
    cardCount: 78,
    slugs: TarotState.tarotSlugs
  })

  // chỉ báo layout đã có (nếu module khác cần), không lock gì ở đây
  document.dispatchEvent(new CustomEvent('tarot:spread-layout-ready'))

  // ✅ after-stage KHÔNG show sớm nữa (để reading/pick điều khiển)
  // showAfterStage()

  /* ---------- EFFECTS ---------- */
  TarotMap.effects = {
    flyCard,
    flyCardToSlot,
    startShuffle,
    stopShuffle
  }

  /* ---------- INIT FLOW / PICK / READING ---------- */
  initTarotFlow()
  initTarotPick()
  initTarotReading()

  /* ==================================================
     ✅ CHỐT LỖI: CHỈ KHÓA KHI TAROTFLOW BÁO "NGHI THỨC XONG"
     ================================================== */
  document.addEventListener('tarot:ritual-complete', () => {
    console.log('[TarotMap] ritual complete event received')

    // lúc này mới an toàn để khóa deckB + bật UI hậu kỳ
    lockDeckNow('ritual-complete')

    // sau nghi thức, ta mới cho user bước qua phần chọn/xem
    showAfterStage()
    showResetButton()
  })

  /* ---------- RESET CLICK ---------- */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="reset"]')
    if (!btn) return

    console.log('[TarotMap] reset clicked')
    handleReset()
  })

  /* ---------- DEV GLOBAL ---------- */
  window.__TAROT_MAP__ = {
    state: TarotState,
    map: TarotMap,
    ui: { showAfterStage, hideAfterStage, showResetButton },
    reset: handleReset,
    lockDeckNow,
    unlockDeckNow
  }

  window.TarotState = TarotState
  console.log('[TarotMap] bootstrap complete')
})
