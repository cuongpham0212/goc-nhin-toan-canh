/* ======================================================
   TAROT SPREAD LAYOUT – HORIZONTAL ARC (FINAL)
   - nằm gọn trong deck C
   - lõm hướng xuống
   - giãn ngang, thoáng, đẹp mắt
   - khung rỗng (không bóng, không ảnh)
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

  // kích thước card – đúng với UI hiện tại
  cardWidth = 72,
  cardHeight = 120,

  // độ xoè & giãn
  arc = 140,            // độ mở quạt
  spreadFactor = 1.25,  // giãn ngang (khoảng cách lá)

  // 🔥 danh sách slug (78 lá)
  slugs = []
} = {}) {
  if (!container) {
    console.warn('[TarotSpreadLayout] container not found')
    return
  }

  // reset layout cũ (an toàn tuyệt đối)
  container.innerHTML = ''
  container.classList.add('tarot-spread-layout')

  // lấy kích thước thật của deck C
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

  const start = -arc / 2
  const step = cardCount > 1 ? arc / (cardCount - 1) : 0

  for (let i = 0; i < cardCount; i++) {
    const angle = start + step * i
    const rad = angle * Math.PI / 180

    /* ===============================
       HORIZONTAL FAN – FINAL FORMULA
       =============================== */

    // giãn ngang
    const x = Math.sin(rad) * (W / 2 - cardWidth) * spreadFactor

    // lõm xuống, luôn nằm trong khung
    const y = (1 - Math.cos(rad)) * (H - cardHeight)

    const slot = document.createElement('div')
    slot.className = 'tarot-spread-slot'
    slot.dataset.index = i

    // 🔑 gắn slug nếu có
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

    container.appendChild(slot)
  }

  console.log('[TarotSpreadLayout] FINAL spread rendered:', cardCount)
}
