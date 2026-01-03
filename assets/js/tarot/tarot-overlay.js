let canvas, ctx
let stars = []
let animationId = null
let running = false
let startTime = 0

const MIN_OVERLAY_DURATION = 3000
let overlayEl = null

function initStarsCanvas() {
  if (running) return

  overlayEl = document.querySelector(".tarot-overlay")
  canvas = document.getElementById("stars-canvas")
  if (!canvas || !overlayEl) return

  ctx = canvas.getContext("2d")

  resizeCanvas()

  // 🔒 đảm bảo canvas KHÔNG BAO GIỜ = 0
  if (!canvas.width || !canvas.height) {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }

  const STAR_COUNT = window.innerWidth < 768 ? 70 : 140

  stars = Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.4 + 0.6,      // ⭐ to hơn chút cho dễ thấy
    o: Math.random() * 0.6 + 0.4,      // ⭐ opacity nền cao hơn
    d: Math.random() * 0.01 + 0.004
  }))

  // mở overlay (phù hợp với draw-one.js hiện tại)
  overlayEl.hidden = false

  running = true
  startTime = Date.now()

  animateStars()
}

function resizeCanvas() {
  if (!canvas) return
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

function animateStars() {
  if (!running) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  stars.forEach(s => {
    s.o += s.d
    if (s.o >= 1 || s.o <= 0) s.d *= -1

    ctx.beginPath()
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)

    // ✨ SAO PHÁT SÁNG – CHẮC CHẮN THẤY
    ctx.fillStyle = `rgba(255,255,255,${s.o})`
    ctx.shadowBlur = 10
    ctx.shadowColor = "rgba(180,200,255,0.95)"

    ctx.fill()
  })

  // reset shadow để tránh ảnh hưởng frame sau
  ctx.shadowBlur = 0

  animationId = requestAnimationFrame(animateStars)
}

function stopStarsCanvas() {
  const elapsed = Date.now() - startTime
  const remaining = Math.max(0, MIN_OVERLAY_DURATION - elapsed)

  setTimeout(() => {
    running = false

    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }

    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    if (overlayEl) overlayEl.hidden = true
  }, remaining)
}

window.addEventListener("resize", resizeCanvas)

/* ===== API dùng cho overlay ===== */
window.startStars = initStarsCanvas
window.stopStars = stopStarsCanvas
