/**
 * ======================================================
 * FILE: tarot-overlay.js
 * VAI TRÒ:
 * - Overlay NGHI THỨC chuyển cảnh sang luận giải
 * - Sao nền (canvas)
 * - Hệ hành tinh + vệ tinh là TRUNG TÂM THỊ GIÁC
 * - Tự tắt theo luồng TarotReading
 * ======================================================
 */

/* ================== CANVAS STATE ================== */
let canvas, ctx
let stars = []
let animationId = null
let running = false
let startTime = 0

const MIN_OVERLAY_DURATION = 2500

/* ================== DOM ================== */
let overlayEl = null
let canvasEl = null
let contentEl = null
let planetSystem = null
let orbits = []

/* ================== INIT ================== */
function initTarotOverlay() {
  overlayEl = document.getElementById('tarot-overlay')
  canvasEl = document.getElementById('stars-canvas')
  contentEl = overlayEl?.querySelector('.overlay-content')
  planetSystem = overlayEl?.querySelector('.planet-system')
  orbits = overlayEl ? Array.from(overlayEl.querySelectorAll('.orbit')) : []

  if (!overlayEl || !canvasEl || !contentEl || !planetSystem) {
    console.warn('[tarot-overlay] missing overlay elements')
    return
  }

  ctx = canvasEl.getContext('2d')
  resizeCanvas()

  window.addEventListener('resize', resizeCanvas)
  window.addEventListener('tarot:reveal:start', showOverlay)

  console.log('[tarot-overlay] ready')
}

/* ================== OVERLAY CONTROL ================== */
function showOverlay() {
  if (running) return

  overlayEl.classList.add('is-active')
  overlayEl.removeAttribute('hidden')
  overlayEl.setAttribute('aria-hidden', 'false')

    /* ===============================
     RITUAL TEXT – DẪN TÂM NGHI THỨC
     =============================== */

  let ritualText = overlayEl.querySelector('.ritual-text')

  if (!ritualText) {
    ritualText = document.createElement('div')
    ritualText.className = 'ritual-text'
    ritualText.innerHTML = `
      <p>Hãy hít một hơi thật sâu, buông bỏ mọi suy nghĩ,</p>
      <p>và để kết nối năng lượng với những lá bài dẫn lối cho bạn.</p>
    `
    overlayEl.appendChild(ritualText)
  }

  ritualText.style.opacity = '0'
  ritualText.style.transition = 'opacity 600ms ease'
  ritualText.style.position = 'fixed'
  ritualText.style.left = '50%'

  /* ⬆️ NẰM PHÍA TRÊN ĐẦU HỆ HÀNH TINH (KHÔNG ĐÈ) */
  ritualText.style.top = '6%'   // ⬅️ QUAN TRỌNG: thấp hơn header, cao hơn planet

  ritualText.style.transform = 'translateX(-50%)'
  ritualText.style.textAlign = 'center'
  ritualText.style.pointerEvents = 'none'
  ritualText.style.zIndex = '40'   // cao hơn planet-system

  /* ===============================
   TEXT VISUAL – RÕ & NGHI LỄ
   =============================== */

  ritualText.style.color = '#fff8e1'       // gần trắng, ấm
  ritualText.style.fontSize = '1.6rem'     // ⬅️ TO HƠN RÕ RỆT
  ritualText.style.fontWeight = '500'
  ritualText.style.letterSpacing = '0.14em'
  ritualText.style.lineHeight = '2'

  /* ===============================
   HOÀ QUYỆN OVERLAY – KHÔNG HỘP
   =============================== */

  ritualText.style.color = 'rgba(255, 248, 225, 0.95)'

  ritualText.style.textShadow = `
    0 2px 12px rgba(0,0,0,0.9),
    0 0 22px rgba(255,220,160,0.45),
    0 0 48px rgba(120,160,255,0.18)
  `

  ritualText.style.filter = `
    drop-shadow(0 0 14px rgba(255,220,160,0.25))
  `

  ritualText.style.background = 'transparent'
  ritualText.style.padding = '0'
  ritualText.style.borderRadius = '0'

  ritualText.style.padding = '18px 28px'
  ritualText.style.borderRadius = '14px'

  /* glow + shadow để không trùng nền */
  ritualText.style.textShadow = `
    0 3px 14px rgba(0,0,0,0.95),
    0 0 28px rgba(255,220,160,0.6)
  `

  ritualText.style.maxWidth = '1100px'
  ritualText.style.width = '92vw'
  ritualText.style.boxSizing = 'border-box'


  /* 🔒 CƯỠNG BỨC TRUNG TÂM VIEWPORT */
  contentEl.style.position = 'fixed'
  contentEl.style.top = '50%'
  contentEl.style.left = '50%'
  contentEl.style.transform = 'translate(-50%, -50%)'
  contentEl.style.margin = '0'
  contentEl.style.padding = '0'
  contentEl.style.filter = 'none'

  startTime = Date.now()
    requestAnimationFrame(() => {
    ritualText.style.opacity = '1'
  })
  running = true

  initStars()
  animate()
}

