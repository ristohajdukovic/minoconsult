import { access } from 'node:fs/promises';
import { chromium } from 'playwright-core';
import { createServer } from 'vite';

const browserCandidates = [
  process.env.PLAYWRIGHT_EXECUTABLE_PATH,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
].filter(Boolean);
let executablePath;
for (const candidate of browserCandidates) {
  try {
    await access(candidate);
    executablePath = candidate;
    break;
  } catch {
    // Try the next configured browser.
  }
}
if (!executablePath) throw new Error('No Chromium browser found. Set PLAYWRIGHT_EXECUTABLE_PATH and rerun.');

const server = await createServer({
  root: process.cwd(),
  server: { host: '127.0.0.1', port: 0, strictPort: false },
  logLevel: 'error',
});
await server.listen();
const address = server.httpServer.address();
const baseUrl = `http://127.0.0.1:${address.port}`;
const browser = await chromium.launch({ executablePath, headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  for (const [path, language] of [
    ['/', 'de'],
    ['/steuerberatung-wien', 'de'],
    ['/hr/', 'hr'],
    ['/hr/porezni-savjetnik-bec', 'hr'],
  ]) {
    const response = await page.goto(`${baseUrl}${path}`, { waitUntil: 'domcontentloaded' });
    if (!response?.ok()) throw new Error(`${path} returned ${response?.status()} in development mode`);
    await page.locator('main h1').waitFor();
    if (await page.locator('html').getAttribute('lang') !== language) throw new Error(`${path} has the wrong language in development mode`);
    if (await page.locator('main h1').count() !== 1) throw new Error(`${path} has an invalid H1 count in development mode`);
    if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) throw new Error(`${path} overflows at 390px in development mode`);
  }

  if (consoleErrors.length > 0) throw new Error(`Development browser console errors:\n${consoleErrors.join('\n')}`);
} finally {
  await browser.close();
  await server.close();
}

console.log('Development-mode smoke test passed for German and Croatian home and service routes.');
