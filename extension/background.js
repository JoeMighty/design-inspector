// background.js — Design Inspector v3 service worker

// Relay messages that need tab context
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

  // ── Escape signal from content → forward to popup connections
  if (msg.type === 'INSPECTOR_ESCAPED') {
    // Store state so popup can read it on next open
    chrome.storage.local.set({ inspectorActive: false });
    return;
  }

  // ── Toggle inspector on/off
  if (msg.type === 'TOGGLE_INSPECTOR') {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (!tabs[0]) { sendResponse({ ok: false }); return; }
      const tabId = tabs[0].id;
      chrome.storage.local.set({ inspectorActive: msg.active });
      try {
        // Inject if not yet present
        await chrome.scripting.executeScript({ target: { tabId }, files: ['inspector.js'] });
        await chrome.tabs.sendMessage(tabId, { type: 'TOGGLE', active: msg.active });
        sendResponse({ ok: true });
      } catch (e) {
        sendResponse({ ok: false, error: e.message });
      }
    });
    return true;
  }

  // ── Highlight font / colour / clear — relay to active tab
  if (['HIGHLIGHT_FONT','HIGHLIGHT_COLOR','CLEAR_HIGHLIGHTS'].includes(msg.type)) {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (!tabs[0]) { sendResponse({ ok: false }); return; }
      try {
        await chrome.scripting.executeScript({ target: { tabId: tabs[0].id }, files: ['inspector.js'] });
        const resp = await chrome.tabs.sendMessage(tabs[0].id, msg);
        sendResponse(resp || { ok: true });
      } catch(e) {
        sendResponse({ ok: false, error: e.message });
      }
    });
    return true;
  }

  // ── Full-page scan
  if (msg.type === 'SCAN_PAGE') {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (!tabs[0]) { sendResponse({ ok: false }); return; }
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ['scanner.js']
        });
        sendResponse({ ok: true, data: results[0]?.result });
      } catch (e) {
        sendResponse({ ok: false, error: e.message });
      }
    });
    return true;
  }
});
