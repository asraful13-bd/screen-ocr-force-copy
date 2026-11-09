document.addEventListener('DOMContentLoaded', () => {
  const btnCapture = document.getElementById('btnCapture');

  btnCapture.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
      if (!tab || !tab.id) return;

      await chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ['content.css']
      });

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });

      await chrome.tabs.sendMessage(tab.id, { action: "start_selection" });
      window.close();
    } catch (err) {
      console.error("Capture trigger error:", err);
      chrome.tabs.sendMessage(tab.id, { action: "start_selection" }, () => {
        window.close();
      });
    }
  });
});