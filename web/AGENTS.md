# Agent notes for `web/`

## Handing a browser window to the user

When you open a browser with Playwright CLI for the user to keep using, use the native viewport so the page resizes with the real window. Start the preview server first, then run from `web/`:

```sh
pnpm dlx --package @playwright/cli playwright-cli -s=algocasts-native open http://127.0.0.1:4173 --config tests/browser-native.config.json
```

Never hand the user a window that has called `page.setViewportSize()` for screenshot tests: the emulated viewport can stay fixed even after the Chrome window is resized. Run responsive checks in a separate context from the one the user works in (`viewport: null`).
