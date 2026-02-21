/* popup.js — Design Inspector v3 */

let extractedData = null;
let activeTab     = 'fonts';
let hoverActive   = false;

/* ══════════════════════════════════════════════════════════ INIT */

(async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.url) {
    try {
      const u = new URL(tab.url);
      document.getElementById('pageUrl').textContent = u.hostname + u.pathname.slice(0, 32);
    } catch {}
  }
  // Restore toggle state (in case page reloaded / popup reopened)
  const stored = await chrome.storage.local.get('inspectorActive');
  if (stored.inspectorActive) {
    setHoverActive(true, false); // restore UI without re-sending toggle
  }
})();

/* ══════════════════════════════════════════════════════════ LISTEN FOR ESCAPE FROM PAGE */

// Poll storage for escape signal (content script sends INSPECTOR_ESCAPED → bg sets storage)
chrome.storage.onChanged.addListener((changes) => {
  if (changes.inspectorActive && changes.inspectorActive.newValue === false && hoverActive) {
    setHoverActive(false, false);
    showToast('Hover mode exited (Esc)');
  }
});

/* ══════════════════════════════════════════════════════════ TAB SWITCHING */

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeTab = tab.dataset.tab;
    if (extractedData) renderPanel(activeTab, extractedData);
    // Clear page highlights when switching tabs
    sendToPage({ type: 'CLEAR_HIGHLIGHTS' });
  });
});

/* ══════════════════════════════════════════════════════════ HOVER TOGGLE */

const hoverToggle = document.getElementById('hoverToggle');
const hoverCard   = document.getElementById('hoverCard');
const hoverBanner = document.getElementById('hoverBanner');
const hoverLabel  = document.getElementById('hoverLabel');

hoverToggle.addEventListener('change', () => {
  setHoverActive(hoverToggle.checked, true);
});

function setHoverActive(on, sendMsg = true) {
  hoverActive = on;
  hoverToggle.checked = on;
  hoverCard.classList.toggle('on', on);
  hoverBanner.classList.toggle('show', on);
  hoverLabel.textContent = on
    ? 'Active — hover page elements · click to lock · Esc to exit'
    : 'Move cursor over any element to see its design data';

  if (sendMsg) {
    chrome.runtime.sendMessage({ type: 'TOGGLE_INSPECTOR', active: on }, () => {});
    showToast(on ? 'Hover mode ON — inspect the page!' : 'Hover mode OFF');
  }
}

/* ══════════════════════════════════════════════════════════ SCAN */

document.getElementById('scanBtn').addEventListener('click', scan);

async function scan() {
  const btn = document.getElementById('scanBtn');
  btn.disabled = true;
  btn.textContent = 'Scanning…';

  const content = document.getElementById('mainContent');
  content.innerHTML = `<div class="loading"><div class="spinner"></div><div class="loading-text">Analysing page design…</div></div>`;

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['scanner.js']
    });

    extractedData = results[0]?.result;
    if (!extractedData) throw new Error('No data returned from page.');

    renderPanel(activeTab, extractedData);
    document.getElementById('exportBar').classList.add('show');
    showToast('Scan complete! Hover rows to highlight on page.');
  } catch (err) {
    content.innerHTML = `<div class="empty">
      <div class="empty-icon">⚠️</div>
      <div class="empty-title">Scan failed</div>
      <div class="empty-desc">${err.message}<br><small>Try a regular web page.</small></div>
    </div>`;
  }

  btn.disabled = false;
  btn.textContent = 'Re-Scan';
}

/* ══════════════════════════════════════════════════════════ RENDERERS */

function renderPanel(tab, data) {
  const content = document.getElementById('mainContent');
  switch (tab) {
    case 'fonts':  content.innerHTML = renderFonts(data.fonts);           break;
    case 'colors': content.innerHTML = renderColors(data.colors);         break;
    case 'images': content.innerHTML = renderImages(data.images);         break;
    case 'design': content.innerHTML = renderDesign(data.designElements); break;
  }
  attachPanelListeners();
}

