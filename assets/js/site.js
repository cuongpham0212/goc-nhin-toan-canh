document.addEventListener("scroll", () => {
  const doc = document.documentElement;
  const scrollTop = doc.scrollTop || document.body.scrollTop;
  const scrollHeight = doc.scrollHeight - doc.clientHeight;
  const progress = (scrollTop / scrollHeight) * 100;
  document.getElementById("reading-progress").style.width = progress + "%";
});
