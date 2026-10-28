import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL || 'http://localhost:4173/';

// Evidence project (tests/evidencias): one video + per-criterion screenshots per HU, mobile viewport.
// Only defined when EVIDENCIAS=1 (scripts/record-hu.mjs sets it), so `npm run test:e2e` keeps running the 21 tests.
const evidencias = process.env.EVIDENCIAS === '1';

export default defineConfig({
  testDir: 'tests',
  timeout: 60_000,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL,
    ...devices['iPhone 13'],
    browserName: 'chromium',
    viewport: { width: 390, height: 844 },
    locale: 'es-PE',
    serviceWorkers: 'block',
  },
  projects: [
    { name: 'prototipo', testIgnore: /tests[\\/]evidencias[\\/]/ },
    ...(evidencias
      ? [
          {
            name: 'evidencias',
            testDir: 'tests/evidencias',
            outputDir: 'test-results/evidencias',
            use: { video: { mode: 'on' as const, size: { width: 390, height: 844 } } },
          },
        ]
      : []),
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : { command: 'npm run preview -- --port 4173 --strictPort', url: 'http://localhost:4173/', reuseExistingServer: true, timeout: 60_000 },
});
