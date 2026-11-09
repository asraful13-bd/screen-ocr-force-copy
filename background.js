// =================================================================
// SCREEN OCR & FORCE COPY - BACKGROUND WORKER (FINAL STABLE)
// Developed by: Md. Asraful Alam
// Portfolio: https://asraful-portfolio-jet.vercel.app/
// =================================================================

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "trigger_ocr") {
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

      chrome.tabs.sendMessage(tab.id, { action: "start_selection" });
    } catch (err) {
      console.error("Shortcut trigger error:", err);
    }
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "crop_and_ocr") {
    handleCropAndOCR(request.coords, sender.tab.id);
  } else if (request.action === "manual_force_copy") {
    copyToClipboard(request.text);
  }
});

async function handleCropAndOCR(coords, tabId) {
  try {
    const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
    const base64Image = await cropImageToBase64(dataUrl, coords);

    const config = await chrome.storage.local.get(['ocrApiKey']);
    const apiKey = config.ocrApiKey || "K87899148788957";

    // ১. Engine 3 কল (বাংলা, ইংরেজি অটো ডিটেক্ট)
    let result = await callOcrApi(base64Image, apiKey, "3");

    // ২. Engine 2 ফলব্যাক
    if (!result || !result.ParsedResults || result.ParsedResults.length === 0 || !result.ParsedResults[0].ParsedText.trim()) {
      const fallbackResult = await callOcrApi(base64Image, apiKey, "2");
      if (fallbackResult && fallbackResult.ParsedResults && fallbackResult.ParsedResults.length > 0 && fallbackResult.ParsedResults[0].ParsedText.trim()) {
        result = fallbackResult;
      }
    }

    if (result && result.ParsedResults && result.ParsedResults.length > 0) {
      const extractedText = result.ParsedResults[0].ParsedText.trim();

      if (extractedText) {
        // উইন্ডোজ ক্লিপবোর্ডে ফোর্স কপি
        await copyToClipboard(extractedText);
        // রেজাল্ট দেখানো
        chrome.tabs.sendMessage(tabId, { action: "show_result", text: extractedText });
      } else {
        chrome.tabs.sendMessage(tabId, { action: "show_status", message: "কোনো লেখা চিহ্নিত করা যায়নি!", type: "error" });
      }
    } else {
      let msg = "OCR স্ক্যান সম্পন্ন হয়নি। অনুগ্রহ করে আবার চেষ্টা করুন।";
      if (result && result.ErrorMessage) {
        msg = Array.isArray(result.ErrorMessage) ? result.ErrorMessage[0] : result.ErrorMessage;
      } else if (result && result.ErrorDetails) {
        msg = result.ErrorDetails;
      }
      chrome.tabs.sendMessage(tabId, { action: "show_status", message: msg, type: "error" });
    }
  } catch (err) {
    chrome.tabs.sendMessage(tabId, { action: "show_status", message: "ত্রুটি: " + err.message, type: "error" });
  }
}

async function callOcrApi(base64Image, apiKey, engine) {
  try {
    const formData = new FormData();
    formData.append("base64Image", base64Image);
    formData.append("OCREngine", engine);
    formData.append("scale", "true");
    formData.append("apikey", apiKey);
    formData.append("detectOrientation", "true");

    const res = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body: formData
    });
    return await res.json();
  } catch (e) {
    return null;
  }
}

async function cropImageToBase64(dataUrl, coords) {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const bitmap = await createImageBitmap(blob);

  const dpr = coords.dpr || 1;
  const sx = coords.x * dpr;
  const sy = coords.y * dpr;
  const sw = coords.width * dpr;
  const sh = coords.height * dpr;

  const canvas = new OffscreenCanvas(sw, sh);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, sw, sh);

  const croppedBlob = await canvas.convertToBlob({ type: 'image/png' });
  const arrayBuffer = await croppedBlob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return "data:image/png;base64," + btoa(binary);
}

let creatingOffscreenPromise;
async function setupOffscreenDocument(path) {
  const offscreenUrl = chrome.runtime.getURL(path);
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [offscreenUrl]
  });

  if (existingContexts.length > 0) return;

  if (creatingOffscreenPromise) {
    await creatingOffscreenPromise;
  } else {
    creatingOffscreenPromise = chrome.offscreen.createDocument({
      url: path,
      reasons: ['CLIPBOARD'],
      justification: 'Write text to clipboard'
    });
    await creatingOffscreenPromise;
    creatingOffscreenPromise = null;
    await new Promise(r => setTimeout(r, 100));
  }
}

async function copyToClipboard(text) {
  await setupOffscreenDocument('offscreen.html');
  chrome.runtime.sendMessage({
    type: 'copy-data-to-clipboard',
    target: 'offscreen-doc',
    data: text
  });
}