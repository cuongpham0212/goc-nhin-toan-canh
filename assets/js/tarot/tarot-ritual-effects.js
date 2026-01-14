/* ======================================================
   TAROT RITUAL EFFECTS – ATTACH TO FLY
   ====================================================== */

let ROOT = null
function getRoot() {
  if (ROOT) return ROOT
  ROOT = document.getElementById('tarot-effect-root')
  if (!ROOT) {
    ROOT = document.createElement('div')
    ROOT.id = 'tarot-effect-root'
    Object.assign(ROOT.style, {
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 999999
    })
    document.body.appendChild(ROOT)
  }
  return ROOT
}

/* ======================================================
   RITUAL GHOST (NHẸ – MỜ – PHỤ)
   ====================================================== */
function createGhost(fromRect) {
  const g = document.createElement('div')
  Object.assign(g.style, {
    position: 'fixed',
    left: `${fromRect.left}px`,
    top: `${fromRect.top}px`,
    width: `${fromRect.width}px`,
    height: `${fromRect.height}px`,
    background: 'rgba(180,120,255,0.6)',
    borderRadius: '12px',
    boxShadow: '0 0 40px rgba(200,150,255,.8)',
    pointerEvents: 'none',
    zIndex: 9999999,
    opacity: '0.8'
  })
  return g
}

export function ritualAfterFly({
  fromRect,
  toRect,
  count = 3
}) {
  const dx =
    toRect.left + toRect.width / 2 -
    (fromRect.left + fromRect.width / 2)

  const dy =
    toRect.top + toRect.height / 2 -
    (fromRect.top + fromRect.height / 2)

  for (let i = 0; i < count; i++) {
    const g = createGhost(fromRect)
    document.body.appendChild(g)

    setTimeout(() => {
      g.style.transition = 'transform 600ms ease, opacity 600ms ease'
      g.style.transform =
        `translate(${dx * 0.6}px, ${dy * 0.6}px) scale(0.9)`
      g.style.opacity = '0'
    }, i * 120)

    setTimeout(() => g.remove(), 1200)
  }
}
