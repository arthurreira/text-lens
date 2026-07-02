const fontSize = document.getElementById("fontSize");
const maxWidth = document.getElementById("maxWidth");

const fontSizeValue = document.getElementById("fontSizeValue");
const maxWidthValue = document.getElementById("maxWidthValue");

chrome.storage.sync.get(["fontSize", "maxWidth"], (data) => {
  fontSize.value = data.fontSize ?? 22;
  maxWidth.value = data.maxWidth ?? 400;

  fontSizeValue.textContent = fontSize.value;
  maxWidthValue.textContent = maxWidth.value;
});

fontSize.addEventListener("input", () => {
  fontSizeValue.textContent = fontSize.value;
  chrome.storage.sync.set({ fontSize: Number(fontSize.value) });
});

maxWidth.addEventListener("input", () => {
  maxWidthValue.textContent = maxWidth.value;
  chrome.storage.sync.set({ maxWidth: Number(maxWidth.value) });
});