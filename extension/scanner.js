// content.js - Injected into the active tab to extract design data

function rgbToHex(rgb) {
  if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return null;
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;
  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
  return { hex, rgb: `rgb(${r}, ${g}, ${b})`, r, g, b };
}

function extractDesignData() {
  const data = {
    fonts: {},
    colors: {},
    images: [],
    designElements: {},
    pageInfo: {
      title: document.title,
      url: window.location.href
    }
  };

  // Font tags to inspect
  const fontTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'span', 'li', 'button', 'label', 'nav', 'header', 'footer', 'blockquote', 'code'];

  // Extract fonts per element type
  fontTags.forEach(tag => {
    const elements = document.querySelectorAll(tag);
    if (elements.length === 0) return;

    const sample = elements[0];
    const cs = window.getComputedStyle(sample);

    data.fonts[tag] = {
      count: elements.length,
      fontFamily: cs.fontFamily,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      fontStyle: cs.fontStyle,
      lineHeight: cs.lineHeight,
      letterSpacing: cs.letterSpacing,
      textTransform: cs.textTransform,
      color: cs.color,
      colorHex: rgbToHex(cs.color)
    };
  });

  // Extract colors from all visible elements
  const colorMap = {};
  const allElements = document.querySelectorAll('*');
  const checked = 0;
  let count = 0;

  allElements.forEach(el => {
    if (count > 2000) return; // limit for performance
    count++;
    const cs = window.getComputedStyle(el);

    const colorProps = {
      color: cs.color,
      backgroundColor: cs.backgroundColor,
      borderColor: cs.borderColor,
      outlineColor: cs.outlineColor
    };

    Object.entries(colorProps).forEach(([prop, val]) => {
      const parsed = rgbToHex(val);
      if (parsed && parsed.hex !== '#000000' || (parsed && el.tagName !== 'HTML' && el.tagName !== 'BODY')) {
        if (parsed) {
          if (!colorMap[parsed.hex]) {
            colorMap[parsed.hex] = { hex: parsed.hex, rgb: parsed.rgb, usedIn: [], count: 0 };
          }
          colorMap[parsed.hex].count++;
          if (colorMap[parsed.hex].usedIn.indexOf(prop) === -1) {
            colorMap[parsed.hex].usedIn.push(prop);
          }
        }
      }
    });
  });

  // Sort colors by frequency
  data.colors = Object.values(colorMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 40);

  // Extract images
  const imgEls = document.querySelectorAll('img');
  const bgImages = [];

  imgEls.forEach(img => {
    data.images.push({
      type: 'img',
      src: img.src || img.currentSrc,
      alt: img.alt || '',
      width: img.naturalWidth || img.width,
      height: img.naturalHeight || img.height,
      displayWidth: img.offsetWidth,
      displayHeight: img.offsetHeight
    });
  });

  // Extract background images from elements
  let bgCount = 0;
  allElements.forEach(el => {
    if (bgCount > 500) return;
    bgCount++;
    const cs = window.getComputedStyle(el);
    const bg = cs.backgroundImage;
    if (bg && bg !== 'none' && bg.includes('url')) {
      const urlMatch = bg.match(/url\(["']?([^"')]+)["']?\)/);
      if (urlMatch) {
        bgImages.push({
          type: 'background',
          src: urlMatch[1],
          element: el.tagName.toLowerCase() + (el.className ? '.' + el.className.split(' ')[0] : '')
        });
      }
    }
  });

  data.images = [...data.images, ...bgImages].slice(0, 60);

  // Extract design elements - sample from key element types
  const designSelectors = ['body', 'header', 'nav', 'main', 'section', 'article', 'div', 'button', 'input', 'a', 'card', '.card', '[class*="card"]', '[class*="btn"]', '[class*="container"]'];

  const designElements = {};

  designSelectors.forEach(sel => {
    try {
      const el = document.querySelector(sel);
      if (!el) return;
      const cs = window.getComputedStyle(el);
      const key = sel;
      designElements[key] = {
        padding: cs.padding,
        margin: cs.margin,
        borderRadius: cs.borderRadius,
        border: cs.border,
        boxShadow: cs.boxShadow,
        display: cs.display,
        flexDirection: cs.flexDirection,
        gap: cs.gap,
        maxWidth: cs.maxWidth,
        width: cs.width,
        transition: cs.transition
      };
    } catch(e) {}
  });

  data.designElements = designElements;

  return data;
}

extractDesignData();
