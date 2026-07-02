const fontSize = document.getElementById("fontSize");
const maxWidth = document.getElementById("maxWidth");
const bgColor = document.getElementById("bgColor");
const opacity = document.getElementById("opacity");

const fontSizeValue = document.getElementById("fontSizeValue");
const maxWidthValue = document.getElementById("maxWidthValue");
const bgColorValue = document.getElementById("bgColorValue");
const opacityValue = document.getElementById("opacityValue");

chrome.storage.sync.get(["fontSize", "maxWidth", "bgColor", "opacity"], (data) => {
  fontSize.value = data.fontSize ?? 22;
  maxWidth.value = data.maxWidth ?? 400;
  bgColor.value = data.bgColor ?? "#f5f50a";
  opacity.value = data.opacity ?? 96;

  fontSizeValue.textContent = fontSize.value;
  maxWidthValue.textContent = maxWidth.value;
  bgColorValue.textContent = bgColor.value;
  opacityValue.textContent = opacity.value + "%";
});

fontSize.addEventListener("input", () => {
  fontSizeValue.textContent = fontSize.value;
  saveFontSize(fontSize.value);
});

maxWidth.addEventListener("input", () => {
  maxWidthValue.textContent = maxWidth.value;
  saveMaxWidth(maxWidth.value);
});

bgColor.addEventListener("input", () => {
  bgColorValue.textContent = bgColor.value;
  saveBgColor(bgColor.value);
});

opacity.addEventListener("input", () => {
  opacityValue.textContent = opacity.value + "%";
  saveOpacity(opacity.value);
});

// Debounce helper to avoid exceeding storage write quotas
function debounce(fn, wait) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

const saveFontSize = debounce((val) => {
  chrome.storage.sync.set({ fontSize: Number(val) });
}, 700);

const saveMaxWidth = debounce((val) => {
  chrome.storage.sync.set({ maxWidth: Number(val) });
}, 700);

const saveBgColor = debounce((val) => {
  chrome.storage.sync.set({ bgColor: val });
}, 700);

const saveOpacity = debounce((val) => {
  chrome.storage.sync.set({ opacity: Number(val) });
}, 700);
