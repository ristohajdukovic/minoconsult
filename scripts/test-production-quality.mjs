import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright-core';
import { preview } from 'vite';
import { allPages } from '../src/config/routes.js';

const checks = [];
const failures = [];
let baseUrl;
const deploymentBase = '/minoconsult';

function pageUrl(path) {
  return `${baseUrl}${deploymentBase}${path}`;
}

function check(condition, message) {
  checks.push(message);
  if (!condition) failures.push(message);
}

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
      // Try the next browser.
    }
  }
  throw new Error('No Chromium browser found. Set PLAYWRIGHT_EXECUTABLE_PATH and rerun.');
}

function routeFile(path) {
  return path === '/' ? resolve('dist', 'index.html') : resolve('dist', path.replace(/^\//, ''), 'index.html');
}

const server = await preview({ root: process.cwd(), preview: { host: '127.0.0.1', port: 0 }, logLevel: 'error' });
baseUrl = `http://127.0.0.1:${server.httpServer.address().port}`;
const browser = await chromium.launch({ executablePath: await findBrowser(), headless: true });

try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const consoleErrors = [];
  const failedResources = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('response', (response) => {
    if (response.status() >= 400) failedResources.push(`${response.status()} ${response.url()}`);
  });

  for (const route of allPages) {
    const response = await page.goto(pageUrl(route.path), { waitUntil: 'domcontentloaded' });
    check(Boolean(response?.ok()), `${route.path} responds through direct navigation`);
    await page.locator('main h1').waitFor();
    check(await page.locator('main h1').count() === 1, `${route.path} has one runtime H1`);
    check(await page.locator('html').getAttribute('lang') === route.language, `${route.path} has the expected runtime language`);

    const html = await readFile(routeFile(route.path), 'utf8');
    check((html.match(/<link\s+rel="canonical"/gi) ?? []).length === 1, `${route.path} has one static canonical`);
    check((html.match(/<noscript>[\s\S]*?<h1\b/gi) ?? []).length === 1, `${route.path} has one static fallback H1`);
  }

  await page.goto(pageUrl('/'), { waitUntil: 'networkidle' });
  const imageDetails = await page.locator('img').evaluateAll((images) => images.map((image) => ({
    src: image.getAttribute('src'),
    width: image.getAttribute('width'),
    height: image.getAttribute('height'),
    loading: image.getAttribute('loading'),
  })));
  check(imageDetails.every((image) => Number(image.width) > 0 && Number(image.height) > 0), 'Every production image has explicit intrinsic dimensions');
  const heroImages = imageDetails.filter((image) => image.src?.includes('/images/hero/'));
  check(heroImages.length === 1 && heroImages[0].loading !== 'lazy', 'The single hero image is not lazy-loaded');
  const teamImage = imageDetails.find((image) => image.src?.includes('/images/team/'));
  check(teamImage?.loading === 'lazy', 'The below-the-fold team image is lazy-loaded');

  await page.evaluate(() => localStorage.setItem('mino_privacy_preferences_v1', '{malformed'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  check(await page.locator('.map-consent-placeholder').count() === 1, 'Malformed privacy storage falls back to blocked Google Maps');
  check(await page.locator('iframe').count() === 0, 'Malformed privacy storage does not load Google Maps');

  const notFoundResponse = await page.goto(pageUrl('/404.html'), { waitUntil: 'domcontentloaded' });
  check(Boolean(notFoundResponse?.ok()), 'Static 404 document is available');
  check(await page.locator('h1').count() === 1, '404 document has one H1');
  check(await page.locator('meta[name="robots"]').getAttribute('content') === 'noindex, follow', '404 document uses noindex, follow');
  check(await page.getByRole('link', { name: 'Deutsche Startseite' }).count() === 1, '404 offers German recovery');
  check(await page.getByRole('link', { name: 'Hrvatska početna stranica' }).count() === 1, '404 offers Croatian recovery');

  check(consoleErrors.length === 0, `Basic production navigation has no console errors${consoleErrors.length ? `: ${consoleErrors.join(' | ')}${failedResources.length ? ` (${failedResources.join(' | ')})` : ''}` : ''}`);
  await context.close();

  const noScriptContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const noScriptPage = await noScriptContext.newPage();
  for (const route of allPages) {
    const response = await noScriptPage.goto(pageUrl(route.path), { waitUntil: 'domcontentloaded' });
    check(Boolean(response?.ok()), `${route.path} remains available without JavaScript`);
    check(await noScriptPage.locator('main.static-fallback h1').count() === 1, `${route.path} exposes core content without JavaScript`);
    check(await noScriptPage.locator('a[href^="mailto:"]').count() >= 1, `${route.path} exposes email contact without JavaScript`);
    check(await noScriptPage.locator('a[href^="tel:"]').count() >= 1, `${route.path} exposes telephone contact without JavaScript`);
  }
  await noScriptContext.close();
} finally {
  await browser.close();
  await server.close();
}

if (failures.length) {
  console.error(`Production quality checks failed (${failures.length}/${checks.length}):\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Passed ${checks.length} production route, image, resilience, 404 and no-JavaScript checks.`);