/* ── FONTS ── */
function renderFonts(fonts) {
  const entries = Object.entries(fonts || {});
  if (!entries.length) return emptyState('No font data found.');
  return `<div class="sec-title">Typography — ${entries.length} element types<span class="hint-pill">Hover to highlight · click to copy</span></div>` +
    entries.map(([tag, f]) => {
      const colorHex  = f.colorHex?.hex;
      const fontShort = (f.fontFamily || '').split(',')[0].replace(/['"]/g,'').trim();
      return `<div class="font-card">
        <div class="font-card-header">
          <span class="font-tag">&lt;${tag}&gt;</span>
          <span class="font-count">${f.count} element${f.count !== 1 ? 's' : ''}</span>
        </div>
        <div class="font-preview" style="font-family:${f.fontFamily};font-size:${Math.min(parseInt(f.fontSize)||13,20)}px;font-weight:${f.fontWeight}">
          ${fontShort || 'System'} — The quick brown fox jumps
        </div>
        <div class="font-grid">
          ${fp('Family',    fontShort,       fontShort,         'font')}
          ${fp('Size',      f.fontSize,      f.fontSize)}
          ${fp('Weight',    f.fontWeight,    f.fontWeight)}
          ${fp('Line H',    f.lineHeight,    f.lineHeight)}
          ${fp('Tracking',  f.letterSpacing, f.letterSpacing)}
          ${fp('Style',     f.fontStyle,     f.fontStyle)}
          ${fp('Transform', f.textTransform, f.textTransform)}
          <div class="fprop copyable" data-copy="${colorHex || ''}" data-action="copy">
            <span class="k">Colour:</span>
            <span class="v">${colorHex
              ? `<span class="cdot" style="background:${colorHex}"></span>${colorHex}`
              : f.color || '—'}</span>
          </div>
        </div>
      </div>`;
    }).join('');
}

function fp(k, v, copyVal, highlightType) {
  const hAttr = highlightType === 'font' ? `data-highlight-font="${esc(v||'')}"` : '';
  return `<div class="fprop copyable" data-copy="${esc(copyVal||v||'')}" ${hAttr} data-action="${highlightType === 'font' ? 'font' : 'copy'}">
    <span class="k">${k}:</span><span class="v">${v || '—'}</span>
  </div>`;
}

/* ── COLOURS ── */
function renderColors(colors) {
  if (!colors?.length) return emptyState('No colours detected. Try scanning first.');
  return `<div class="sec-title">Colour Palette — ${colors.length} unique<span class="hint-pill">Hover to highlight · click to copy hex</span></div>
    <div class="color-grid">
      ${colors.map(c => `
        <div class="swatch copyable"
             data-copy="${c.hex}"
             data-highlight-color="${c.hex}"
             data-action="color"
             title="Click to copy ${c.hex}">
          <div class="swatch-color" style="background:${c.hex}">
            <div class="swatch-copy">⎘</div>
          </div>
          <div class="swatch-info">
            <div class="swatch-hex">${c.hex}</div>
            <div class="swatch-rgb">${c.rgb}</div>
            <div class="swatch-n">×${c.count}</div>
          </div>
        </div>`).join('')}
    </div>`;
}

/* ── IMAGES ── */
function renderImages(images) {
  if (!images?.length) return emptyState('No images found. Try scanning first.');
  const imgEls = images.filter(i => i.type === 'img');
  const bgEls  = images.filter(i => i.type === 'background');
  let html = '';
  if (imgEls.length) html += `<div class="sec-title">Image Elements — ${imgEls.length}</div><div class="img-grid">${imgEls.map(imgCard).join('')}</div>`;
  if (bgEls.length)  html += `<div class="sec-title">Background Images — ${bgEls.length}</div><div class="img-grid">${bgEls.map(imgCard).join('')}</div>`;
  return html;
}

function imgCard(img) {
  return `<div class="img-card copyable" data-copy="${esc(img.src)}" data-action="copy" title="Click to copy URL">
    <div class="img-thumb"><img src="${esc(img.src)}" onerror="this.parentElement.innerHTML='🖼️'" alt=""></div>
    <div class="img-info">
      <div class="img-badge">${img.type}</div>
      <div class="img-url">${truncUrl(img.src)}</div>
      ${img.width ? `<div class="img-dims">${img.width}×${img.height}px</div>` : ''}
    </div>
  </div>`;
}

/* ── DESIGN ── */
function renderDesign(elements) {
  const entries = Object.entries(elements || {});
  if (!entries.length) return emptyState('No design data. Try scanning first.');
  const filtered = entries.filter(([,p]) =>
    Object.values(p).some(v => v && !['auto','none','0px','normal','block',''].includes(v))
  );
  return `<div class="sec-title">Design Tokens — ${filtered.length} elements<span class="hint-pill">Click rows to copy</span></div>` +
    filtered.map(([sel, p]) => {
      const props = [
        ['padding', p.padding], ['margin', p.margin],
        ['radius', p.borderRadius], ['border', p.border],
        ['shadow', p.boxShadow], ['display', p.display],
        ['flex-dir', p.flexDirection], ['gap', p.gap],
        ['max-w', p.maxWidth], ['transition', p.transition]
      ].filter(([,v]) => v && !['none','auto','0px','normal','row',''].includes(v));
      if (!props.length) return '';
      return `<div class="design-card">
        <div class="design-head">${sel}</div>
        <div class="design-props">
          ${props.map(([k,v]) => `
            <div class="dprop copyable" data-copy="${esc(v)}" data-action="copy" title="Click to copy">
              <span class="k">${k}:</span><span class="v">${trunc(v,26)}</span>
            </div>`).join('')}
        </div>
      </div>`;
    }).join('');
}

/* ══════════════════════════════════════════════════════════ PANEL INTERACTION */

function attachPanelListeners() {
  const content = document.getElementById('mainContent');

  // Click → copy
  content.addEventListener('click', (e) => {
    const el = e.target.closest('.copyable');
    if (!el) return;
    const val = el.dataset.copy;
    if (!val) return;
    copyText(val);
    flashCopied(el);
  });

  // Hover → highlight on page
  content.addEventListener('mouseenter', (e) => {
    const el = e.target.closest('.copyable');
    if (!el) return;
    const action = el.dataset.action;
    if (action === 'font' && el.dataset.highlightFont) {
      sendToPage({ type: 'HIGHLIGHT_FONT', font: el.dataset.highlightFont });
    } else if (action === 'color' && el.dataset.highlightColor) {
      sendToPage({ type: 'HIGHLIGHT_COLOR', hex: el.dataset.highlightColor });
    }
  }, true);

  content.addEventListener('mouseleave', (e) => {
    const el = e.target.closest?.('.copyable');
    if (!el) return;
    const action = el.dataset.action;
    if (action === 'font' || action === 'color') {
      sendToPage({ type: 'CLEAR_HIGHLIGHTS' });
    }
  }, true);
}

function flashCopied(el) {
  el.classList.add('copied');
  showToast('Copied: ' + (el.dataset.copy || '').slice(0, 24));
  setTimeout(() => el.classList.remove('copied'), 1000);
}

/* ══════════════════════════════════════════════════════════ EXPORT */

document.getElementById('copyJsonBtn').addEventListener('click', () => {
  if (!extractedData) return;
  copyText(JSON.stringify(extractedData, null, 2));
  showToast('Full JSON copied!');
});

document.getElementById('downloadBtn').addEventListener('click', () => {
  if (!extractedData) return;
  const md  = generateMarkdown(extractedData);
  const blob = new Blob([md], { type: 'text/markdown' });
  const a   = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'design-report.md';
  a.click();
  showToast('Report downloaded!');
});

/* ══════════════════════════════════════════════════════════ GITHUB */

document.querySelectorAll('a[data-github]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    chrome.tabs.create({ url: 'https://github.com/JoeMighty/' });
  });
});

