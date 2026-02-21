/* inspector.js — Design Inspector v3
   Features:
   - Hover to preview element info in floating tooltip
   - Click to LOCK the tooltip (stays open, becomes interactive)
   - Locked tooltip: click any row to copy value to clipboard
   - Escape key deactivates inspector entirely
   - Messages from popup can highlight specific elements by selector/font/colour
*/

(function () {
  if (window.__designInspectorLoaded) {
    // Already loaded — just re-listen (handles re-injection)
    return;
  }
  window.__designInspectorLoaded = true;

  /* ═══════════════════════════════════════════════════════ HELPERS */

  function rgbToHex(rgb) {
    if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return null;
    const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!m) return null;
    const hex = '#' + [m[1], m[2], m[3]].map(v => (+v).toString(16).padStart(2, '0')).join('').toUpperCase();
    return { hex, rgb: `rgb(${m[1]}, ${m[2]}, ${m[3]})` };
  }

  function getInfo(el) {
    const cs  = window.getComputedStyle(el);
    const tag = el.tagName.toLowerCase();
    const id  = el.id ? `#${el.id}` : '';
    const cls = el.className && typeof el.className === 'string'
      ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : '';

    const color  = rgbToHex(cs.color);
    const bg     = rgbToHex(cs.backgroundColor);
    const border = rgbToHex(cs.borderColor);
    const fontShort = cs.fontFamily.split(',')[0].replace(/['"]/g, '').trim();

    let bgImg = null;
    if (cs.backgroundImage && cs.backgroundImage !== 'none') {
      const bm = cs.backgroundImage.match(/url\(["']?([^"')]+)["']?\)/);
      if (bm) bgImg = bm[1];
    }
    const imgSrc = tag === 'img' ? el.src : null;

    return {
      selector: `${tag}${id}${cls}`,
      tag,
      typography: {
        family: fontShort,
        size:   cs.fontSize,
        weight: cs.fontWeight,
        lineHeight:    cs.lineHeight,
        letterSpacing: cs.letterSpacing,
        textTransform: cs.textTransform,
        textAlign:     cs.textAlign,
      },
      colors: { text: color, background: bg, border },
      spacing: { padding: cs.padding, margin: cs.margin, gap: cs.gap },
      box: {
        borderRadius: cs.borderRadius,
        border:       cs.border,
        boxShadow:    cs.boxShadow,
        width:  cs.width,
        height: cs.height,
      },
      image:     imgSrc || bgImg,
      imageType: imgSrc ? 'src' : (bgImg ? 'background' : null),
    };
  }

  /* ═══════════════════════════════════════════════════════ STYLES */

  const TID = '__di_tooltip__';
  const HID = '__di_highlight__';
  const SID = '__di_style__';

  function injectStyles() {
    if (document.getElementById(SID)) return;
    const s = document.createElement('style');
    s.id = SID;
    s.textContent = `
      #${TID} {
        position: fixed;
        z-index: 2147483647;
        width: 290px;
        background: #0f1117;
        color: #e8eaf6;
        border: 1px solid #2e3350;
        border-radius: 12px;
        font-family: 'Segoe UI', system-ui, sans-serif;
        font-size: 11px;
        box-shadow: 0 12px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(108,99,255,0.25);
        opacity: 0;
        transform: scale(0.95) translateY(4px);
        transition: opacity 0.15s ease, transform 0.15s ease;
        overflow: hidden;
        pointer-events: none;
        user-select: none;
      }
      #${TID}.visible   { opacity: 1; transform: scale(1) translateY(0); }
      #${TID}.locked    {
        pointer-events: all;
        border-color: #6c63ff;
        box-shadow: 0 12px 40px rgba(0,0,0,0.7), 0 0 0 2px rgba(108,99,255,0.5);
      }

      #${TID} .di-topbar {
        background: linear-gradient(135deg, #6c63ff, #ff6584);
        padding: 7px 10px;
        display: flex; align-items: center; gap: 6px;
      }
      #${TID} .di-tag {
        background: rgba(0,0,0,0.3); border-radius: 4px;
        padding: 1px 6px; font-family: monospace; font-size: 11px; color: white;
        font-weight: 700;
      }
      #${TID} .di-sel {
        font-size: 9px; color: rgba(255,255,255,0.8);
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        flex: 1; min-width: 0;
      }
      #${TID} .di-lock-badge {
        font-size: 9px; background: rgba(0,0,0,0.3); color: white;
        padding: 1px 6px; border-radius: 10px; white-space: nowrap; flex-shrink: 0;
      }
      #${TID} .di-hint {
        background: rgba(108,99,255,0.15);
        border-bottom: 1px solid rgba(108,99,255,0.2);
        padding: 4px 10px;
        font-size: 9px; color: #a0a8d0; text-align: center; letter-spacing: 0.3px;
      }
      #${TID} .di-body { padding: 7px 9px; display: flex; flex-direction: column; gap: 5px; }

      #${TID} .di-sec {
        background: #1a1d27; border: 1px solid #2e3350; border-radius: 7px; overflow: hidden;
      }
      #${TID} .di-sec-title {
        font-size: 9px; font-weight: 700; text-transform: uppercase;
        letter-spacing: 0.8px; color: #7b82a6;
        padding: 4px 9px 3px; border-bottom: 1px solid #2e3350;
      }
      #${TID} .di-rows { padding: 3px 0; }

      #${TID} .di-row {
        display: flex; align-items: center; padding: 3px 9px; gap: 6px;
        cursor: default; transition: background 0.1s;
        position: relative;
      }
      #${TID}.locked .di-row { cursor: pointer; }
      #${TID}.locked .di-row:hover { background: rgba(108,99,255,0.12); }
      #${TID}.locked .di-row:hover::after {
        content: '⎘ copy';
        position: absolute; right: 8px;
        font-size: 8px; color: #6c63ff; font-weight: 700;
        letter-spacing: 0.3px;
      }
      #${TID} .di-row.copied { background: rgba(76,175,137,0.15) !important; }
      #${TID} .di-row.copied::after { content: '✓ copied' !important; color: #4caf89 !important; }

      #${TID} .di-key {
        color: #7b82a6; min-width: 68px; flex-shrink: 0; font-size: 10px;
      }
      #${TID} .di-val {
        color: #e8eaf6; font-family: monospace; font-size: 10px;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        flex: 1; min-width: 0;
      }
      #${TID} .di-dot {
        width: 11px; height: 11px; border-radius: 3px;
        border: 1px solid rgba(255,255,255,0.15); flex-shrink: 0;
      }
      #${TID} .di-img-thumb {
        width: 100%; height: 56px; object-fit: cover;
        display: block; background: #22263a;
      }
      #${TID} .di-close {
        margin: 6px 9px 2px;
        background: rgba(255,255,255,0.06);
        border: 1px solid #2e3350;
        color: #7b82a6; border-radius: 6px;
        font-size: 10px; font-weight: 700; padding: 4px;
        cursor: pointer; text-align: center; letter-spacing: 0.3px;
        transition: background 0.15s, color 0.15s;
      }
      #${TID} .di-close:hover { background: rgba(255,100,132,0.15); color: #ff6584; }

      #${HID} {
        position: fixed;
        z-index: 2147483646;
        pointer-events: none;
        border: 2px solid #6c63ff;
        background: rgba(108,99,255,0.07);
        border-radius: 4px;
        transition: left 0.08s ease, top 0.08s ease, width 0.08s ease, height 0.08s ease;
        box-shadow: 0 0 0 1px rgba(108,99,255,0.2), inset 0 0 16px rgba(108,99,255,0.04);
      }
      #${HID}.locked-hl {
        border-color: #ff6584;
        background: rgba(255,101,132,0.07);
        box-shadow: 0 0 0 1px rgba(255,101,132,0.25);
      }

      /* External highlight used by popup hover */
      .__di_ext_hl__ {
        outline: 2px dashed #6c63ff !important;
        outline-offset: 2px !important;
        background: rgba(108,99,255,0.06) !important;
        transition: outline 0.2s, background 0.2s !important;
      }
    `;
    document.head.appendChild(s);
  }

  function ensureOverlays() {
    injectStyles();
    if (!document.getElementById(TID)) {
      const t = document.createElement('div');
      t.id = TID;
      document.body.appendChild(t);
    }
    if (!document.getElementById(HID)) {
      const h = document.createElement('div');
      h.id = HID;
      h.style.display = 'none';
      document.body.appendChild(h);
    }
  }

  function removeOverlays() {
    document.getElementById(TID)?.remove();
    document.getElementById(HID)?.remove();
    document.getElementById(SID)?.remove();
  }

  /* ═══════════════════════════════════════════════════════ BUILD HTML */

  function buildHTML(info, locked) {
    const colorRow = (label, c, copyVal) => c ? `
      <div class="di-row" data-copy="${copyVal || c.hex}">
        <span class="di-key">${label}</span>
        <div class="di-dot" style="background:${c.hex}"></div>
        <span class="di-val">${c.hex} <span style="color:#7b82a6;font-size:9px">${c.rgb}</span></span>
      </div>` : '';

    const skip0 = ['normal','none','0px','auto',''];
    const row = (key, val, copyVal, skipList = skip0) =>
      val && !skipList.includes(val) ? `
        <div class="di-row" data-copy="${copyVal !== undefined ? copyVal : val}">
          <span class="di-key">${key}</span>
          <span class="di-val">${val}</span>
        </div>` : '';

    const hasTyp  = info.typography.family || info.typography.size;
    const hasCols = info.colors.text || info.colors.background;
    const hasSpc  = ['padding','margin','gap'].some(k => info.spacing[k] && info.spacing[k] !== '0px');
    const hasBox  = ['borderRadius','border','boxShadow'].some(k => info.box[k] && !['none','0px'].includes(info.box[k]));

    return `
      <div class="di-topbar">
        <span class="di-tag">&lt;${info.tag}&gt;</span>
        <span class="di-sel">${info.selector}</span>
        ${locked ? '<span class="di-lock-badge">🔒 locked</span>' : ''}
      </div>
      ${locked ? '<div class="di-hint">Click any row to copy value</div>' : '<div class="di-hint">Click element to lock &amp; copy values · Esc to exit</div>'}
      <div class="di-body">
        ${info.image ? `
          <div class="di-sec">
            <div class="di-sec-title">🖼 Image</div>
            <img class="di-img-thumb" src="${info.image}" onerror="this.style.display='none'">
            <div class="di-rows">
              <div class="di-row" data-copy="${info.image}"><span class="di-key">url</span><span class="di-val">${info.image.split('/').pop().slice(0,28)}</span></div>
            </div>
          </div>` : ''}

        ${hasTyp ? `
          <div class="di-sec">
            <div class="di-sec-title">Aa Typography</div>
            <div class="di-rows">
              ${row('font',     info.typography.family)}
              ${row('size',     info.typography.size)}
              ${row('weight',   info.typography.weight,   undefined, ['400','normal',''])}
              ${row('line-h',   info.typography.lineHeight, undefined, ['normal',''])}
              ${row('tracking', info.typography.letterSpacing, undefined, ['normal','0px',''])}
              ${row('transform',info.typography.textTransform, undefined, ['none',''])}
            </div>
          </div>` : ''}

        ${hasCols ? `
          <div class="di-sec">
            <div class="di-sec-title">🎨 Colours</div>
            <div class="di-rows">
              ${colorRow('text',       info.colors.text)}
              ${colorRow('background', info.colors.background)}
              ${colorRow('border',     info.colors.border)}
            </div>
          </div>` : ''}

        ${hasSpc ? `
          <div class="di-sec">
            <div class="di-sec-title">📐 Spacing</div>
            <div class="di-rows">
              ${row('padding', info.spacing.padding, undefined, ['0px',''])}
              ${row('margin',  info.spacing.margin,  undefined, ['0px',''])}
              ${row('gap',     info.spacing.gap,     undefined, ['0px','normal',''])}
            </div>
          </div>` : ''}

        ${hasBox ? `
          <div class="di-sec">
            <div class="di-sec-title">⬜ Box</div>
            <div class="di-rows">
              ${row('radius', info.box.borderRadius, undefined, ['0px',''])}
              ${row('border', info.box.border,       undefined, ['none','0px',''])}
              ${row('shadow', info.box.boxShadow,    undefined, ['none',''])}
            </div>
          </div>` : ''}

        ${locked ? '<div class="di-close">✕ Unlock &amp; resume hovering</div>' : ''}
      </div>`;
  }

  /* ═══════════════════════════════════════════════════════ CLIPBOARD */

  function copyText(text) {
    try {
      navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); ta.remove();
    }
  }

  /* ═══════════════════════════════════════════════════════ POSITION TOOLTIP */

  function positionTooltip(tooltip, mouseX, mouseY) {
    const ttW = 290, ttH = Math.min(tooltip.scrollHeight + 20, 420);
    const margin = 16;
    const vw = window.innerWidth, vh = window.innerHeight;
    let x = mouseX + margin;
    let y = mouseY + margin;
    if (x + ttW > vw - 4)   x = mouseX - ttW - margin;
    if (y + ttH > vh - 4)   y = mouseY - ttH - margin;
    if (x < 4) x = 4;
    if (y < 4) y = 4;
    tooltip.style.left = x + 'px';
    tooltip.style.top  = y + 'px';
  }

  /* ═══════════════════════════════════════════════════════ STATE */

  let active   = false;
  let locked   = false;   // tooltip is pinned, user clicked
  let lockedEl = null;    // the element that is locked
  let lastEl   = null;
  let lastMouseX = 0, lastMouseY = 0;
  let moveTimer  = null;

  /* ═══════════════════════════════════════════════════════ HOVER */

  function showForEl(el, mx, my) {
    if (locked) return;
    const tooltip   = document.getElementById(TID);
    const highlight = document.getElementById(HID);
    if (!tooltip || !highlight) return;

    const rect = el.getBoundingClientRect();
    highlight.style.display = 'block';
    highlight.style.left    = rect.left   + 'px';
    highlight.style.top     = rect.top    + 'px';
    highlight.style.width   = rect.width  + 'px';
    highlight.style.height  = rect.height + 'px';
    highlight.classList.remove('locked-hl');

    const info = getInfo(el);
    tooltip.innerHTML = buildHTML(info, false);
    tooltip.classList.remove('locked');
    positionTooltip(tooltip, mx, my);
    tooltip.classList.add('visible');
  }

  function onMouseMove(e) {
    if (locked) return;
    lastMouseX = e.clientX; lastMouseY = e.clientY;
    clearTimeout(moveTimer);
    moveTimer = setTimeout(() => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el) return;
      if (el.id === TID || el.id === HID || el.closest?.('#' + TID)) return;
      if (el === lastEl) return;
      lastEl = el;
      showForEl(el, e.clientX, e.clientY);
    }, 35);
  }

  /* ═══════════════════════════════════════════════════════ CLICK — LOCK */

  function onPageClick(e) {
    if (!active) return;
    const el = e.target;

    // Clicks inside a locked tooltip
    if (el.closest?.('#' + TID)) {
      // Close / unlock button
      if (el.classList.contains('di-close') || el.closest?.('.di-close')) {
        unlock();
        e.preventDefault(); e.stopPropagation();
        return;
      }
      // Copy row
      const row = el.closest?.('.di-row');
      if (locked && row) {
        const val = row.dataset.copy;
        if (val) {
          copyText(val);
          row.classList.add('copied');
          setTimeout(() => row.classList.remove('copied'), 1200);
        }
        e.preventDefault(); e.stopPropagation();
        return;
      }
      return;
    }

    // Click on page element — lock tooltip
    if (el.id === TID || el.id === HID) return;

    e.preventDefault();
    e.stopPropagation();

    locked   = true;
    lockedEl = el;

    const tooltip   = document.getElementById(TID);
    const highlight = document.getElementById(HID);
    if (!tooltip || !highlight) return;

    const rect = el.getBoundingClientRect();
    highlight.style.left   = rect.left   + 'px';
    highlight.style.top    = rect.top    + 'px';
    highlight.style.width  = rect.width  + 'px';
    highlight.style.height = rect.height + 'px';
    highlight.classList.add('locked-hl');

    const info = getInfo(el);
    tooltip.innerHTML = buildHTML(info, true);
    tooltip.classList.add('locked', 'visible');

    // Attach copy listeners (event delegation is already on document)
  }

  function unlock() {
    locked   = false;
    lockedEl = null;
    const tooltip   = document.getElementById(TID);
    const highlight = document.getElementById(HID);
    if (tooltip)   { tooltip.classList.remove('locked'); tooltip.classList.remove('visible'); }
    if (highlight) { highlight.classList.remove('locked-hl'); }
    lastEl = null;
  }

  /* ═══════════════════════════════════════════════════════ ESCAPE KEY */

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      if (locked) {
        unlock();           // first press: just unlock
      } else {
        deactivate();       // second press (or first if not locked): full exit
        // Tell popup to update toggle state
        try { chrome.runtime.sendMessage({ type: 'INSPECTOR_ESCAPED' }); } catch {}
      }
    }
  }

  /* ═══════════════════════════════════════════════════════ EXTERNAL HIGHLIGHT (from popup) */

  let extHighlightedEls = [];

  function clearExtHighlights() {
    extHighlightedEls.forEach(el => el.classList.remove('__di_ext_hl__'));
    extHighlightedEls = [];
  }

  function highlightByFont(fontName) {
    clearExtHighlights();
    document.querySelectorAll('*').forEach(el => {
      const cs = window.getComputedStyle(el);
      const fam = cs.fontFamily.split(',')[0].replace(/['"]/g,'').trim();
      if (fam.toLowerCase() === fontName.toLowerCase()) {
        el.classList.add('__di_ext_hl__');
        extHighlightedEls.push(el);
      }
    });
    if (extHighlightedEls.length) {
      extHighlightedEls[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function highlightByColor(hex) {
    clearExtHighlights();
    const target = hex.toUpperCase();
    function toHex(rgb) {
      const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!m) return null;
      return '#' + [m[1],m[2],m[3]].map(v => (+v).toString(16).padStart(2,'0')).join('').toUpperCase();
    }
    document.querySelectorAll('*').forEach(el => {
      const cs = window.getComputedStyle(el);
      const checks = [cs.color, cs.backgroundColor, cs.borderColor];
      if (checks.some(v => toHex(v) === target)) {
        el.classList.add('__di_ext_hl__');
        extHighlightedEls.push(el);
      }
    });
    if (extHighlightedEls.length) {
      extHighlightedEls[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /* ═══════════════════════════════════════════════════════ ACTIVATE / DEACTIVATE */

  function activate() {
    active = true;
    ensureOverlays();
    document.addEventListener('mousemove', onMouseMove, true);
    document.addEventListener('click',     onPageClick, true);
    document.addEventListener('keydown',   onKeyDown,   true);
    document.body.style.cursor = 'crosshair';
  }

  function deactivate() {
    active = false;
    unlock();
    clearExtHighlights();
    removeOverlays();
    document.removeEventListener('mousemove', onMouseMove, true);
    document.removeEventListener('click',     onPageClick, true);
    document.removeEventListener('keydown',   onKeyDown,   true);
    document.body.style.cursor = '';
    lastEl = null;
  }

  /* ═══════════════════════════════════════════════════════ MESSAGE LISTENER */

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'TOGGLE') {
      msg.active ? activate() : deactivate();
      sendResponse({ ok: true });
    }
    if (msg.type === 'HIGHLIGHT_FONT') {
      highlightByFont(msg.font);
      sendResponse({ count: extHighlightedEls.length });
    }
    if (msg.type === 'HIGHLIGHT_COLOR') {
      highlightByColor(msg.hex);
      sendResponse({ count: extHighlightedEls.length });
    }
    if (msg.type === 'CLEAR_HIGHLIGHTS') {
      clearExtHighlights();
      sendResponse({ ok: true });
    }
    if (msg.type === 'GET_STATUS') {
      sendResponse({ active, locked });
    }
  });

})();
