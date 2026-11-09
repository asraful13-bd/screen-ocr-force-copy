# ✂️ Screen OCR & Force Copy

An advanced, privacy-friendly Chrome Extension (Manifest V3) that captures protected screen areas (including copy-locked Google Sheets), auto-detects **Bengali and English** text using OCR, and forcefully copies it directly to the system clipboard.

---

## 🚀 Key Features

- ⚡ **Bypass Copy Restrictions:** Bypasses Google Sheets DLP / copy-protected views using Chrome Extension background privileges (Offscreen Document API).
- 🇧🇩 **Auto Language Detection:** Seamlessly extracts Bengali, English, numbers, and mixed text without manual language selection.
- ⌨️ **Quick Shortcut:** Press `Alt + S` on any website to immediately snip and copy text.
- 📋 **Guaranteed Clipboard Copy:** Bypasses webpage restrictions and writes directly to the Windows OS clipboard.
- 🎨 **Clean & Lightweight UI:** Modern, distraction-free popup and on-screen result modal.

---

## 🛠️ How to Install & Use (ব্যবহার নির্দেশিকা)

### Method 1: Using the `.zip` file (Recommended)
1. Download the latest `Screen-OCR-Force-Copy.zip` from the **Releases** section.
2. Extract (Unzip) the folder on your computer.
3. Open Google Chrome and go to `chrome://extensions/`.
4. Turn **ON** the **"Developer mode"** toggle in the top-right corner.
5. Click **"Load unpacked"** and select the extracted folder.
6. Done! Press **`Alt + S`** on any page to start capturing text.

---

## 📁 Project Structure

```text
├── manifest.json       # Manifest V3 Extension Configuration
├── background.js      # Service Worker handling capture & OCR fallback
├── content.js         # On-screen snipping overlay & result modal
├── content.css        # UI styling for overlay and result box
├── offscreen.html     # Background offscreen document for clipboard
├── offscreen.js       # Force clipboard write executor
├── popup.html         # Clean extension popup interface
├── popup.js           # Trigger controller for popup
└── icons/             # 16x16, 48x48, and 128x128 icons


---

## 👨‍💻 Developer & Author

**Md. Asraful Alam**  
Executive - Warehouse Operations | Steadfast Courier Limited  

- 🌐 **Portfolio:** [asraful-portfolio-jet.vercel.app](https://asraful-portfolio-jet.vercel.app/)  
- 📧 **Email:** asraful13.bd@gmail.com