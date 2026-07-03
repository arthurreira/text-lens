// Text Lens content script
const lens = document.createElement("div");
lens.id = "text-lens";
document.body.appendChild(lens);

let active = false;
let rafPending = false;
let lastEvent = null;
let enabled = true;

let bgColorHex = "#f5f50a";
let bgOpacity = 96;
let modifier = "Control"; // 'Control' | 'Control+Shift'

let isCtrlPressed = false;
let isShiftPressed = false;

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

// Load saved settings (guard against extension reload invalidation)
try {
  chrome.storage.sync.get(["enabled", "fontSize", "maxWidth", "bgColor", "opacity", "modifier"], (data) => {
    enabled = data.enabled ?? true;
    lens.style.fontSize = (data.fontSize || 22) + "px";
    lens.style.maxWidth = (data.maxWidth || 400) + "px";
    bgColorHex = data.bgColor || "#f5f50a";
    bgOpacity = data.opacity ?? 96;
    modifier = data.modifier || modifier;
    // migrate old/unsafe values: Alt and Control+Alt are problematic in browsers
    if (modifier === "Alt" || modifier === "Control+Alt") modifier = "Control";
    applyBackground();
  });
} catch (err) {
  // Extension context might be invalidated during reload — fail gracefully
}

// Listen for setting changes
try {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "sync") return;
    if (changes.enabled) enabled = changes.enabled.newValue;
    if (changes.fontSize) lens.style.fontSize = changes.fontSize.newValue + "px";
    if (changes.maxWidth) lens.style.maxWidth = changes.maxWidth.newValue + "px";
    if (changes.bgColor) bgColorHex = changes.bgColor.newValue;
    if (changes.opacity) bgOpacity = changes.opacity.newValue;
    if (changes.modifier) modifier = changes.modifier.newValue;
    if (changes.bgColor || changes.opacity) applyBackground();
  });
} catch (err) {
  // onChanged registration shouldn't fail, but be defensive
}

function activate() {
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

function checkModifierActivation() {
  if (modifier === "Control") {
    if (isCtrlPressed) activate(); else deactivate();
  } else if (modifier === "Control+Shift") {
    if (isCtrlPressed && isShiftPressed) activate(); else deactivate();
  }
}

// Track modifier key state
document.addEventListener("keydown", (e) => {
  if (e.key === "Control") isCtrlPressed = true;
  if (e.key === "Shift") isShiftPressed = true;
  checkModifierActivation();
}, true);

document.addEventListener("keyup", (e) => {
  if (e.key === "Control") isCtrlPressed = false;
  if (e.key === "Shift") isShiftPressed = false;
  checkModifierActivation();
}, true);

// Reset on window blur / visibility change to avoid "stuck" modifier state
window.addEventListener("blur", () => {
  isCtrlPressed = false;
  isShiftPressed = false;
  deactivate();
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    isCtrlPressed = false;
    isShiftPressed = false;
    deactivate();
  }
});

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
  if (!active) return;
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
