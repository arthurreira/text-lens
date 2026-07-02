chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "textlens-toggle",
    title: "Toggle Text Lens",
    contexts: ["all"]
  });

  chrome.storage.sync.set({ enabled: true });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "textlens-toggle") {
    chrome.storage.sync.get("enabled", (data) => {
      chrome.storage.sync.set({ enabled: !data.enabled });
    });
  }
});