<div align="center">

# 🔍 Design Inspector

A Chrome extension for developers and designers to instantly inspect fonts, colours, spacing, and design tokens on any web page — just by hovering.

[![Version](https://img.shields.io/badge/version-3.0.0-6c63ff?style=flat-square)](https://github.com/JoeMighty/design-inspector/releases)
[![Manifest](https://img.shields.io/badge/manifest-v3-ff6584?style=flat-square)](https://developer.chrome.com/docs/extensions/mv3/)
[![License](https://img.shields.io/badge/license-MIT-4caf89?style=flat-square)](LICENSE)
[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Install%20Free-4285F4?style=flat-square&logo=google-chrome&logoColor=white)](https://chromewebstore.google.com/detail/design-inspector/bpmimhfgpdhceekmpifcfeafnlbijmpl)

</div>

-----

## 🚀 Install

**[Install from the Chrome Web Store](https://chromewebstore.google.com/detail/design-inspector/bpmimhfgpdhceekmpifcfeafnlbijmpl)**

-----

## ✨ Features

### 🖱️ Live Hover Inspector

Enable **Hover Mode** from the popup and move your cursor over any element on the page. A floating tooltip appears next to your cursor showing:

- **Typography** — font family, size, weight, line height, letter spacing
- **Colours** — text, background and border colours with hex codes and RGB values
- **Spacing** — padding, margin, and gap values
- **Box** — border radius, border, and box shadow

### 🔒 Click to Lock and Copy

Click any element to **lock the tooltip** in place. Once locked:

- The tooltip becomes fully interactive
- Click any row to **copy the value** to your clipboard
- Highlight box turns pink to show the element is locked
- Click the **✕ Unlock** button or press **Esc** to resume hovering

### ⌨️ Keyboard Shortcuts

|Key  |Action                                                 |
|-----|-------------------------------------------------------|
|`Esc`|Unlock tooltip (if locked), or exit hover mode entirely|

### 📊 Full Page Scan

Click **Scan Page** to extract a complete design report:

- All fonts used per element type (`h1`, `h2`, `p`, `a`, `button`, etc.)
- Complete colour palette sorted by usage frequency
- All images (both `<img>` tags and CSS background images)
- Design tokens (padding, margin, border radius, shadow, etc.)

### 🎨 Hover in Popup to Highlight on Page

After scanning, hover over any **colour swatch** or **font name** in the popup panel — matching elements are highlighted directly on the page with a dashed outline.

### 💾 Export

- **Copy JSON** — full structured data to clipboard
- **Download Report** — exports a Markdown `.md` file with everything organised

-----

## 📸 Screenshots

> Screenshots available on the [Chrome Web Store listing](https://chromewebstore.google.com/detail/design-inspector/bpmimhfgpdhceekmpifcfeafnlbijmpl)

-----

## 🚀 Installation

### From Chrome Web Store

**[Install Design Inspector](https://chromewebstore.google.com/detail/design-inspector/bpmimhfgpdhceekmpifcfeafnlbijmpl)** — free, no account required.

### Manual (Developer Mode)

1. Download the [latest release](https://github.com/JoeMighty/design-inspector/releases) zip
1. Unzip the file
1. Open Chrome and go to `chrome://extensions`
1. Enable **Developer Mode** (toggle in the top-right corner)
1. Click **Load Unpacked**
1. Select the `extension` folder from the unzipped download
1. Pin the **Design Inspector** icon to your toolbar

-----

## 🏗️ Project Structure

```
design-inspector/
├── extension/                 # Chrome extension source
│   ├── manifest.json          # Extension manifest (MV3)
│   ├── background.js          # Service worker — message relay
│   ├── inspector.js           # Content script — hover tooltip and highlights
│   ├── scanner.js             # Content script — full page scan
│   ├── popup.html             # Extension popup UI
│   ├── popup.js               # Popup logic
│   └── icons/
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
├── docs/
│   └── PRIVACY_POLICY.md      # Privacy policy (hosted via GitHub Pages)
├── assets/                    # Screenshots, promo images for store listing
├── .github/
│   └── ISSUE_TEMPLATE/        # Bug report and feature request templates
├── CHANGELOG.md               # Version history
├── CONTRIBUTING.md            # How to contribute
├── LICENSE                    # MIT License
└── README.md                  # This file
```

-----

## 🛠️ Development

### Prerequisites

- Google Chrome (or any Chromium-based browser)
- No build tools required — this is vanilla JS, HTML, and CSS

### Running Locally

1. Clone the repo:
   
   ```bash
   git clone https://github.com/JoeMighty/design-inspector.git
   cd design-inspector
   ```
1. Load the `extension/` folder in Chrome via Developer Mode (see Manual Installation above)
1. Make changes to files in `extension/`
1. Go to `chrome://extensions` and click the **refresh** icon on the extension card


## 🤝 Contributing

Contributions are welcome! Please read <CONTRIBUTING.md> before opening a pull request.

-----

## 📄 Privacy

Design Inspector does **not** collect, store, or transmit any user data. All processing happens locally in your browser. See the full [Privacy Policy](docs/PRIVACY_POLICY.md).

-----

## 📜 License

[MIT](LICENSE) © [JoeMighty](https://github.com/JoeMighty/)
