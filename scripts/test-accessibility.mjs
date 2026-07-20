import { access, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright-core';
import { preview } from 'vite';
import { allPages } from '../src/config/routes.js';

const failures = [];
const checks = [];
const baseUrl = 'http://127.0.0.1:4173';
const screenshotDir = process.env.A11Y_SCREENSHOT_DIR || join(tmpdir(), 'mino-a11y-after');

function check(condition, message) {
  checks.push(message);
  if (!condition) failures.push(message);
}

async function findBrowser() {
  const candidates = [
    process.env.PLAYWRIGHT_EXECUTABLE_PATH,
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
  ].filter(Boolean);
  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try the next configured browser.
    }
  }
  throw new Error('No Chromium browser found. Set PLAYWRIGHT_EXECUTABLE_PATH and rerun.');
}

async function goto(page, path) {
  const response = await page.goto(`${baseUrl}${path}`, { waitUntil: 'domcontentloaded' });
  check(Boolean(response?.ok()), `${path} returns a successful response`);
  await page.locator('.site-header').waitFor();
}

const server = await preview({
  root: process.cwd(),
  preview: { host: '127.0.0.1', port: 4173, strictPort: true },
  logLevel: 'error',
});
const browser = await chromium.launch({ executablePath: await findBrowser(), headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await goto(page, '/');
  await page.keyboard.press('Tab');
  check(await page.locator('.skip-link').evaluate((element) => document.activeElement === element), 'Skip link is the first keyboard focus target');
  check((await page.locator('.skip-link').boundingBox())?.y >= 0, 'Skip link is visible when focused');
  await page.keyboard.press('Enter');
  check(await page.locator('#main-content').evaluate((element) => document.activeElement === element), 'Skip link moves focus to the main landmark');

  const menuButton = page.locator('.site-header .hamburger-button');
  await menuButton.focus();
  await menuButton.click();
  check(await menuButton.getAttribute('aria-expanded') === 'true', 'Mobile menu exposes aria-expanded=true when open');
  check(await page.locator('#primary-mobile-menu').count() === 1, 'Mobile menu is connected through aria-controls');
  await page.waitForFunction(() => document.activeElement === document.querySelector('#primary-mobile-menu a'));
  check(await page.locator('#primary-mobile-menu a').first().evaluate((element) => document.activeElement === element), 'Opening mobile menu moves focus to its first link');
  await page.keyboard.press('Escape');
  check(await menuButton.getAttribute('aria-expanded') === 'false', 'Escape closes the mobile menu');
  await page.waitForFunction(() => document.activeElement === document.querySelector('.site-header .hamburger-button'));
  check(await menuButton.evaluate((element) => document.activeElement === element), 'Closing mobile menu restores its button focus');

  const hiddenSticky = page.locator('.delayed-sticky-header');
  check(await hiddenSticky.getAttribute('aria-hidden') === 'true' && await hiddenSticky.getAttribute('inert') !== null, 'Hidden sticky navigation is aria-hidden and inert');
  await page.evaluate(() => window.scrollTo(0, document.querySelector('#services').offsetTop + 700));
  await page.waitForTimeout(500);
  check(await hiddenSticky.getAttribute('aria-hidden') === 'false', 'Sticky navigation becomes exposed when visible');
  check(await page.locator('.site-header').getAttribute('inert') !== null, 'Original navigation becomes inert while sticky navigation is active');

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(350);
  const opener = page.locator('[data-hero-cta] button').first();
  await opener.click();
  const dialog = page.locator('[role="dialog"]');
  await dialog.waitFor();
  check(await dialog.count() === 1, 'Appointment interface exposes one modal dialog');
  check(await page.locator('#booking-title').evaluate((element) => document.activeElement === element), 'Dialog title receives focus when opened');
  const lastDialogControl = dialog.locator('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])').last();
  await lastDialogControl.focus();
  await page.keyboard.press('Tab');
  check(await dialog.locator('button[aria-label]').first().evaluate((element) => document.activeElement === element), 'Dialog traps forward focus at its boundary');
  await page.keyboard.press('Escape');
  check(await dialog.count() === 0, 'Escape closes the appointment dialog');
  await page.waitForFunction(() => document.activeElement === document.querySelector('[data-hero-cta] button'));
  check(await opener.evaluate((element) => document.activeElement === element), 'Dialog restores focus to the exact opener');

  await opener.click();
  await dialog.locator('button[type="submit"]').click();
  const errorSummary = page.locator('.form-error-summary');
  check(await errorSummary.count() === 1, 'Invalid form submission exposes an error summary');
  await page.waitForFunction(() => document.activeElement?.classList.contains('form-error-summary'));
  check(await errorSummary.evaluate((element) => document.activeElement === element), 'Invalid submission moves focus to the error summary');
  check(await page.locator('#booking-date').getAttribute('aria-invalid') === 'true', 'Invalid required fields use aria-invalid');
  const controlsWithoutNames = await dialog.locator('input, select, textarea').evaluateAll((elements) => elements.filter((element) => element.labels.length === 0 && !element.getAttribute('aria-label')).length);
  check(controlsWithoutNames === 0, 'Every dialog form control has an accessible name');
  await page.keyboard.press('Escape');

  const faqButton = page.locator('.faq-trigger').first();
  await faqButton.click();
  check(await faqButton.getAttribute('aria-expanded') === 'true', 'FAQ trigger updates aria-expanded');
  const faqPanelId = await faqButton.getAttribute('aria-controls');
  const faqPanel = page.locator(`#${faqPanelId}`);
  check(await faqPanel.getAttribute('role') === 'region' && await faqPanel.getAttribute('aria-hidden') === 'false', 'Open FAQ answer is an exposed labelled region');
  const faqIsClipped = await faqPanel.evaluate((element) => element.getBoundingClientRect().height + 1 < element.scrollHeight);
  check(!faqIsClipped, 'Open FAQ answers are not clipped');

  await goto(page, '/hr/');
  check(await page.locator('html').getAttribute('lang') === 'hr', 'Croatian homepage uses lang=hr');
  await goto(page, '/');
  check(await page.locator('html').getAttribute('lang') === 'de', 'German homepage uses lang=de');

  for (const route of allPages) {
    await goto(page, route.path);
    check(await page.locator('main h1').count() === 1, `${route.path} renders exactly one visible page H1`);
    const links = page.locator('.site-header .language-switcher a');
    check(await links.count() === 2, `${route.path} language switcher uses two real links`);
    check(await page.locator('.site-header .language-switcher a[lang="de"]').getAttribute('href') === route.alternatePaths.de, `${route.path} links to its German counterpart`);
    check(await page.locator('.site-header .language-switcher a[lang="hr"]').getAttribute('href') === route.alternatePaths.hr, `${route.path} links to its Croatian counterpart`);
    const imagesWithoutAlt = await page.locator('img').evaluateAll((images) => images.filter((image) => !image.hasAttribute('alt')).length);
    check(imagesWithoutAlt === 0, `${route.path} gives every image an alt attribute`);
  }

  const viewports = [
    [320, 568], [360, 800], [375, 812], [390, 844], [430, 932],
    [768, 1024], [820, 1180], [1024, 768], [1280, 800], [1440, 900],
  ];
  for (const [width, height] of viewports) {
    await page.setViewportSize({ width, height });
    for (const path of ['/', '/hr/', '/hr/porezno-savjetovanje-poduzetnici-bec']) {
      await goto(page, path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      check(overflow <= 1, `${path} has no horizontal overflow at ${width}x${height}`);
      const headingsInside = await page.locator('h1, h2, h3').evaluateAll((headings) => headings.every((heading) => {
        const rect = heading.getBoundingClientRect();
        return rect.left >= -1 && rect.right <= window.innerWidth + 1;
      }));
      check(headingsInside, `${path} headings stay inside ${width}px viewport`);
    }
  }

  await page.setViewportSize({ width: 320, height: 568 });
  await goto(page, '/hr/');
  const longFaqButton = page.locator('.faq-trigger').last();
  await longFaqButton.click();
  const longFaqPanel = page.locator(`#${await longFaqButton.getAttribute('aria-controls')}`);
  check(!await longFaqPanel.evaluate((element) => element.getBoundingClientRect().height + 1 < element.scrollHeight), 'Long Croatian FAQ answer is not clipped at 320px');

  await page.setViewportSize({ width: 390, height: 568 });
  await goto(page, '/hr/');
  await page.locator('[data-hero-cta] button').click();
  const mobileDialogBounds = await page.locator('[role="dialog"]').boundingBox();
  check(Boolean(mobileDialogBounds && mobileDialogBounds.width <= 390 && mobileDialogBounds.height <= 568), 'Dialog remains within a small mobile viewport');
  check(await page.locator('.booking-panel').evaluate((element) => element.scrollHeight >= element.clientHeight), 'Mobile dialog scrolls internally when needed');
  check(parseFloat(await page.locator('#booking-name').evaluate((element) => getComputedStyle(element).fontSize)) >= 16, 'Mobile form controls use at least 16px text');
  await page.keyboard.press('Escape');

  await page.setViewportSize({ width: 390, height: 844 });
  await goto(page, '/hr/porezno-savjetovanje-poduzetnici-bec');
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  check(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth) <= 1, 'Croatian mobile page remains free of horizontal overflow at 200% text size');
  check(await page.locator('h1').evaluate((heading) => heading.getBoundingClientRect().right <= window.innerWidth + 1), 'Long Croatian H1 stays inside the mobile viewport at 200% text size');

  await page.setViewportSize({ width: 1024, height: 768 });
  await goto(page, '/hr/porezno-savjetovanje-poduzetnici-bec');
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  const textResizeOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(textResizeOverflow <= 1, 'Page remains free of horizontal overflow with 200% root text size');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await goto(page, '/');
  const hiddenRevealCount = await page.locator('.reveal').evaluateAll((elements) => elements.filter((element) => getComputedStyle(element).opacity === '0').length);
  check(hiddenRevealCount === 0, 'Reduced-motion mode keeps all reveal content visible');
  const transitionDuration = await page.locator('.service-number-stack').evaluate((element) => getComputedStyle(element).transitionDuration);
  check(transitionDuration === '0s', 'Reduced-motion mode disables service-number animation');

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 390, height: 844 });
  await goto(page, '/');
  await page.keyboard.press('Tab');
  const focusStyle = await page.evaluate(() => ({
    style: getComputedStyle(document.activeElement).outlineStyle,
    width: parseFloat(getComputedStyle(document.activeElement).outlineWidth),
  }));
  check(focusStyle.style !== 'none' && focusStyle.width >= 2, 'Interactive controls retain a strong visible focus indicator');

  await mkdir(screenshotDir, { recursive: true });
  const captures = [
    ['de-home-390', '/', 390, 844], ['hr-home-390', '/hr/', 390, 844],
    ['de-home-768', '/', 768, 1024], ['de-home-1440', '/', 1440, 900], ['hr-home-1440', '/hr/', 1440, 900],
    ['de-service-1440', '/steuerberatung-wien', 1440, 900],
    ['hr-service-1440', '/hr/porezni-savjetnik-bec', 1440, 900],
  ];
  for (const [name, path, width, height] of captures) {
    await page.setViewportSize({ width, height });
    await goto(page, path);
    await page.waitForTimeout(800);
    await page.screenshot({ path: join(screenshotDir, `${name}.png`), fullPage: false });
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await goto(page, '/');
  await page.waitForTimeout(800);
  for (const [name, selector] of [['de-about', '#about'], ['de-faq', '#faq'], ['de-contact', '#contact']]) {
    const section = page.locator(selector);
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    await page.evaluate(() => document.activeElement?.blur());
    await section.screenshot({ path: join(screenshotDir, `${name}-1440.png`) });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await goto(page, '/');
  await page.locator('[data-hero-cta] button').click();
  await page.locator('[role="dialog"]').waitFor();
  await page.waitForTimeout(200);
  await page.screenshot({ path: join(screenshotDir, 'de-dialog-390.png'), fullPage: false });
  await page.keyboard.press('Escape');

  check(consoleErrors.length === 0, `Browser console has no errors${consoleErrors.length ? `: ${consoleErrors.join(' | ')}` : ''}`);
} finally {
  await browser.close();
  await server.close();
}

if (failures.length > 0) {
  console.error(`Accessibility and responsive checks failed (${failures.length}/${checks.length}):\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Passed ${checks.length} accessibility and responsive browser checks. Screenshots: ${screenshotDir}`);
