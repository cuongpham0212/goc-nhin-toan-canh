/* ======================================================
   TAROT SPREAD LAYOUT – HORIZONTAL ARC (FINAL)
   - 1 logic spread
   - 1 hoặc 2 visual lanes (auto)
   - không wrap CSS
   - không phá animation / pick
   ====================================================== */

/**
 * Clear spread layout (reset sạch slot)
 */
export function clearTarotSpreadLayout(container) {
  if (!container) return
  container.innerHTML = ''
  container.classList.remove('tarot-spread-layout')
  console.log('[TarotSpreadLayout] cleared')
}

export function createTarotSpreadLayout({
  container,
  cardCount = 78,

  // kích thước card – khớp UI hiện tại
  cardWidth = 72,
  cardHeight = 120,

  // độ xoè & giãn
  arc = 140,            // độ mở quạt (độ)
  spreadFactor = 1.25,  // giãn ngang

  // danh sách slug (78 lá)
  slugs = []
} = {}) {
  if (!container) {
    console.warn('[TarotSpreadLayout] container not found')
    return
  }

  /* ===============================
     RESET & PREPARE
     =============================== */

  container.innerHTML = ''
  container.classList.add('tarot-spread-layout')

  const area = container.closest('.tarot-spread-area')
  if (!area) {
    console.warn('[TarotSpreadLayout] tarot-spread-area not found')
    return
  }

  const rect = area.getBoundingClientRect()
  const W = rect.width
  const H = rect.height

  if (!W || !H) {
    console.warn('[TarotSpreadLayout] invalid spread area size', { W, H })
    return
  }

  /* ===============================
     LANE DECISION (🔑 CỐT LÕI)
     =============================== */

  // chỉ dùng 2 lane khi nhiều lá
  const useTwoLane = cardCount > 56

  const laneCount = useTwoLane ? 2 : 1
  const perLane = Math.ceil(cardCount / laneCount)

  /* ===============================
     ARC SETUP
     =============================== */

  const start = -arc / 2
  const step = (perLane > 1) ? arc / (perLane - 1) : 0

  /* ===============================
     RENDER SLOTS
     =============================== */

  for (let i = 0; i < cardCount; i++) {

    /* ---------- LANE LOGIC ---------- */

    const laneIndex = useTwoLane
      ? Math.floor(i / perLane)
      : 0

    const indexInLane = useTwoLane
      ? i % perLane
      : i

    const angle = start + step * indexInLane
    const rad = angle * Math.PI / 180

    /* ===============================
       HORIZONTAL FAN – FINAL FORMULA
       =============================== */

    // mỗi lane có radius riêng → cong tự nhiên
    const baseRadius = (W / 2 - cardWidth) * spreadFactor
    const radius = baseRadius - laneIndex * 120

    const x = Math.sin(rad) * radius

    // lane dưới thấp hơn
    const laneYOffset = laneIndex * 70

    const y =
      (1 - Math.cos(rad)) * (H - cardHeight) +
      laneYOffset

    /* ===============================
       SLOT ELEMENT
       =============================== */

    const slot = document.createElement('div')
    slot.className = 'tarot-spread-slot'
    slot.dataset.index = i
    slot.dataset.lane = laneIndex + 1

    if (slugs[i]) {
      slot.dataset.slug = slugs[i]
    }

    slot.style.position = 'absolute'
    slot.style.left = '50%'
    slot.style.top = '0'

    slot.style.width = `${cardWidth}px`
    slot.style.height = `${cardHeight}px`

    slot.style.transform = `
      translate(${x}px, ${y}px)
      rotate(${angle}deg)
    `
    slot.style.transformOrigin = 'center top'

    // z-index: lane trên nổi hơn
    slot.style.zIndex = String(10 - laneIndex)

    container.appendChild(slot)
  }

  console.log(
    '[TarotSpreadLayout] FINAL spread rendered:',
    cardCount,
    useTwoLane ? '(2 lanes)' : '(1 lane)'
  )
}
