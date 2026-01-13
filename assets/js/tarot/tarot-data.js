/* ======================================================
   TAROT DATA – SINGLE SOURCE OF TRUTH
   ====================================================== */

let TAROT_CARDS = null

/* ================= LOAD DATA ================= */
export async function loadTarotData() {
  if (TAROT_CARDS) return TAROT_CARDS

  const res = await fetch('/tarot/index.json')
  if (!res.ok) throw new Error('Failed to load tarot data')

  TAROT_CARDS = await res.json()

  console.log('[TarotData] loaded', TAROT_CARDS.length)
  return TAROT_CARDS
}

/* ================= HELPERS ================= */
export function getTarotCardBySlug(slug) {
  if (!slug || !TAROT_CARDS) return null
  return TAROT_CARDS.find(c => c.slug === slug) || null
}
