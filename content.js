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

    const el = document.elementFromPoint(lastEvent.clientX, lastEvent.clientY);
    if (!el) return;

    const text = getReadableText(el);

    if (text) {
      lens.style.display = "block";
      lens.innerText = text.slice(0, 400);

      lens.style.left = lastEvent.pageX + 20 + "px";
      lens.style.top = lastEvent.pageY + 20 + "px";
    } else {
      lens.style.display = "none";
    }
  });
});