/* ══════════════════════════════════════════════════════════ HELPERS */

async function sendToPage(msg) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) await chrome.tabs.sendMessage(tab.id, msg);
  } catch {}
}

function copyText(text) {
  navigator.clipboard.writeText(text).catch(() => {});
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2200);
}

function emptyState(msg) {
  return `<div class="empty"><div class="empty-icon">🔎</div><div class="empty-desc">${msg}</div></div>`;
}

function esc(s)  { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function trunc(s,n) { return s && s.length > n ? s.slice(0,n)+'…' : s; }
function truncUrl(url) {
  try { const u = new URL(url); const p = u.pathname.split('/'); return u.hostname + '/…/' + p[p.length-1]; }
  catch { return (url||'').slice(0,36); }
}

function generateMarkdown(data) {
  let md = `# Design Report\n**URL:** ${data.pageInfo?.url}\n**Title:** ${data.pageInfo?.title}\n\n---\n\n`;
  md += `## Typography\n\n`;
  Object.entries(data.fonts||{}).forEach(([tag, f]) => {
    md += `### <${tag}> (${f.count} elements)\n- Font: ${f.fontFamily}\n- Size: ${f.fontSize}\n- Weight: ${f.fontWeight}\n`;
    md += `- Line Height: ${f.lineHeight}\n- Letter Spacing: ${f.letterSpacing}\n`;
    md += `- Colour: ${f.colorHex ? f.colorHex.hex + ' / ' + f.colorHex.rgb : f.color}\n\n`;
  });
  md += `## Colours (${data.colors?.length})\n\n`;
  (data.colors||[]).forEach(c => { md += `- **${c.hex}** | ${c.rgb} | used ×${c.count}\n`; });
  md += `\n## Images (${data.images?.length})\n\n`;
  (data.images||[]).forEach(i => { md += `- [${i.type.toUpperCase()}] ${i.src}${i.width ? ` (${i.width}×${i.height})` : ''}\n`; });
  md += `\n## Design Tokens\n\n`;
  Object.entries(data.designElements||{}).forEach(([sel, p]) => {
    md += `### ${sel}\n`;
    Object.entries(p).forEach(([k,v]) => { if (v && v !== 'auto' && v !== 'none' && v !== '0px') md += `- ${k}: ${v}\n`; });
    md += '\n';
  });
  md += `\n---\n*Generated by Design Inspector · [github.com/JoeMighty](https://github.com/JoeMighty/)*\n`;
  return md;
}
