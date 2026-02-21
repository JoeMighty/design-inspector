# Privacy Policy — Design Inspector

**Extension:** Design Inspector  
**Developer:** JoeMighty  
**GitHub:** [https://github.com/JoeMighty/](https://github.com/JoeMighty/)  
**Version:** 3.0.0  
**Last updated:** February 21, 2026  

---

## Overview

Design Inspector is a Chrome browser extension that helps developers and designers inspect fonts, colours, spacing, and other visual design elements on any web page. This policy explains clearly and completely what data the extension does and does not collect.

**The short version: Design Inspector does not collect, store, transmit, or share any personal data whatsoever.**

---

## What the Extension Does

When you activate Design Inspector on a page, it reads the **computed CSS styles** of elements on the currently active browser tab — including font properties, colour values, spacing, and layout properties. It also reads the URLs of images that are already publicly visible on the page.

This information is displayed temporarily inside:
- A floating tooltip rendered directly on the page (hover/inspect mode)
- The extension popup panel (scan mode)

All processing happens **entirely within your browser, on your device**. No data leaves your machine.

---

## Data Collection

| Data Type | Collected? | Stored? | Transmitted? |
|-----------|-----------|---------|--------------|
| Personal information | ❌ No | ❌ No | ❌ No |
| Browsing history | ❌ No | ❌ No | ❌ No |
| Page content or text | ❌ No | ❌ No | ❌ No |
| CSS styles of inspected elements | ✅ Read locally | ❌ No | ❌ No |
| Image URLs on inspected pages | ✅ Read locally | ❌ No | ❌ No |
| User location | ❌ No | ❌ No | ❌ No |
| Cookies or authentication data | ❌ No | ❌ No | ❌ No |
| Analytics or telemetry | ❌ No | ❌ No | ❌ No |

---

## Permissions Explained

Design Inspector requests the following Chrome permissions:

### `activeTab`
**Why:** Allows the extension to access the currently active tab when you click the extension icon. It cannot access other tabs, background tabs, or your browsing history.

### `scripting`
**Why:** Required to inject the inspection overlay and scanner scripts into the active page so they can read element styles. Scripts are only injected when you explicitly activate the extension.

### `storage`
**Why:** Used solely to remember whether Hover Inspector mode was active when you last closed the popup, so the UI can restore correctly. No personal data is stored — only a single boolean value (`true`/`false`).

### `host_permissions: <all_urls>`
**Why:** Allows the extension to run on any website you choose to inspect. Without this, the extension could only work on a pre-approved list of domains. This permission does **not** give the extension the ability to track your browsing, access your cookies, or read page content beyond CSS styles and image URLs.

---

## Local Storage

The extension uses Chrome's `storage.local` API to store one item:

```
inspectorActive: true | false
```

This value is stored only on your device and is never transmitted anywhere. You can clear it at any time by removing the extension.

---

## Third-Party Services

Design Inspector does **not** use any third-party services, analytics platforms, APIs, or CDNs. All code runs locally. There are no external network requests made by this extension.

---

## Children's Privacy

Design Inspector does not collect any data from anyone, including children. It is a developer tool intended for use by web developers and designers.

---

## Changes to This Policy

If this policy is updated, the new version will be published at this URL with a revised "Last updated" date. Significant changes will also be noted in the [CHANGELOG](../CHANGELOG.md).

---

## Contact

If you have any questions about this privacy policy or the extension, please open an issue on GitHub:

[https://github.com/JoeMighty/design-inspector/issues](https://github.com/JoeMighty/design-inspector/issues)

---

*Design Inspector is open source software, licensed under the [MIT License](../LICENSE). You are welcome to review the full source code to verify these claims.*
