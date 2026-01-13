/* ======================================================
   TAROT STATE – SINGLE SOURCE OF TRUTH
   Nhẹ – thuần state – không DOM – không effect
   ====================================================== */

export const TarotState = {
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
  phase: 'idle',

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
    // Phase
    this.phase = 'idle'

    // Deck & orientation
    this.deck = []
    this.spreadOrientation = []

    // Selection
    this.selectedIndices = []
    this.selected = []

    // Flags
    this.isShuffling = false
    this.isInteractive = false
    this.deckLocked = false
    this.hasViewedReading = false

    console.log('[TarotState] reset → idle (shuffle available)')
  },

  /* ---------- PHASE ---------- */

  setPhase(next) {
    this.phase = next
    console.log('[TarotState] phase →', next)
  },

  isIdle() {
    return this.phase === 'idle'
  },

  isShufflingPhase() {
    return this.phase === 'shuffling'
  },

  isReady() {
    return this.phase === 'ready'
  },

  /* ---------- DECK ---------- */

  initDeck(cards) {
    this.deck = cards
    this.deckLocked = false
    this.isShuffling = false

    console.log('[TarotState] deck initialized:', cards.length)
  },

  lockDeck() {
    this.deckLocked = true
  },

  unlockDeck() {
    this.deckLocked = false
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
    )

    console.log(
      '[TarotState] spread orientation prepared:',
      this.spreadOrientation.length
    )
  },

  getOrientation(index) {
    return !!this.spreadOrientation[index]
  },

  /* ---------- INTERACTION ---------- */

  enableInteraction() {
    this.isInteractive = true
  },

  disableInteraction() {
    this.isInteractive = false
  },

  /* ---------- SELECT ---------- */

  selectCard(index) {
    if (!this.isInteractive) return
    if (this.selectedIndices.includes(index)) return

    this.selectedIndices.push(index)
    console.log('[TarotState] card selected:', index)
  },

  /* ---------- CHECK ---------- */

  canSelectMore(max = 3) {
    return this.selectedIndices.length < max
  },

  canShuffle() {
    return (
      this.phase === 'idle' &&
      !this.deckLocked &&
      !this.isShuffling
    )
  },

  /* ---------- READING ---------- */

  canViewReading() {
    return this.phase === 'revealed' && !this.hasViewedReading
  },

  markReadingViewed() {
    this.hasViewedReading = true
    console.log('[TarotState] reading viewed → locked')
  }
}
