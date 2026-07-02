const lens = document.createElement("div");
lens.id = "text-lens";
document.body.appendChild(lens);

let active = false;
let rafPending = false;
let lastEvent = null;
let enabled = true;

let bgColorHex = "#f5f50a";
let bgOpacity = 96;

// Opacity is applied to the background only, so the text stays fully readable
function applyBackground() {
  const r = parseInt(bgColorHex.slice(1, 3), 16);
  const g = parseInt(bgColorHex.slice(3, 5), 16);
  const b = parseInt(bgColorHex.slice(5, 7), 16);

  lens.style.background = `rgba(${r}, ${g}, ${b}, ${bgOpacity / 100})`;

  // Pick light or dark text depending on background brightness
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  lens.style.color = luminance > 0.5 ? "#050505" : "#f5f5f5";
}

chrome.storage.sync.get(["enabled", "fontSize", "maxWidth", "bgColor", "opacity"], (data) => {
  enabled = data.enabled ?? true;
  lens.style.fontSize = (data.fontSize || 22) + "px";
  lens.style.maxWidth = (data.maxWidth || 400) + "px";
  bgColorHex = data.bgColor || "#f5f50a";
  bgOpacity = data.opacity ?? 96;
  applyBackground();
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) enabled = changes.enabled.newValue;
  if (changes.fontSize) lens.style.fontSize = changes.fontSize.newValue + "px";
  if (changes.maxWidth) lens.style.maxWidth = changes.maxWidth.newValue + "px";
  if (changes.bgColor) bgColorHex = changes.bgColor.newValue;
  if (changes.opacity) bgOpacity = changes.opacity.newValue;
  if (changes.bgColor || changes.opacity) applyBackground();
});

function activate(e) {
  if (!enabled) return;
  if (active) return;
  active = true;
  document.body.style.userSelect = "none";
}

function deactivate() {
  active = false;
  document.body.style.userSelect = "";
  lens.style.display = "none";
  lastEvent = null;
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Control") activate();
}, true);

document.addEventListener("keyup", (e) => {
  if (e.key === "Control") deactivate();
}, true);

function getReadableText(el) {
  if (!el) return "";
  let current = el;
  let depth = 0;

  while (current && depth < 4) {
    const text = current.innerText || current.textContent;
    if (text && text.trim().length > 40) return text.trim();
    current = current.parentElement;
    depth++;
  }
  return "";
}
document.addEventListener("mousemove", (e) => {
  if (!active || !e.ctrlKey) return;
  lastEvent = e;
  if (rafPending) return;
  rafPending = true;

  requestAnimationFrame(() => {
    rafPending = false;
    if (!active || !lastEvent) return;

    const { clientX, clientY, pageX, pageY } = lastEvent;
    const el = document.elementFromPoint(clientX, clientY);
    if (!el) return;

    const text = getReadableText(el);
    if (text) {
      lens.innerText = text.slice(0, 400);
      lens.style.display = "block";

      // measure lens after content is set
      const lensHeight = lens.offsetHeight;
      const lensWidth = lens.offsetWidth;
      const offset = 20;

      // vertical flip: not enough room below cursor -> show above
      const spaceBelow = window.innerHeight - clientY;
      let top;
      if (spaceBelow < lensHeight + offset) {
        top = pageY - lensHeight - offset; // place above cursor
      } else {
        top = pageY + offset; // default: below cursor
      }

      // horizontal clamp: keep it from overflowing right edge
      const spaceRight = window.innerWidth - clientX;
      let left;
      if (spaceRight < lensWidth + offset) {
        left = pageX - lensWidth - offset; // place left of cursor
      } else {
        left = pageX + offset; // default: right of cursor
      }

      lens.style.top = Math.max(top, 0) + "px";
      lens.style.left = Math.max(left, 0) + "px";
    } else {
      lens.style.display = "none";
    }
  });
});