# Contributing to Design Inspector

Thanks for taking the time to contribute! Here's everything you need to get started.

---

## 🐛 Reporting Bugs

Before opening a bug report, please:
1. Check [existing issues](https://github.com/JoeMighty/design-inspector/issues) to avoid duplicates
2. Make sure you're running the latest version

When filing a bug, use the **Bug Report** issue template and include:
- Chrome version and OS
- Steps to reproduce
- What you expected vs what happened
- A screenshot if relevant

---

## 💡 Suggesting Features

Open a **Feature Request** issue and describe:
- What problem it solves
- How you'd expect it to work
- Any alternatives you've considered

---

## 🔧 Making Changes

### Setup
1. Fork the repository and clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/design-inspector.git
   cd design-inspector
   ```
2. Load `extension/` as an unpacked extension in Chrome (see README)
3. Create a branch for your change:
   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

### Branch Naming
| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feat/...` | `feat/copy-css-variable` |
| Bug fix | `fix/...` | `fix/tooltip-overflow` |
| Docs | `docs/...` | `docs/update-readme` |
| Refactor | `refactor/...` | `refactor/inspector-state` |

### Commit Messages
Use [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: add CSS variable detection
fix: tooltip not hiding on mouse leave
docs: update privacy policy link
chore: bump version to 3.1.0
```

### Before Submitting a PR
- Test on at least 2–3 different websites (simple, complex, SPA)
- Make sure the extension loads without console errors
- Update `CHANGELOG.md` under an `[Unreleased]` section
- Keep PRs focused — one feature or fix per PR

### Pull Request Process
1. Push your branch and open a PR against `main`
2. Fill in the PR template
3. A maintainer will review and may request changes
4. Once approved, it will be merged and included in the next release

---

## 📁 Code Structure

| File | Purpose |
|------|---------|
| `extension/manifest.json` | Extension manifest — permissions, entry points |
| `extension/background.js` | Service worker — relays messages between popup and page |
| `extension/inspector.js` | Content script — hover tooltip, highlight overlays, Escape key |
| `extension/scanner.js` | Content script — full page design token extraction |
| `extension/popup.html` | Popup UI markup and styles |
| `extension/popup.js` | Popup logic — tabs, toggle, scan, export, hover-to-highlight |

---

## 💅 Style Guide

- **No build tools** — plain vanilla JS, HTML, CSS only
- **No external dependencies** — everything must work offline after install
- Use `const`/`let`, arrow functions, template literals
- Keep functions small and named clearly
- Comment non-obvious logic

---

Thank you for helping make Design Inspector better!
