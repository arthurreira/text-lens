const lens = document.createElement("div");
lens.id = "text-lens";
document.body.appendChild(lens);

let active = false;
let rafPending = false;
let lastEvent = null;
let enabled = true;

chrome.storage.sync.get(["enabled", "fontSize", "maxWidth"], (data) => {
  enabled = data.enabled ?? true;
  lens.style.fontSize = (data.fontSize || 22) + "px";
  lens.style.maxWidth = (data.maxWidth || 400) + "px";
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) enabled = changes.enabled.newValue;
  if (changes.fontSize) lens.style.fontSize = changes.fontSize.newValue + "px";
  if (changes.maxWidth) lens.style.maxWidth = changes.maxWidth.newValue + "px";
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