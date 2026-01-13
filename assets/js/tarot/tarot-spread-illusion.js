/* ======================================================
   TAROT SPREAD ILLUSION – FAN EFFECT (FIXED)
   - tạo ảo giác trải bài như tay người
   - KHÓA deckIndex → slotIndex
   ====================================================== */

function rand(min, max) {
  return min + Math.random() * (max - min)
}

/**
 * Fan illusion từ bộ phẳng → theo layout slot
 */
export function runSpreadIllusion({
  fromEl,          // nơi lấy img
  originEl = null, // nơi xuất phát (ưu tiên)
  slots,
  ghostCount = 8,
  duration = 900,
  onComplete
}) {
  if (!fromEl || !slots || !slots.length) {
    console.warn('[SpreadIllusion] missing elements')
    onComplete && onComplete()
    return
  }

  const img =
    fromEl.querySelector('img') ||
    fromEl

  if (!img) {
    console.warn('[SpreadIllusion] no image')
    onComplete && onComplete()
    return
  }

  const fr = (originEl || fromEl).getBoundingClientRect()

  /* ==================================================
     🔑 FIX CORE: LOCK DECK INDEX TO SLOT
     ================================================== */

  // deckIndex tăng dần theo số slot (KHÔNG theo ghost)
  slots.forEach((slot, index) => {
    slot.dataset.deckIndex = index
  })

  /* ==================================================
     ILLUSION GHOSTS (VISUAL ONLY)
     ================================================== */

  const targets = []

  for (let i = 0; i < ghostCount; i++) {
    const idx = Math.floor(i * slots.length / ghostCount)
    targets.push(slots[idx])
  }

  let finished = 0

  targets.forEach((slot, i) => {
    const tr = slot.getBoundingClientRect()

    const ghost = img.cloneNode(true)
    ghost.className = 'tarot-spread-ghost'

    ghost.style.position = 'fixed'
    ghost.style.left = `${fr.left}px`
    ghost.style.top = `${fr.top}px`
    ghost.style.width = `${fr.width}px`
    ghost.style.height = `${fr.height}px`
    ghost.style.pointerEvents = 'none'
    ghost.style.zIndex = '9999'
    ghost.style.opacity = '0.85'
    ghost.style.transition = `
      transform ${duration}ms cubic-bezier(.4,0,.2,1),
      opacity ${duration * 0.8}ms ease
    `

    document.body.appendChild(ghost)

    const dx =
      tr.left + tr.width / 2 -
      (fr.left + fr.width / 2)

    const dy =
      tr.top + tr.height / 2 -
      (fr.top + fr.height / 2)

    const rotate = rand(-18, 18)
    const delay = i * 70

    setTimeout(() => {
      ghost.style.transform = `
        translate(${dx}px, ${dy}px)
        rotate(${rotate}deg)
      `
      ghost.style.opacity = '0'
    }, delay)

    ghost.addEventListener(
      'transitionend',
      () => {
        ghost.remove()
        finished++
        if (finished === targets.length) {
          onComplete && onComplete()
        }
      },
      { once: true }
    )
  })
}
