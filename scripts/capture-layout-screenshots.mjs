import { access, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright-core';
import { preview } from 'vite';

const outputDir = resolve(process.argv[2] ?? 'artifacts/spacing/current');
const deploymentBase = '/minoconsult';

async function findBrowser() {
  for (const candidate of [
    process.env.PLAYWRIGHT_EXECUTABLE_PATH,
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
  ].filter(Boolean)) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try the next installed browser.
    }
  }
  throw new Error('No Chromium browser found. Set PLAYWRIGHT_EXECUTABLE_PATH and rerun.');
}

const captures = [
  { name: 'hero-de-390', path: '/', width: 390, height: 844 },
  { name: 'hero-hr-390', path: '/hr/', width: 390, height: 844 },
  { name: 'hero-de-1440', path: '/', width: 1440, height: 900 },
  { name: 'home-de-390', path: '/', width: 390, height: 844, fullPage: true },
  { name: 'home-hr-390', path: '/hr/', width: 390, height: 844, fullPage: true },
  { name: 'home-de-768', path: '/', width: 768, height: 1024, fullPage: true },
  { name: 'home-de-1440', path: '/', width: 1440, height: 900, fullPage: true },
  { name: 'home-de-1920', path: '/', width: 1920, height: 1080, fullPage: true },
  { name: 'services-390', path: '/', width: 390, height: 844, selector: '#services' },
  { name: 'services-1440', path: '/', width: 1440, height: 900, selector: '#services' },
  { name: 'about-390', path: '/', width: 390, height: 844, selector: '#about' },
  { name: 'about-1440', path: '/', width: 1440, height: 900, selector: '#about' },
  { name: 'faq-390', path: '/', width: 390, height: 844, selector: '#faq' },
  { name: 'footer-390', path: '/', width: 390, height: 844, selector: '#contact' },
  { name: 'footer-768', path: '/', width: 768, height: 1024, selector: '#contact' },
  { name: 'footer-1440', path: '/', width: 1440, height: 900, selector: '#contact' },
  { name: 'legal-footer-1440', path: '/impressum', width: 1440, height: 900, selector: '#contact' },
  { name: 'appointment-390', path: '/', width: 390, height: 844, dialog: true },
  { name: 'legal-de-1440', path: '/datenschutzerklaerung', width: 1440, height: 900, selector: 'main' },
];

await mkdir(outputDir, { recursive: true });
const server = await preview({
  root: process.cwd(),
  preview: { host: '127.0.0.1', port: 0, strictPort: false },
  logLevel: 'error',
});
const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
const browser = await chromium.launch({ executablePath: await findBrowser(), headless: true });

try {
  for (const capture of captures) {
    const context = await browser.newContext({
      viewport: { width: capture.width, height: capture.height },
      reducedMotion: 'reduce',
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await page.goto(`${origin}${deploymentBase}${capture.path}`, { waitUntil: 'networkidle' });
    await page.locator('main h1').first().waitFor();

    if (capture.dialog) {
      await page.locator('[data-hero-cta] button').first().click();
      const dialog = page.getByRole('dialog').first();
      await dialog.waitFor();
      await dialog.screenshot({ path: resolve(outputDir, `${capture.name}.png`), animations: 'disabled' });
    } else if (capture.selector) {
      const target = page.locator(capture.selector).first();
      await target.scrollIntoViewIfNeeded();
      await page.addStyleTag({ content: '.skip-link,.site-header,.delayed-sticky-header{display:none!important}' });
      await target.screenshot({ path: resolve(outputDir, `${capture.name}.png`), animations: 'disabled' });
    } else {
      await page.screenshot({
        path: resolve(outputDir, `${capture.name}.png`),
        fullPage: capture.fullPage,
        animations: 'disabled',
      });
    }
    await context.close();
  }
} finally {
  await browser.close();
  await server.close();
}

console.log(`Captured ${captures.length} layout screenshots in ${outputDir}.`);