function hideOverlay() {
  const elapsed = Date.now() - startTime
  const remaining = Math.max(0, MIN_OVERLAY_DURATION - elapsed)

  setTimeout(() => {
    running = false
    if (animationId) cancelAnimationFrame(animationId)
    animationId = null

    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)

    const ritualText = overlayEl.querySelector('.ritual-text')
    if (ritualText) ritualText.style.opacity = '0'

    overlayEl.classList.remove('is-active')
    overlayEl.setAttribute('aria-hidden', 'true')
    overlayEl.setAttribute('hidden', '')

    window.dispatchEvent(new CustomEvent('tarot:reveal:done'))
    // 🎥 CAMERA: SNAP SANG PHẦN LUẬN GIẢI
    document.dispatchEvent(
      new CustomEvent('tarot:camera:to-reading')
    )
  }, remaining)
}

/* ================== STARS ================== */
function initStars() {
  const STAR_COUNT = window.innerWidth < 768 ? 160 : 320
  const CROSS_STAR_COUNT = Math.floor(STAR_COUNT * 0.08) // ~8% sao đặc biệt

  stars = []

  for (let i = 0; i < STAR_COUNT; i++) {
    const depth = Math.random()
    stars.push({
      type: 'dot',
      x: Math.random() * canvasEl.width,
      y: Math.random() * canvasEl.height,
      r: depth < 0.7 ? Math.random() * 0.8 + 0.3 : Math.random() * 1.6 + 0.8,
      baseO: Math.random() * 0.5 + 0.3,
      o: 0,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.6 + 0.4,
      glow: depth < 0.85 ? 0 : 10
    })
  }

  const centerX = canvasEl.width / 2
  const centerY = canvasEl.height / 2
  const radiusBase = Math.min(canvasEl.width, canvasEl.height) * 0.35

  for (let i = 0; i < CROSS_STAR_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2
    const radius = radiusBase * (0.6 + Math.random() * 0.5)

    stars.push({
      type: 'cross',
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
      size: Math.random() * 4 + 5,
      baseO: Math.random() * 0.5 + 0.4,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.8 + 0.6,

      /* 🔮 RITUAL PROPERTIES */
      bornAt: Date.now() + 500 + Math.random() * 800, // delay xuất hiện
      rotation: Math.random() * Math.PI,
      rotSpeed: (Math.random() * 0.3 - 0.15) * 0.15
    })
  }

}

/* ================== MAIN LOOP ================== */
function animate() {
  if (!running) return

  drawStars()
  animatePlanetSystem()

  animationId = requestAnimationFrame(animate)
}

