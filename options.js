const fontSize = document.getElementById("fontSize");
const maxWidth = document.getElementById("maxWidth");
const bgColor = document.getElementById("bgColor");

const fontSizeValue = document.getElementById("fontSizeValue");
const maxWidthValue = document.getElementById("maxWidthValue");
const bgColorValue = document.getElementById("bgColorValue");

chrome.storage.sync.get(["fontSize", "maxWidth", "bgColor"], (data) => {
  fontSize.value = data.fontSize ?? 22;
  maxWidth.value = data.maxWidth ?? 400;
  bgColor.value = data.bgColor ?? "#f5f50a";

  fontSizeValue.textContent = fontSize.value;
  maxWidthValue.textContent = maxWidth.value;
  bgColorValue.textContent = bgColor.value;
});

fontSize.addEventListener("input", () => {
  fontSizeValue.textContent = fontSize.value;
  chrome.storage.sync.set({ fontSize: Number(fontSize.value) });
});

maxWidth.addEventListener("input", () => {
  maxWidthValue.textContent = maxWidth.value;
  chrome.storage.sync.set({ maxWidth: Number(maxWidth.value) });
});

bgColor.addEventListener("input", () => {
  bgColorValue.textContent = bgColor.value;
  chrome.storage.sync.set({ bgColor: bgColor.value });
});
