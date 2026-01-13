// assets/js/tarot/tarot-camera.js

export const TarotCamera = {
  stageEl: null,
  paddingDesktop: 80,
  paddingMobile: 120,
  mobileBreakpoint: 768,

  init(stageSelector) {
    this.stageEl = document.querySelector(stageSelector)

    if (!this.stageEl) {
      console.warn('[TarotCamera] Stage element not found:', stageSelector)
      return
    }

    this.bindEvents()
    console.log('[TarotCamera] Initialized')
  },

  getPadding() {
    return window.innerWidth <= this.mobileBreakpoint
      ? this.paddingMobile
      : this.paddingDesktop
  },

  /**
   * 🎥 Camera assist theo VIEWPORT (KHÔNG theo stage)
   * targetY: viewport-based Y
   */
  ensureVisible(targetY) {
    const padding = this.getPadding()
    const viewportTop = 0 + padding
    const viewportBottom = window.innerHeight - padding

    console.group('[TarotCamera] ensureVisible')
    console.log('targetY:', targetY)
    console.log('viewportTop:', viewportTop)
    console.log('viewportBottom:', viewportBottom)

    if (targetY < viewportTop) {
      console.log('⬆️ scroll UP')
      window.scrollBy({
        top: targetY - viewportTop,
        behavior: 'smooth'
      })
    } else if (targetY > viewportBottom) {
      console.log('⬇️ scroll DOWN')
      window.scrollBy({
        top: targetY - viewportBottom,
        behavior: 'smooth'
      })
    } else {
      console.log('⏹️ NO SCROLL (target inside viewport)')
    }

    console.groupEnd()
  },

  scrollToReading(selector = '#tarot-reading') {
    const el = document.querySelector(selector)
    if (!el) {
      console.warn('[TarotCamera] reading section not found:', selector)
      return
    }

    el.scrollIntoView({
      behavior: 'instant',
      block: 'start'
    })
  },

  bindEvents() {
    document.addEventListener('tarot:camera:focus', e => {
      if (typeof e.detail?.y === 'number') {
        this.ensureVisible(e.detail.y)
      }
    })

    document.addEventListener('tarot:camera:to-reading', () => {
      this.scrollToReading()
    })

    document.addEventListener('tarot:camera:anchor', e => {
      const selector = e.detail?.selector
      if (!selector) return

      const el = document.querySelector(selector)
      if (!el) return

      const r = el.getBoundingClientRect()

      this.ensureVisible(r.top + r.height / 2)
    })
  }
}
