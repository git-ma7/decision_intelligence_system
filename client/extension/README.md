# Module 4.1: Decision Capture System - Chrome Extension

## Overview
This is the browser extension component of the Decision Intelligence Platform. It passively observes browser activity, enriches events with metadata, filters noise, and outputs privacy-scrubbed event batches to Module 4.2 for classification.

## Development Setup

### Prerequisites
- Google Chrome browser
- Node.js (optional, for development tooling)

### Installation for Development

1. **Load the extension in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the `client/extension/` directory

2. **Verify installation**:
   - The extension icon should appear in the Chrome toolbar
   - Click the icon to open the popup
   - Check the browser console for initialization messages

### Extension Icons

**Note**: Placeholder icons are needed in the `assets/` directory. You can:
- Use any PNG images (16x16, 48x48, 128x128 pixels)
- Generate icons using online tools
- Create simple colored squares as placeholders

For now, create simple placeholder icons:
```bash
# From the client/extension directory
# You can use any image editor or online tool to create these
# Temporary: Use any 16x16, 48x48, 128x128 PNG files
```

## Project Structure

```
client/extension/
├── manifest.json              # Extension configuration (Manifest V3)
├── background/
│   └── service-worker.js      # Background service worker (main logic)
├── content/
│   └── content-script.js      # Injected into web pages
├── popup/
│   ├── popup.html             # Extension popup UI
│   ├── popup.js               # Popup logic
│   └── popup.css              # Popup styles
├── config/
│   └── (future: configuration files)
├── utils/
│   └── (future: utility modules)
└── assets/
    ├── icon-16.png            # Extension icon (16x16)
    ├── icon-48.png            # Extension icon (48x48)
    └── icon-128.png           # Extension icon (128x128)
```

## Testing

### Manual Testing
1. Load the extension in Chrome (see Installation above)
2. Open the browser console (F12 → Console tab)
3. Look for initialization message: "Decision Intelligence System - Module 4.1 initialized"
4. Navigate to any website
5. Check console for content script message: "Decision Intelligence content script loaded on: [URL]"
6. Click the extension icon to verify popup opens

### Verification Checklist
- [ ] Extension loads without errors
- [ ] Service worker initializes (check console)
- [ ] Content script injects into pages (check console)
- [ ] Popup opens and displays correctly
- [ ] No permission errors in console

## Current Implementation Status

### ✅ Completed
- Project structure
- Manifest V3 configuration
- Basic service worker skeleton
- Content script skeleton
- Popup UI skeleton

### 🚧 In Progress
- Stage 1: Authentication & Initialization

### 📋 Planned
- Stage 2: Multi-Channel Event Observation
- Stage 3: Event Enrichment & Metadata Extraction
- Stage 4: Session Management & Event Correlation
- Stage 5: Local Heuristic Filtering
- Stage 6: Local Event Buffering
- Stage 7: Privacy Scrubbing & Anonymization
- Stage 8: Output to Module 4.2

## Development Guidelines

### Commit Strategy
- Make small, testable commits
- Test each change before committing
- Use descriptive commit messages

### Code Style
- Use ES6+ JavaScript features
- Add comments for complex logic
- Keep functions small and focused
- Use meaningful variable names

## Troubleshooting

### Extension won't load
- Check manifest.json for syntax errors
- Ensure all referenced files exist
- Check Chrome console for error messages

### Content script not injecting
- Verify manifest.json content_scripts configuration
- Check that pages match the URL patterns
- Look for CSP (Content Security Policy) errors

### Service worker not starting
- Check for syntax errors in service-worker.js
- Verify background.service_worker path in manifest.json
- Check Chrome extension console (chrome://extensions/ → Details → Inspect views: service worker)

## Resources

- [Chrome Extension Manifest V3 Documentation](https://developer.chrome.com/docs/extensions/mv3/)
- [Service Workers in Extensions](https://developer.chrome.com/docs/extensions/mv3/service_workers/)
- [Content Scripts](https://developer.chrome.com/docs/extensions/mv3/content_scripts/)
