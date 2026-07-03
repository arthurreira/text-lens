chrome.runtime.onInstalled.addListener((details) => {
  chrome.contextMenus.create({
    id: "textlens-toggle",
    title: "Toggle Text Lens",
    contexts: ["all"]
  });

  if (details.reason === "install") {
    chrome.storage.sync.set({ enabled: true });
  }
});

chrome.contextMenus.removeAll(() => {
  chrome.contextMenus.create({
    id: "textlens-toggle",
    title: "Toggle Text Lens",
    contexts: ["all"]
  });
});