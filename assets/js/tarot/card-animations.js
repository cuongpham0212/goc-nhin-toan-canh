/**
 * ======================================================
 * FILE: card-animations.js
 * VAI TRÒ:
 * - Chứa các hàm animation bay lá bài dùng CHUNG
 * - Không phụ thuộc tarot
 * - Không gắn event
 * - Không biết deck / overlay / slot
 *
 * TƯ DUY:
 * - Đưa vào: element + fromRect + toRect
 * - Việc còn lại: bay cho đẹp
 * ======================================================
 */

/* ================== CONFIG ================== */
const DEFAULT_DURATION = 600;

/* ================== CORE: BAY THẲNG ================== */
/**
 * Bay thẳng từ A → B
 */
export function flyLinear({
  el,
  fromRect,
  toRect,
  scale = 1,
  duration = DEFAULT_DURATION,
  easing = 'ease'
}) {
  prepareFlyingElement(el, fromRect, duration, easing);

  const dx = toRect.left - fromRect.left;
  const dy = toRect.top - fromRect.top;

  requestAnimationFrame(() => {
    el.style.transform =
      `translate(${dx}px, ${dy}px) scale(${scale})`;
  });

  return wait(duration);
}

/* ================== CORE: BAY CONG (ARC) ================== */
/**
 * Bay cong theo parabol
 */
export function flyArc({
  el,
  fromRect,
  toRect,
  arcHeight = 120,
  duration = DEFAULT_DURATION,
  easing = 'cubic-bezier(.25,.8,.25,1)'
}) {
  prepareFlyingElement(el, fromRect, duration, easing);

  const dx = toRect.left - fromRect.left;
  const dy = toRect.top - fromRect.top;

  // dùng CSS keyframe động
  const keyframeName = `arc-${Date.now()}`;

  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes ${keyframeName} {
      0% {
        transform: translate(0, 0);
      }
      50% {
        transform: translate(${dx / 2}px, ${dy / 2 - arcHeight}px);
      }
      100% {
        transform: translate(${dx}px, ${dy}px);
      }
    }
  `;
  document.head.appendChild(style);

  el.style.animation = `${keyframeName} ${duration}ms ${easing} forwards`;

  return wait(duration).then(() => style.remove());
}

/* ================== CORE: FADE / SCALE ================== */
export function fadeOut(el, duration = 300) {
  el.style.transition = `opacity ${duration}ms ease`;
  el.style.opacity = 0;
  return wait(duration);
}

export function fadeIn(el, duration = 300) {
  el.style.transition = `opacity ${duration}ms ease`;
  el.style.opacity = 1;
  return wait(duration);
}

export function scaleIn(el, scaleFrom = 0.8, duration = 300) {
  el.style.transform = `scale(${scaleFrom})`;
  el.style.transition = `transform ${duration}ms ease`;

  requestAnimationFrame(() => {
    el.style.transform = 'scale(1)';
  });

  return wait(duration);
}

/* ================== UTIL ================== */
function prepareFlyingElement(el, rect, duration, easing) {
  el.style.position = 'fixed';
  el.style.left = `${rect.left}px`;
  el.style.top = `${rect.top}px`;
  el.style.margin = '0';
  el.style.transition = `transform ${duration}ms ${easing}`;
  el.style.willChange = 'transform';
  el.style.zIndex = 9999;
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
