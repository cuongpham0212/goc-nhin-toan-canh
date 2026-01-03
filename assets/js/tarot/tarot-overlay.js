let canvas, ctx
let stars = []
let animationId = null
let running = false

function initStarsCanvas() {
  if (running) return

  canvas = document.getElementById("stars-canvas")
  if (!canvas) return

  ctx = canvas.getContext("2d")
  resizeCanvas()

  const STAR_COUNT = window.innerWidth < 768 ? 60 : 120

  stars = Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.5 + 0.3,
    o: Math.random(),
    d: Math.random() * 0.015 + 0.005
  }))

  running = true
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
    ctx.fillStyle = `rgba(255,255,255,${s.o})`
    ctx.fill()
  })

  animationId = requestAnimationFrame(animateStars)
}

function stopStarsCanvas() {
  running = false
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
}

window.addEventListener("resize", resizeCanvas)

/* ===== API dùng cho overlay ===== */
window.startStars = initStarsCanvas
window.stopStars = stopStarsCanvas
