/* ======================================================
   TAROT MAP – DOM REFERENCE LAYER (FINAL – FIXED)
   Chỉ map element – không logic – không effect
   ====================================================== */

export const TarotMap = {
  /* =====================
     ELEMENT REFERENCES
     ===================== */

  deckA: null, // deck úp
  deckB: null, // deck xào (STACK – deck-shuffle)
  deckC: null, // deck trải

  btnShuffle: null,
  btnViewReading: null,

  effects: null,

  /* =====================
     INIT
     ===================== */

  init() {
    /* ⚠️ RẤT QUAN TRỌNG:
       deckB PHẢI là #deck-shuffle (.tarot-deck-stack)
       KHÔNG PHẢI .tarot-deck
    */
    this.deckA = document.getElementById('deck-closed')
    this.deckB = document.getElementById('deck-shuffle') // ✅ ĐÚNG
    this.deckC = document.getElementById('deck-spread')

    this.btnShuffle = document.getElementById('btn-shuffle')
    this.btnViewReading = document.getElementById('btn-view-reading')

    if (!this.deckA || !this.deckB || !this.deckC) {
      console.warn('[TarotMap] deck elements missing', {
        A: !!this.deckA,
        B: !!this.deckB,
        C: !!this.deckC
      })
      return false
    }

    return true
  },

  /* =====================
     HELPERS
     ===================== */

  getRect(el) {
    return el?.getBoundingClientRect()
  },

  /* ==================================================
     UI CONTROL – SHUFFLE BUTTON
     ================================================== */

  showShuffleButton() {
    const btn = this.btnShuffle
    if (!btn) {
      console.warn('[TarotMap] shuffle button not found')
      return
    }

    btn.style.display = ''
    btn.style.visibility = ''
    btn.style.opacity = ''
    btn.style.pointerEvents = 'auto'
    btn.disabled = false

    btn.classList.remove('hidden')

    console.log('[TarotMap] shuffle button restored')
  },

  hideShuffleButton() {
    const btn = this.btnShuffle
    if (!btn) return

    btn.style.display = 'none'
    btn.style.pointerEvents = 'none'
    btn.disabled = true
  },

  /* ==================================================
     UI CONTROL – DECK A (CLOSED)
     ================================================== */

  showDeckA() {
    const deck = this.deckA
    if (!deck) {
      console.warn('[TarotMap] deckA not found')
      return
    }

    deck.classList.remove('is-hidden')
    deck.style.display = ''
    deck.style.visibility = ''
    deck.style.opacity = ''

    console.log('[TarotMap] deck A restored')
  },

  /* ==================================================
     INIT DECK A – CARD BACK
     ================================================== */

  initDeckCardBack() {
    const deck = this.deckA
    if (!deck) {
      console.warn('[TarotMap] deckA not found (initDeckCardBack)')
      return false
    }

    // tránh render trùng
    if (deck.querySelector('img')) {
      console.log('[TarotMap] deck card back already mounted')
      return true
    }

    const img = document.createElement('img')
    img.src =
      'https://cdn.jsdelivr.net/gh/cuongpham0212/kho-anh@main/tarot/anh-mat-sau-la-bai-tarot.webp'
    img.alt = 'Tarot Card Back'
    img.className = 'tarot-card-back'

    deck.appendChild(img)

    console.log('[TarotMap] deck card back mounted')
    return true
  },

  /* ==================================================
     UI CONTROL – DECK B (SHUFFLED STACK)
     ================================================== */

  hideDeckB() {
    const deck = this.deckB
    if (!deck) return

    deck.classList.remove('is-visible', 'is-shuffling', 'active', 'show')
    deck.style.display = 'none'
    deck.style.visibility = 'hidden'
    deck.style.opacity = '0'
    deck.style.pointerEvents = 'none'

    console.log('[TarotMap] deck B hidden')
  },

  showDeckB() {
    const deck = this.deckB
    if (!deck) return

    deck.style.display = ''
    deck.style.visibility = ''
    deck.style.opacity = ''
    deck.style.pointerEvents = ''

    deck.classList.remove('is-hidden')

    console.log('[TarotMap] deck B shown')
  },

  /* ==================================================
     UI CONTROL – STAGE TOP / GAME SPACE
     ================================================== */

  showStageTop() {
    const top = document.querySelector('[data-tarot-stage-top]')
    const space = document.querySelector('[data-tarot-space]')

    if (top) {
      top.style.display = ''
      top.style.visibility = ''
      top.style.opacity = ''
      top.style.pointerEvents = 'auto'
    }

    if (space) {
      space.style.display = ''
      space.style.visibility = ''
      space.style.opacity = ''
      space.style.pointerEvents = 'auto'
    }

    console.log('[TarotMap] stage top + game space restored')
  },

  /* ==================================================
   UI CONTROL – VIEW READING BUTTON
   ================================================== */

  lockViewReadingButton() {
    const btn = this.btnViewReading
    if (!btn) return

    btn.disabled = true
    btn.style.pointerEvents = 'none'
    btn.classList.add('is-locked')
  },

  unlockViewReadingButton() {
    const btn = this.btnViewReading
    if (!btn) return

    btn.disabled = false
    btn.style.pointerEvents = 'auto'
    btn.classList.remove('is-locked')
  }
}
