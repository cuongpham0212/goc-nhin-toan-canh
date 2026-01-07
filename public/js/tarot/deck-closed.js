(() => {
  // <stdin>
  var deckClosed = document.getElementById("deck-closed");
  var shuffleBtn = document.getElementById("tarot-shuffle-btn");
  var hasShuffled = false;
  function initDeckClosed() {
    if (!deckClosed || !shuffleBtn) {
      console.warn("[deck-closed] Thi\u1EBFu DOM c\u1EA7n thi\u1EBFt");
      return;
    }
    shuffleBtn.addEventListener("click", handleShuffleClick);
    console.log("[deck-closed] ready");
  }
  function handleShuffleClick() {
    if (hasShuffled) return;
    hasShuffled = true;
    console.log("[deck-closed] shuffle clicked");
    document.dispatchEvent(
      new CustomEvent("tarot:shuffle:start", {
        detail: { source: "deck-closed" }
      })
    );
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDeckClosed);
  } else {
    initDeckClosed();
  }
})();
