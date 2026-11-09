chrome.runtime.onMessage.addListener((message) => {
  if (message.target === 'offscreen-doc' && message.type === 'copy-data-to-clipboard') {
    handleClipboardWrite(message.data);
  }
});

function handleClipboardWrite(data) {
  try {
    const textEl = document.querySelector('#text');
    textEl.value = data;
    textEl.focus();
    textEl.select();
    document.execCommand('copy');
    console.log('Force copied to Windows clipboard successfully!');
  } catch (err) {
    console.error('Offscreen copy failed:', err);
  }
}