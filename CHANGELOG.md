# Changelog

All notable changes to Design Inspector are documented here.

This project follows [Semantic Versioning](https://semver.org/) — `MAJOR.MINOR.PATCH`:
- **MAJOR** — breaking changes or complete rebuilds
- **MINOR** — new features, backwards compatible
- **PATCH** — bug fixes, small improvements

---

## [3.0.0] — 2026-02-21

### Added
- **Click to lock tooltip** — click any element to pin the tooltip in place
- **Copy from locked tooltip** — click any row inside the locked tooltip to copy its value to clipboard
- **Escape key support** — press Esc once to unlock, press again to exit hover mode entirely
- **Hover in popup → highlight on page** — hovering colour swatches or font names in the scan panel highlights matching elements on the live page with a dashed outline
- **Copyable rows in popup** — every property row, colour swatch, and image URL in the popup panel is now click-to-copy
- **Hint pills** — small labels in section headings explain available interactions
- Storage sync for hover mode state — toggle persists correctly if popup is closed and reopened
- Pink locked-state highlight border on the selected element

### Changed
- Tooltip now shows a "🔒 locked" badge and unlock button when pinned
- Tooltip hint text updates contextually (hover mode vs locked mode)
- Highlight box transitions from purple (hover) to pink (locked) to signal state
- Popup footer updated with GitHub credit for JoeMighty

### Fixed
- Toggle state now correctly resets when Escape is pressed from the page
- External highlights (from popup hover) now clear properly on mouse leave

---

## [2.0.0] — 2026-02-21

### Added
- **Live hover inspector mode** — floating tooltip follows the cursor over any page element
- **Element highlight** — purple outline box appears around the hovered element
- Toggle switch in popup to activate/deactivate hover mode
- Active mode banner in popup with pulsing indicator
- Background service worker (`background.js`) for message passing between popup and content script
- Separate `inspector.js` (hover overlay) and `scanner.js` (full page scan) content scripts
- GitHub credit and link in popup footer

### Changed
- Complete popup UI redesign — dark theme with gradient accents
- Extension split into two modes: interactive hover and full-page scan
- Manifest updated to v3.0.0 with `storage` permission for state persistence

---

## [1.0.0] — 2026-02-21

### Added
- Initial release
- Full-page scan extracting typography, colours, images, and design tokens
- Four tab panels: Fonts, Colours, Images, Design
- Font preview with live rendering
- Colour swatches with hex + RGB values, click to copy
- Image grid with thumbnails (img elements + CSS background images)
- Design tokens panel (padding, margin, border radius, shadow, etc.)
- Export to JSON (clipboard) and Markdown report (download)

---

[3.0.0]: https://github.com/JoeMighty/design-inspector/releases/tag/v3.0.0
[2.0.0]: https://github.com/JoeMighty/design-inspector/releases/tag/v2.0.0
[1.0.0]: https://github.com/JoeMighty/design-inspector/releases/tag/v1.0.0
