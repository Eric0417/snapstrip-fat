import { defineConfig, devices } from '@playwright/test';
import { resolve } from 'node:path';

const fakeCamera = resolve('tests/fixtures/face.y4m');

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4193',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    launchOptions: {
      args: [
        '--use-fake-device-for-media-stream',
        '--use-fake-ui-for-media-stream',
        `--use-file-for-fake-video-capture=${fakeCamera}`,
      ],
    },
  },
  webServer: {
    command: 'pnpm exec vite --host 127.0.0.1 --port 4193',
    url: 'http://127.0.0.1:4193',
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 7'] },
    },
  ],
});