/* ================== DRAW STARS ================== */
function drawStars() {
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)

  const t = Date.now() * 0.001

  stars.forEach(s => {
    if (s.type === 'cross') {
      const now = Date.now()
      if (now < s.bornAt) return
    }

    const pulse = Math.pow(
      Math.sin(t * s.speed * 1.6 + s.phase) * 0.5 + 0.5,
      0.6
    )
    let opacity = s.baseO * (0.6 + pulse * 0.8)

    if (s.type === 'cross') {
      const age = Math.min(1, (Date.now() - s.bornAt) / 600)
      opacity *= age
    }

    if (s.type === 'dot') {
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,255,255,${opacity})`

      if (s.glow) {
        ctx.shadowBlur = s.glow
        ctx.shadowColor = 'rgba(160,180,255,0.6)'
      } else {
        ctx.shadowBlur = 0
      }

      ctx.fill()
    }

    if (s.type === 'cross') {
      drawCrossStar(s, opacity, pulse)
    }
  })

  ctx.shadowBlur = 0
}

function drawCrossStar(s, opacity, pulse) {
  const size = s.size * (0.85 + pulse * 0.9)
  const long = size
  const short = size * 0.35

  ctx.save()
  ctx.translate(s.x, s.y)

  /* 🌀 XOAY RẤT NHẸ */
  s.rotation += s.rotSpeed
  ctx.rotate(s.rotation)

  /* ===============================
     CÁNH SAO – XANH LẠNH
     =============================== */
  ctx.strokeStyle = `rgba(180,200,255,${opacity * 0.7})`
  ctx.lineWidth = 1
  ctx.shadowBlur = 10
  ctx.shadowColor = 'rgba(140,170,255,0.45)'

  ctx.beginPath()
  ctx.moveTo(0, -long)
  ctx.lineTo(0, long)
  ctx.moveTo(-short, 0)
  ctx.lineTo(short, 0)
  ctx.stroke()

  /* ===============================
     NHÂN SAO – VÀNG ẤM (LINH HỒN)
     =============================== */
  const coreRadius = size * 0.2
  const coreGlow = 20 + pulse * 28

  ctx.beginPath()
  ctx.arc(0, 0, coreRadius, 0, Math.PI * 2)
  ctx.fillStyle = `rgba(255,230,190,${opacity * (1 + pulse * 0.5)})`
  ctx.shadowBlur = coreGlow
  ctx.shadowColor = 'rgba(255,200,140,0.9)'
  ctx.fill()

  ctx.restore()
}


/* ================== PLANET SYSTEM (CENTER · NO HALO) ================== */
function animatePlanetSystem() {
  if (!planetSystem) return

  const t = Date.now() * 0.001

  /* 🔒 KÍCH THƯỚC CƠ SỞ – TRUNG TÂM THỊ GIÁC */
  planetSystem.style.width = '90vmin'
  planetSystem.style.height = '90vmin'
  planetSystem.style.position = 'relative'
  planetSystem.style.margin = '0'
  planetSystem.style.filter = 'none'

  /* 🌍 HÀNH TINH TRUNG TÂM – KHÔNG HALO */
  const planet = planetSystem.querySelector('.planet')
  if (planet) {
    planet.style.width = '40%'
    planet.style.height = '40%'

    const scale = 1.05 + Math.sin(t * 1.2) * 0.08
    planet.style.transform = `scale(${scale})`

    planet.style.filter = 'brightness(1)'
    planet.style.boxShadow = 'none'
  }

  /* 🛰️ VỆ TINH – CHIỀU SÂU TỰ NHIÊN */
  orbits.forEach((orbit, i) => {
    const speed = i === 0 ? 0.35 : -0.25
    const angle = t * speed
    const depth = (Math.sin(t * speed) + 1) / 2

    orbit.style.transform = `rotate(${angle}rad)`
    orbit.style.zIndex = Math.round(depth * 10)

    const moon = orbit.querySelector('.moon')
    if (moon) {
      moon.style.width = '20%'
      moon.style.height = '20%'

      const scale = 1.1 + depth * 0.5
      const blur = (1 - depth) * 1.2

      moon.style.transform = `
        translate(-50%, -50%)
        translateX(${i === 0 ? '58%' : '72%'})
        scale(${scale})
      `
      moon.style.filter = `blur(${blur}px) brightness(1.05)`
      moon.style.boxShadow = 'none'
      moon.style.opacity = 0.7 + depth * 0.3
    }
  })
}

/* ================== RESIZE ================== */
function resizeCanvas() {
  if (!canvasEl) return
  canvasEl.width = window.innerWidth
  canvasEl.height = window.innerHeight
}

/* ================== AUTO INIT ================== */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTarotOverlay)
} else {
  initTarotOverlay()
}
