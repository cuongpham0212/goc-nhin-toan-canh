(() => {
  // <stdin>
  var deckSpread = document.getElementById("deck-spread");
  var slots = document.querySelectorAll(".tarot-slot");
  var TOTAL_CARDS = 12;
  var MAX_SELECT = 3;
  var selectedCount = 0;
  var isReady = false;
  function initDeckSpread() {
    if (!deckSpread || !slots.length) {
      console.warn("[deck-spread] Thi\u1EBFu DOM c\u1EA7n thi\u1EBFt");
      return;
    }
    window.addEventListener("tarot:shuffle:done", onShuffleDone);
  }
  document.addEventListener("DOMContentLoaded", initDeckSpread);
  function onShuffleDone() {
    isReady = true;
    showSpreadDeck();
    renderCards();
  }
  function showSpreadDeck() {
    deckSpread.classList.add("is-active");
    deckSpread.setAttribute("aria-hidden", "false");
  }
  function renderCards() {
    deckSpread.innerHTML = "";
    for (let i = 0; i < TOTAL_CARDS; i++) {
      const card = createSpreadCard(i);
      deckSpread.appendChild(card);
    }
  }
  function createSpreadCard(index) {
    const card = document.createElement("div");
    card.className = "tarot-spread-card";
    card.dataset.index = index;
    card.addEventListener("mouseenter", onCardHover);
    card.addEventListener("mouseleave", onCardLeave);
    card.addEventListener("click", onCardClick);
    return card;
  }
  function onCardHover(e) {
    if (!isReady) return;
    e.currentTarget.classList.add("is-hover");
  }
  function onCardLeave(e) {
    e.currentTarget.classList.remove("is-hover");
  }
  function onCardClick(e) {
    if (!isReady) return;
    if (selectedCount >= MAX_SELECT) return;
    const card = e.currentTarget;
    const slot = slots[selectedCount];
    if (!slot) return;
    selectedCount++;
    isReady = selectedCount < MAX_SELECT;
    flyCardToSlot(card, slot);
  }
  function flyCardToSlot(card, slot) {
    const cardRect = card.getBoundingClientRect();
    const slotRect = slot.getBoundingClientRect();
    const flyingCard = card.cloneNode(true);
    flyingCard.classList.add("is-flying");
    document.body.appendChild(flyingCard);
    setPosition(flyingCard, cardRect);
    card.classList.add("is-hidden");
    requestAnimationFrame(() => {
      const dx = slotRect.left - cardRect.left;
      const dy = slotRect.top - cardRect.top;
      flyingCard.style.transform = `translate(${dx}px, ${dy}px) scale(0.9)`;
    });
    flyingCard.addEventListener("transitionend", () => {
      flyingCard.remove();
      placeCardInSlot(slot);
      checkComplete();
    }, { once: true });
  }
  function placeCardInSlot(slot) {
    const card = document.createElement("div");
    card.className = "tarot-selected-card";
    slot.appendChild(card);
  }
  function checkComplete() {
    if (selectedCount === MAX_SELECT) {
      window.dispatchEvent(new CustomEvent("tarot:select:done"));
    }
  }
  function setPosition(el, rect) {
    el.style.position = "fixed";
    el.style.left = `${rect.left}px`;
    el.style.top = `${rect.top}px`;
  }
})();
