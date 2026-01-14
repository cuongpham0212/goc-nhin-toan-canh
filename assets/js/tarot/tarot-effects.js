/* ======================================================
   TAROT EFFECTS – SHUFFLE & FLY (FINAL – CLEAN)
   - flyCard: bay 1 lá duy nhất (NO snake / NO trail)
   - shuffle: giữ nguyên logic hiện tại
   ====================================================== */

import { TarotState } from './tarot-state.js'

/* ======================================================
   FLY CARD (CLEAN – SINGLE GHOST)
   ====================================================== */

export function flyCard(fromEl, toEl, options = {}) {
  if (!fromEl || !toEl) {
    console.warn('[TarotEffects] flyCard missing element')
    return
  }

  const {
    duration = 600,
    rotate = 0,
    scale = 0.95,
    easing = 'cubic-bezier(.4,0,.2,1)',
    onComplete
  } = options

  const fromRect = fromEl.getBoundingClientRect()
  const toRect = toEl.getBoundingClientRect()

  const dx =
    toRect.left + toRect.width / 2 -
    (fromRect.left + fromRect.width / 2)

  const dy =
    toRect.top + toRect.height / 2 -
    (fromRect.top + fromRect.height / 2)

  const img =
    fromEl.tagName === 'IMG'
      ? fromEl
      : fromEl.querySelector('img')

  if (!img) {
    console.warn('[TarotEffects] no image to fly', fromEl)
    return
  }

  /* ---------- SINGLE GHOST ---------- */

  const ghost = img.cloneNode(true)
  ghost.className = 'tarot-fly-ghost'

  Object.assign(ghost.style, {
    position: 'fixed',
    left: `${fromRect.left}px`,
    top: `${fromRect.top}px`,
    width: `${fromRect.width}px`,
    height: `${fromRect.height}px`,
    pointerEvents: 'none',
    zIndex: '9999',
    willChange: 'transform',
    transition: `transform ${duration}ms ${easing}`
  })

  document.body.appendChild(ghost)

  requestAnimationFrame(() => {
    ghost.style.transform = `
      translate(${dx}px, ${dy}px)
      scale(${scale})
      rotate(${rotate}deg)
    `.trim()
  })

  ghost.addEventListener(
    'transitionend',
    () => {
      ghost.remove()
      onComplete && onComplete()
    },
    { once: true }
  )
}

export function flyCardToSlot(fromEl, slotEl, options = {}) {
  if (!slotEl) return
  flyCard(fromEl, slotEl, options)
}

/* ======================================================
   SHUFFLE EFFECT – CORE (GIỮ NGUYÊN)
   ====================================================== */

function rand(min, max) {
  return min + Math.random() * (max - min)
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n))
}

function ensureShuffleStage(deckB) {
  const stage =
    deckB.querySelector('[data-shuffle-stage]') ||
    deckB.querySelector('.tarot-shuffle-stage')

  if (!stage) return null

  const cs = getComputedStyle(stage)
  if (cs.position === 'static') {
    stage.style.position = 'absolute'
    stage.style.inset = '0'
  }

  stage.style.pointerEvents = 'none'
  stage.style.overflow = 'visible'
  stage.style.zIndex = '5'

  return stage
}

function clearStage(stage) {
  if (!stage) return
  stage.innerHTML = ''
}

function spawnStageGhosts(deckB, stage, count = 12) {
  const img =
    deckB.querySelector('.tarot-deck img') ||
    deckB.querySelector('img')

  if (!img) return []

  const ghosts = []
  const W = deckB.clientWidth || 80
  const H = deckB.clientHeight || 120

  for (let i = 0; i < count; i++) {
    const g = img.cloneNode(true)
    g.className = 'tarot-shuffle-ghost'

    g.style.position = 'absolute'
    g.style.left = '50%'
    g.style.top = '50%'
    g.style.width = '100%'
    g.style.height = '100%'
    g.style.transform = 'translate(-50%, -50%)'
    g.style.opacity = String(rand(0.35, 0.85))
    g.style.pointerEvents = 'none'
    g.style.willChange = 'transform, opacity'
    g.style.filter = 'blur(0.15px)'

    g.__seed = {
      a: rand(0, Math.PI * 2),
      s: rand(0.9, 1.8),
      rx: rand(W * 0.15, W * 0.75),
      ry: rand(H * 0.12, H * 0.65),
      rot: rand(-40, 40),
      sc: rand(0.92, 1.04),
      pop: rand(0.6, 1.2)
    }

    stage.appendChild(g)
    ghosts.push(g)
  }

  return ghosts
}

