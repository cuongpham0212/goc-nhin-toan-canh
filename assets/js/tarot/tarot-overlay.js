/**
 * ======================================================
 * FILE: tarot-overlay.js
 * VAI TRÒ (CHỐT):
 * - Hiển thị overlay NGHI THỨC / LUẬN GIẢI
 * - Chạy hiệu ứng sao nền (canvas)
 * - Hiện khi user bấm "Xem luận giải"
 * - Tắt khi user xác nhận (TIẾT LỘ Ý NGHĨA)
 *
 * LƯU Ý:
 * - File này KHÔNG biết xáo bài
 * - File này KHÔNG biết chọn bài
 * - File này chỉ lo NGHI THỨC
 * ======================================================
 */

/* ================== CANVAS STATE ================== */
let canvas, ctx;
let stars = [];
let animationId = null;
let running = false;
let startTime = 0;

const MIN_OVERLAY_DURATION = 2500;

/* ================== DOM ================== */
let overlayEl = null;
let closeBtn = null;

/* ================== INIT ================== */
function initTarotOverlay() {
  overlayEl = document.getElementById('tarot-overlay');
  canvas = document.getElementById('stars-canvas');
  closeBtn = document.getElementById('close-overlay');

  if (!overlayEl || !canvas) {
    console.warn('[tarot-overlay] thiếu overlay hoặc canvas');
    return;
  }

  ctx = canvas.getContext('2d');
  resizeCanvas();

  window.addEventListener('resize', resizeCanvas);

  // lắng nghe khi user muốn xem luận giải
  window.addEventListener('tarot:reveal:start', showOverlay);

  // nút đóng overlay nghi thức
  if (closeBtn) {
    closeBtn.addEventListener('click', hideOverlay);
  }

  console.log('[tarot-overlay] ready');
}

/* ================== OVERLAY CONTROL ================== */
function showOverlay() {
  if (running) return;

  overlayEl.classList.remove('hidden');
  overlayEl.setAttribute('aria-hidden', 'false');

  startTime = Date.now();
  running = true;

  initStars();
  animateStars();
}

function hideOverlay() {
  const elapsed = Date.now() - startTime;
  const remaining = Math.max(0, MIN_OVERLAY_DURATION - elapsed);

  setTimeout(() => {
    running = false;

    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }

    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    overlayEl.classList.add('hidden');
    overlayEl.setAttribute('aria-hidden', 'true');

    // báo cho hệ thống: bắt đầu render luận giải
    window.dispatchEvent(new CustomEvent('tarot:reveal:done'));
  }, remaining);
}

/* ================== STARS INIT ================== */
function initStars() {
  const STAR_COUNT = window.innerWidth < 768 ? 180 : 360;

  stars = Array.from({ length: STAR_COUNT }, () => {
    const layer = Math.random();

    if (layer < 0.7) {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 0.8 + 0.3,
        o: Math.random() * 0.35 + 0.15,
        d: Math.random() * 0.002 + 0.001,
        glow: 0
      };
    }

    if (layer < 0.9) {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.2 + 0.6,
        o: Math.random() * 0.6 + 0.3,
        d: Math.random() * 0.006 + 0.003,
        glow: 6
      };
    }

    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 1.2,
      o: Math.random() * 0.8 + 0.6,
      d: Math.random() * 0.004 + 0.002,
      glow: 14
    };
  });
}

/* ================== ANIMATION ================== */
function animateStars() {
  if (!running) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  stars.forEach(s => {
    s.o += s.d;
    if (s.o >= 1 || s.o <= 0) s.d *= -1;

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);

    ctx.fillStyle = `rgba(255,255,255,${s.o})`;

    if (s.glow > 0) {
      ctx.shadowBlur = s.glow;
      ctx.shadowColor = 'rgba(160,180,255,0.9)';
    } else {
      ctx.shadowBlur = 0;
    }

    ctx.fill();
  });

  ctx.shadowBlur = 0;
  animationId = requestAnimationFrame(animateStars);
}

/* ================== RESIZE ================== */
function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

/* ================== AUTO INIT ================== */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTarotOverlay);
} else {
  initTarotOverlay();
}
