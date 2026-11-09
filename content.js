// =================================================================
// SCREEN OCR & FORCE COPY - CONTENT SCRIPT (ENGLISH UI)
// Developed by: Md. Asraful Alam
// Portfolio: https://asraful-portfolio-jet.vercel.app/
// =================================================================

(() => {
  if (window.__sf_ocr_initialized) {
    return;
  }
  window.__sf_ocr_initialized = true;

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "start_selection") {
      createSnippingOverlay();
    } else if (request.action === "show_status") {
      showToast(request.message, request.type);
    } else if (request.action === "show_result") {
      showResultModal(request.text);
    }
  });

  function createSnippingOverlay() {
    if (document.getElementById('sf-ocr-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'sf-ocr-overlay';

    const selectionBox = document.createElement('div');
    selectionBox.id = 'sf-ocr-box';
    overlay.appendChild(selectionBox);
    document.body.appendChild(overlay);

    let isSelecting = false;
    let startX = 0, startY = 0;

    overlay.addEventListener('mousedown', (e) => {
      isSelecting = true;
      startX = e.clientX;
      startY = e.clientY;
      selectionBox.style.left = `${startX}px`;
      selectionBox.style.top = `${startY}px`;
      selectionBox.style.width = '0px';
      selectionBox.style.height = '0px';
      selectionBox.style.display = 'block';
    });

    overlay.addEventListener('mousemove', (e) => {
      if (!isSelecting) return;
      const currentX = e.clientX;
      const currentY = e.clientY;
      const left = Math.min(startX, currentX);
      const top = Math.min(startY, currentY);
      const width = Math.abs(currentX - startX);
      const height = Math.abs(currentY - startY);

      selectionBox.style.left = `${left}px`;
      selectionBox.style.top = `${top}px`;
      selectionBox.style.width = `${width}px`;
      selectionBox.style.height = `${height}px`;
    });

    overlay.addEventListener('mouseup', () => {
      if (!isSelecting) return;
      isSelecting = false;

      const rect = selectionBox.getBoundingClientRect();
      overlay.remove();

      if (rect.width > 10 && rect.height > 10) {
        showToast("⏳ Scanning text...", "info");
        chrome.runtime.sendMessage({
          action: "crop_and_ocr",
          coords: {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
            dpr: window.devicePixelRatio || 1
          }
        });
      }
    });

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        overlay.remove();
        window.removeEventListener('keydown', handleEsc);
      }
    };
    window.addEventListener('keydown', handleEsc);
  }

  function showToast(msg, type) {
    let toast = document.getElementById('sf-ocr-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'sf-ocr-toast';
      document.body.appendChild(toast);
    }
    toast.innerText = msg;
    toast.className = `sf-show ${type}`;
    setTimeout(() => {
      if (toast) toast.className = toast.className.replace('sf-show', '');
    }, 3500);
  }

  function showResultModal(text) {
    let modal = document.getElementById('sf-ocr-result-modal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'sf-ocr-result-modal';
    modal.innerHTML = `
      <div class="sf-header">
        <span>✅ Text Copied to Clipboard!</span>
        <button id="sf-close-btn">&times;</button>
      </div>
      <textarea id="sf-result-text" rows="5">${text}</textarea>
      <button id="sf-manual-copy-btn">📋 Copy Again</button>
      <div class="sf-dev-badge">
        Developed by <a href="https://asraful-portfolio-jet.vercel.app/" target="_blank">Md Asraful Alam ↗</a>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('sf-close-btn').onclick = () => modal.remove();
    document.getElementById('sf-manual-copy-btn').onclick = () => {
      chrome.runtime.sendMessage({ action: "manual_force_copy", text: text });
      showToast("Copied to clipboard!", "success");
    };
  }
})();