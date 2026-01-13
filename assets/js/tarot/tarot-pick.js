/* ======================================================
   TAROT PICK – CLICK CHỌN LÁ (FINAL – RESET SAFE)
   ====================================================== */

import { TarotState } from './tarot-state.js'
import { TarotMap } from './tarot-map.js'
import { getTarotCardBySlug } from './tarot-data.js'

export function initTarotPick() {
  const spreadArea = TarotMap.deckC
  if (!spreadArea) return

  const slots = document.querySelectorAll('.tarot-slot[data-slot]')
  if (!slots.length) return

  TarotState.selected = TarotState.selected || []

  spreadArea.addEventListener('click', e => {

    /* ===============================
       ⛔ BLOCK TRONG LÚC RESET
       =============================== */
    if (TarotState._resetting) {
      console.warn('[TarotPick] blocked during reset')
      return
    }

    const slotEl = e.target.closest('.tarot-spread-slot')
    if (!slotEl) return

    /* ===============================
       GUARD
       =============================== */

    if (TarotState.selected.length >= 3) return

    if (
      slotEl.classList.contains('is-picked') ||
      slotEl.style.pointerEvents === 'none'
    ) return

    const img = slotEl.querySelector('img')
    if (!img) return

    const cardSlug = slotEl.dataset.slug
    if (!cardSlug) return

    const cardData = getTarotCardBySlug(cardSlug)
    if (!cardData) return

    const pickIndex = TarotState.selected.length
    const targetSlot = slots[pickIndex]
    if (!targetSlot) return

    /* ===============================
       ORIENTATION
       =============================== */

    const deckIndex =
      slotEl.dataset.deckIndex !== undefined
        ? Number(slotEl.dataset.deckIndex)
        : null

    const isReversed =
      deckIndex !== null
        ? TarotState.spreadOrientation?.[deckIndex]
        : false

    /* ===============================
       BAY LÁ
       =============================== */

    const fromRect = img.getBoundingClientRect()
    const toRect = targetSlot.getBoundingClientRect()

    /* ===============================
       🎥 CAMERA – FOCUS Ô ĐÃ CHỌN
       =============================== */
    document.dispatchEvent(
      new CustomEvent('tarot:camera:focus', {
        detail: {
          y: toRect.top + toRect.height / 2
        }
      })
    )

    const ghost = img.cloneNode(true)
    ghost.style.position = 'fixed'
    ghost.style.left = `${fromRect.left}px`
    ghost.style.top = `${fromRect.top}px`
    ghost.style.width = `${fromRect.width}px`
    ghost.style.height = `${fromRect.height}px`
    ghost.style.zIndex = '9999'
    ghost.style.pointerEvents = 'none'
    ghost.style.transition =
      'transform 600ms cubic-bezier(.4,0,.2,1)'

    document.body.appendChild(ghost)

    const dx =
      toRect.left + toRect.width / 2 -
      (fromRect.left + fromRect.width / 2)

    const dy =
      toRect.top + toRect.height / 2 -
      (fromRect.top + fromRect.height / 2)

    requestAnimationFrame(() => {
      ghost.style.transform =
        `translate(${dx}px, ${dy}px) scale(0.95)`
    })

    ghost.addEventListener('transitionend', () => {
      ghost.remove()

      /* ===============================
         GẮN LÁ THẬT
         =============================== */

      const pickedImg = document.createElement('img')
      pickedImg.src = cardData.image
      pickedImg.alt = cardData.title
      pickedImg.style.width = '100%'
      pickedImg.style.height = '100%'
      pickedImg.style.display = 'block'

      if (isReversed) {
        pickedImg.style.transform = 'rotate(180deg)'
      }

      targetSlot.innerHTML = ''
      targetSlot.appendChild(pickedImg)

      targetSlot.dataset.slug = cardSlug
      targetSlot.dataset.reversed = isReversed ? '1' : '0'

      slotEl.classList.add('is-picked')
      slotEl.style.opacity = '0.35'
      slotEl.style.pointerEvents = 'none'

      TarotState.selected.push({
        slug: cardSlug,
        title: cardData.title,
        position: ['past', 'present', 'future'][pickIndex],
        reversed: isReversed
      })

      /* ===============================
         🎯 ĐỦ 3 LÁ – KẾT NGHI LỄ PICK
         =============================== */
      if (TarotState.selected.length === 3) {
        spreadArea.classList.remove('is-interactive')

        const btn = document.getElementById('btn-reading')
        if (btn) {
          btn.disabled = false
          btn.classList.remove('is-disabled')
        }

        const after = document.querySelector('[data-tarot-after]')
        if (after) after.style.pointerEvents = 'auto'

        // ⛔ đảm bảo luận giải chưa được hiện
        const reading = document.getElementById('reading-content')
        if (reading) reading.classList.add('hidden')

        /* ===============================
           🎥 CAMERA – NEO TỚI NÚT LUẬN GIẢI
           =============================== */
        if (btn) {
          const r = btn.getBoundingClientRect()
          document.dispatchEvent(
            new CustomEvent('tarot:camera:focus', {
              detail: {
                y: r.top + r.height / 2
              }
            })
          )
        }
      }
    }, { once: true })
  })
}