/* ======================================================
   START SHUFFLE (🔒 LOCK SAFE)
   ====================================================== */

export function startShuffle(deckB) {
  if (!deckB) return

  if (TarotState.deckLocked) {
    console.warn('[TarotEffects] deck locked – shuffle aborted')
    return
  }

  if (deckB.__shuffleActive) return
  deckB.__shuffleActive = true

  deckB.classList.add('is-shuffling')

  const slotCount =
    document.querySelectorAll('.tarot-spread-slot')?.length || 3

  TarotState.spreadOrientation = Array.from(
    { length: slotCount },
    () => Math.random() < 0.5
  )

  console.log(
    '[TarotEffects] orientation prepared:',
    TarotState.spreadOrientation
  )

  deckB.__shuffleTimer = setInterval(() => {
    if (TarotState.deckLocked) {
      stopShuffle(deckB)
      return
    }

    const r = (Math.random() - 0.5) * 18
    const x = (Math.random() - 0.5) * 14
    const y = (Math.random() - 0.5) * 10
    deckB.style.transform = `translate(${x}px, ${y}px) rotate(${r}deg)`
  }, 70)

  const stage = ensureShuffleStage(deckB)
  if (!stage) {
    console.log('[TarotEffects] shuffle started (shake only)')
    return
  }

  clearStage(stage)

  const count = clamp(deckB.__ghostCount || 12, 8, 16)
  const ghosts = spawnStageGhosts(deckB, stage, count)
  deckB.__shuffleStage = stage
  deckB.__shuffleGhosts = ghosts

  const tick = () => {
    if (!deckB.__shuffleActive || TarotState.deckLocked) {
      stopShuffle(deckB)
      return
    }

    const W = deckB.clientWidth || 80
    const H = deckB.clientHeight || 120

    for (const g of deckB.__shuffleGhosts || []) {
      const s = g.__seed
      if (!s) continue

      s.a += 0.12 * s.s

      const dx = Math.sin(s.a) * s.rx * s.pop + rand(-6, 6)
      const dy = Math.cos(s.a * 1.35) * s.ry * s.pop + rand(-6, 6)

      const rot = s.rot + Math.sin(s.a * 1.8) * 30
      const sc = s.sc + Math.sin(s.a * 1.6) * 0.05

      const cdx = clamp(dx, -W * 0.85, W * 0.85)
      const cdy = clamp(dy, -H * 0.75, H * 0.75)

      g.style.transform = `
        translate(-50%, -50%)
        translate(${cdx}px, ${cdy}px)
        rotate(${rot}deg)
        scale(${sc})
      `.trim()
    }

    deckB.__shuffleRAF = requestAnimationFrame(tick)
  }

  deckB.__shuffleRAF = requestAnimationFrame(tick)

  console.log('[TarotEffects] shuffle started')
}

/* ======================================================
   STOP SHUFFLE (🔒 LOCK SAFE)
   ====================================================== */

export function stopShuffle(deckB) {
  if (!deckB) return

  deckB.__shuffleActive = false

  clearInterval(deckB.__shuffleTimer)
  deckB.__shuffleTimer = null

  if (deckB.__shuffleRAF) {
    cancelAnimationFrame(deckB.__shuffleRAF)
    deckB.__shuffleRAF = null
  }

  deckB.classList.remove('is-shuffling')
  deckB.style.transform = 'none'

  if (deckB.__shuffleStage) {
    clearStage(deckB.__shuffleStage)
  }

  deckB.__shuffleGhosts = []
  deckB.__shuffleStage = null

  console.log('[TarotEffects] shuffle stopped')
}
