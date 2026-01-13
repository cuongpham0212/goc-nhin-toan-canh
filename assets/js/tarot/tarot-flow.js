// assets/js/tarot/tarot-flow.js

import { TarotState } from './tarot-state.js'
import { TarotMap } from './tarot-map.js'
import { flyCard, startShuffle, stopShuffle } from './tarot-effects.js'
import { runSpreadIllusion } from './tarot-spread-illusion.js'

export function initTarotFlow() {
  if (!TarotMap.btnShuffle) return

  const ALLOW_SHUFFLE_PHASE = ['idle', 'toShuffle']

  TarotMap.btnShuffle.addEventListener('click', () => {
    if (!ALLOW_SHUFFLE_PHASE.includes(TarotState.phase)) {
      console.warn('[TarotFlow] shuffle blocked, phase:', TarotState.phase)
      return
    }

    console.log('[TarotFlow] shuffle clicked')
    TarotState.phase = 'toShuffle'

    /* ==================================================
       A → B (ÚP → XÀO)
       ================================================== */
    flyCard(TarotMap.deckA, TarotMap.deckB, {
      rotate: 12,
      onComplete() {
        // 🎥 CAMERA: FOCUS BỘ XÀO (DECK B)
        document.dispatchEvent(new CustomEvent('tarot:camera:focus', {
          detail: {
            y: TarotMap.deckB.getBoundingClientRect().top +
              TarotMap.deckB.getBoundingClientRect().height / 2
          }
        }))
        /* ===== KẾT THÚC TRIỆT ĐỂ DECK A ===== */
        TarotMap.deckA.classList.add('is-hidden')

        if (TarotMap.btnShuffle) {
          TarotMap.hideShuffleButton()
        }

        /* ===== DECK B: CHỈ SỐNG TỪ ĐÂY ===== */
        // 1️⃣ hiện deck B NGAY SAU KHI A → B fly xong
        TarotMap.deckB.classList.add('is-visible')

        // 2️⃣ chờ 1 frame để browser paint ảnh
        requestAnimationFrame(() => {
        TarotState.phase = 'shuffling'
        startShuffle(TarotMap.deckB)
        })

        /* ==================================================
           XÀO (4s)
           ================================================== */
        setTimeout(() => {
          stopShuffle(TarotMap.deckB)
          TarotState.phase = 'toSpread'

          /* ==================================================
             B → FLAT DECK (GOM BÀI)
             ================================================== */
          const flat = document.querySelector('.tarot-flat-deck')
          if (!flat) {
            console.warn('[TarotFlow] no flat deck (.tarot-flat-deck)')
            return
          }

          const from = TarotMap.deckB
          const img =
            from.tagName === 'IMG'
              ? from
              : from.querySelector('img')

          if (!img) {
            console.warn('[TarotFlow] no card image to fly')
            return
          }

          const frFrom = from.getBoundingClientRect()
          const frFlat = flat.getBoundingClientRect()
          // 🎥 CAMERA: FOCUS FLAT DECK (GOM BÀI)
          document.dispatchEvent(new CustomEvent('tarot:camera:focus', {
            detail: {
              y: frFlat.top + frFlat.height / 2
            }
          }))


          const ghost = img.cloneNode(true)
          ghost.style.position = 'fixed'
          ghost.style.left = `${frFrom.left}px`
          ghost.style.top = `${frFrom.top}px`
          ghost.style.width = `${frFrom.width}px`
          ghost.style.height = `${frFrom.height}px`
          ghost.style.pointerEvents = 'none'
          ghost.style.zIndex = '9999'
          ghost.style.transition =
            'transform 700ms cubic-bezier(.4,0,.2,1)'

          document.body.appendChild(ghost)

          const dx =
            frFlat.left + frFlat.width / 2 -
            (frFrom.left + frFrom.width / 2)

          const dy =
            frFlat.top + frFlat.height / 2 -
            (frFrom.top + frFrom.height / 2)

          requestAnimationFrame(() => {
            ghost.style.transform =
              `translate(${dx}px, ${dy}px) rotate(-6deg)`
          })

          ghost.addEventListener(
            'transitionend',
            () => {
              ghost.remove()
              // 🔥 ẨN DECK B NGAY TẠI ĐÂY (ĐÚNG NHỊP)
              TarotMap.deckB.classList.remove('is-visible')

              /* ==================================================
                 FLAT → TRẢI BÀI (ILLUSION FAN)
                 ================================================== */
              const slots = document.querySelectorAll('.tarot-spread-slot')
              if (!slots.length) {
                console.warn('[TarotFlow] no spread slots')
                return
              }

              runSpreadIllusion({
                fromEl: TarotMap.deckB,
                originEl: flat,
                slots,
                ghostCount: 8,
                duration: 900,
                onComplete() {
                  // 🎥 CAMERA: FOCUS BỘ TRẢI
                  const spreadArea = document.querySelector('.tarot-spread-area')
                  if (spreadArea) {
                    const r = spreadArea.getBoundingClientRect()
                    document.dispatchEvent(new CustomEvent('tarot:camera:focus', {
                      detail: {
                        y: r.top + r.height / 2
                      }
                    }))
                  }
                  const cardBackSrc =
                    TarotMap.deckB.querySelector('img')?.src

                  if (cardBackSrc) {
                    populateSpreadSlots(slots, cardBackSrc)
                  } else {
                    console.warn('[TarotFlow] no card back src')
                  }

                  /* ===== KẾT THÚC TRIỆT ĐỂ DECK B ===== */
                  TarotMap.deckC.classList.add('is-visible')
                  TarotMap.deckC.classList.add('is-interactive')

                  document
                    .querySelector('.tarot-spread-area')
                    ?.classList.add('is-interactive')

                  TarotState.phase = 'spread'
                  console.log('[TarotFlow] spread ready')

                  /* báo nghi thức hoàn tất */
                  document.dispatchEvent(
                    new CustomEvent('tarot:ritual-complete')
                  )
                }
              })
            },
            { once: true }
          )
        }, 4000)
      }
    })
  })
  window.addEventListener('tarot:reveal:done', () => {
    if (!TarotState.hasViewedReading) {
      TarotState.markReadingViewed()
    }
  })
}

/* ==================================================
   POPULATE SPREAD SLOTS (FINAL – ORIENTATION SAFE)
   ================================================== */
function populateSpreadSlots(slots, cardBackSrc) {
  const orientation = TarotState.spreadOrientation || []

  slots.forEach((slot, index) => {
    if (slot.querySelector('img')) return

    const img = document.createElement('img')
    img.src = cardBackSrc
    img.alt = 'Tarot card'
    img.className = 'tarot-card-back'

    img.style.width = '100%'
    img.style.height = '100%'
    img.style.display = 'block'

    if (orientation[index] === true) {
      img.style.transform = 'rotate(180deg)'
    } else {
      img.style.transform = 'none'
    }

    img.style.opacity = '0'
    img.style.transition = 'opacity 200ms ease, transform 200ms ease'

    slot.appendChild(img)

    requestAnimationFrame(() => {
      img.style.opacity = '1'
    })
  })
}
