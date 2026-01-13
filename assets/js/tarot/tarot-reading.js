/* ======================================================
   TAROT READING – REVEAL FLOW (FINAL – DATA CORRECT)
   - đọc đúng upright / reversed từ data
   - KHÔNG làm mất luận giải
   ====================================================== */

import { TarotState } from './tarot-state.js'
import { getTarotCardBySlug } from './tarot-data.js'

/* ======================================================
   INIT
   ====================================================== */
export function initTarotReading() {
  const btn = document.getElementById('btn-reading')
  if (!btn) return

  btn.addEventListener('click', () => {
    if (!TarotState.selected || TarotState.selected.length !== 3) return

    if (TarotState.hasViewedReading) {
      console.warn('[TarotReading] reading already viewed – blocked')
      return
    }

    console.log('[TarotReading] reveal start')
    window.dispatchEvent(new CustomEvent('tarot:reveal:start'))
  })

  window.addEventListener('tarot:reveal:done', renderReading)

  window.addEventListener('tarot:reveal:start', () => {
    playRitualOverlay({ duration: 5000 })
  })
}

/* ======================================================
   OVERLAY
   ====================================================== */
function playRitualOverlay({ duration = 5000 } = {}) {
  const overlay = document.getElementById('tarot-overlay')
  if (!overlay) {
    window.dispatchEvent(new CustomEvent('tarot:reveal:done'))
    return
  }

  overlay.classList.add('is-active')
  overlay.setAttribute('aria-hidden', 'false')
  document.body.classList.add('overlay-lock')

  setTimeout(() => {
    overlay.classList.remove('is-active')
    overlay.setAttribute('aria-hidden', 'true')
    document.body.classList.remove('overlay-lock')
    window.dispatchEvent(new CustomEvent('tarot:reveal:done'))
  }, duration)
}

/* ======================================================
   RENDER READING (🔥 FIX GỐC)
   ====================================================== */
function renderReading() {
  console.log('[TarotReading] render reading')

  const container = document.getElementById('reading-content')
  if (!container) return

  container.innerHTML = ''
  container.classList.remove('hidden')

  const labels = ['Quá khứ', 'Hiện tại', 'Hướng đi']

  TarotState.selected.forEach((sel, i) => {
    const card = getTarotCardBySlug(sel.slug)
    if (!card || !card.reading) return

    const position = sel.position // past | present | future
    const readingBlock = card.reading[position]

    if (!readingBlock) return

    // 🔑 ĐIỂM QUAN TRỌNG NHẤT
    const text = sel.reversed
      ? readingBlock.reversed || readingBlock.upright
      : readingBlock.upright

    const section = document.createElement('section')
    section.className = 'tarot-reading-section'

    section.innerHTML = `
      <h3>
        ${labels[i]} – ${card.title}
        ${sel.reversed ? ' (Ngược)' : ''}
      </h3>
      <div class="tarot-reading-text">
        ${text}
      </div>
    `

    container.appendChild(section)
  })

  container.scrollIntoView({ behavior: 'smooth', block: 'start' })

  console.log('[TarotReading] reading rendered')
  document.dispatchEvent(new CustomEvent('tarot:reading-rendered'))
  TarotState.markReadingViewed()

  const btn = document.getElementById('btn-reading')
  if (btn) {
    btn.disabled = true
    btn.textContent = 'Luận giải đã được hiển thị'
    btn.classList.add('is-locked')
  }
}
