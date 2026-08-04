import { access, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright-core';
import { preview } from 'vite';
import { allPages } from '../src/config/routes.js';

const failures = [];
const checks = [];
const baseUrl = 'http://127.0.0.1:4173';
const deploymentBase = '/minoconsult';
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
  const response = await page.goto(`${baseUrl}${deploymentBase}${path}`, { waitUntil: 'domcontentloaded' });
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
  const primaryLanguageLink = page.locator('.site-header .language-switcher a[lang="de"]');
  await primaryLanguageLink.focus();
  await page.evaluate(() => window.scrollTo(0, document.querySelector('#services').offsetTop + 700));
  await page.waitForFunction(() => document.querySelector('.delayed-sticky-header')?.getAttribute('aria-hidden') === 'false');
  check(await hiddenSticky.getAttribute('aria-hidden') === 'false', 'Sticky navigation becomes exposed when visible');
  check(await page.locator('.site-header').getAttribute('inert') !== null, 'Original navigation becomes inert while sticky navigation is active');
  check(await page.evaluate(() => document.activeElement?.closest('.delayed-sticky-header') !== null && document.activeElement?.closest('[inert]') === null), 'Focus transfers from the primary header into the exposed sticky header');

  const stickyMenuButton = page.locator('.delayed-sticky-header .hamburger-button');
  await stickyMenuButton.focus();
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.activeElement?.closest('#sticky-mobile-menu') !== null);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForFunction(() => document.querySelector('.delayed-sticky-header')?.getAttribute('aria-hidden') === 'true');
  check(await page.evaluate(() => document.activeElement === document.querySelector('.site-header .hamburger-button') && document.activeElement?.closest('[inert]') === null), 'Closing the sticky mobile-menu tree during handoff restores focus to the exposed primary menu button');

  for (const scrollPastHero of [true, false, true, false]) {
    await page.evaluate((pastHero) => window.scrollTo(0, pastHero ? document.querySelector('#services').offsetTop + 700 : 0), scrollPastHero);
    await page.waitForTimeout(80);
    check(await page.evaluate(() => {
      const headers = [...document.querySelectorAll('.site-header, .delayed-sticky-header')];
      return headers.filter((header) => !header.hasAttribute('inert') && header.getAttribute('aria-hidden') !== 'true').length === 1;
    }), 'Rapid scrolling exposes exactly one sequentially focusable header tree');
    const activeHeaderSelector = scrollPastHero ? '.delayed-sticky-header' : '.site-header';
    await page.locator(`${activeHeaderSelector} .language-switcher a[lang="de"]`).focus();
    await page.keyboard.press('Tab');
    check(await page.evaluate(() => document.activeElement?.closest('[inert]') === null), 'Sequential focus never enters the inactive header after rapid scrolling');
  }

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
  check(await page.locator('#booking-name').getAttribute('aria-invalid') === 'true' && await page.locator('#booking-email').getAttribute('aria-invalid') === 'true', 'Invalid required fields use aria-invalid');
  check(await page.locator('#booking-date').getAttribute('required') === null && await page.locator('#booking-time').getAttribute('aria-required') === null, 'Date and time preferences remain optional');
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
    check(await page.locator('main').count() === 1, `${route.path} exposes one main landmark`);
    const headingsFollowOrder = await page.locator('main h1, main h2, main h3, main h4, main h5, main h6').evaluateAll((headings) => {
      const levels = headings.map((heading) => Number(heading.tagName.slice(1)));
      return levels[0] === 1 && levels.every((level, index) => index === 0 || level <= levels[index - 1] + 1);
    });
    check(headingsFollowOrder, `${route.path} keeps a logical main-content heading order`);
    const unnamedNavigationCount = await page.locator('nav').evaluateAll((landmarks) => landmarks.filter((landmark) => !landmark.getAttribute('aria-label') && !landmark.getAttribute('aria-labelledby')).length);
    check(unnamedNavigationCount === 0, `${route.path} gives every navigation landmark an accessible name`);
    const links = page.locator('.site-header .language-switcher a');
    check(await links.count() === 2, `${route.path} language switcher uses two real links`);
    check(await page.locator('.site-header .language-switcher a[lang="de"]').getAttribute('href') === `${deploymentBase}${route.alternatePaths.de}`, `${route.path} links to its German counterpart`);
    check(await page.locator('.site-header .language-switcher a[lang="hr"]').getAttribute('href') === `${deploymentBase}${route.alternatePaths.hr}`, `${route.path} links to its Croatian counterpart`);
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

  await page.setViewportSize({ width: 1440, height: 900 });
  await goto(page, '/');
  check(await page.locator('html').evaluate((element) => getComputedStyle(element).scrollBehavior) === 'auto', 'Homepage section links do not use prolonged smooth scrolling');
  await page.locator('.site-header .desktop-nav a[href="#services"]').click();
  await page.waitForTimeout(50);
  const anchorPosition = await page.evaluate(() => ({
    targetTop: document.querySelector('#services').getBoundingClientRect().top,
    stickyHeight: document.querySelector('.delayed-sticky-header').getBoundingClientRect().height,
  }));
  check(anchorPosition.targetTop >= anchorPosition.stickyHeight && anchorPosition.targetTop <= anchorPosition.stickyHeight + 32, 'Sticky-header offset keeps the services heading visible after anchor navigation');

  for (const path of ['/', '/steuerberatung-wien', '/impressum', '/datenschutzerklaerung']) {
    await goto(page, path);
    await page.keyboard.press('Tab');
    const focusFailures = await page.locator('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])').evaluateAll((elements) => elements.filter((element) => {
      if (element.closest('[inert]') || element.getClientRects().length === 0) return false;
      element.focus({ preventScroll: true });
      const style = getComputedStyle(element);
      return style.outlineStyle === 'none' || parseFloat(style.outlineWidth) < 2;
    }).map((element) => element.outerHTML.slice(0, 120)));
    check(focusFailures.length === 0, `${path} gives every available interactive surface a visible focus indicator${focusFailures.length ? `: ${focusFailures.join(' | ')}` : ''}`);
  }

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await goto(page, '/');
  const hiddenRevealCount = await page.locator('.reveal').evaluateAll((elements) => elements.filter((element) => getComputedStyle(element).opacity === '0').length);
  check(hiddenRevealCount === 0, 'Reduced-motion mode keeps all reveal content visible');
  const reducedMotionStyles = await page.evaluate(() => {
    const reveal = document.querySelector('.reveal');
    const button = document.querySelector('.button-primary');
    return {
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
      revealTransform: getComputedStyle(reveal).transform,
      revealDelay: getComputedStyle(reveal).transitionDelay,
      revealDuration: getComputedStyle(reveal).transitionDuration,
      buttonTransition: getComputedStyle(button).transitionDuration,
    };
  });
  check(reducedMotionStyles.scrollBehavior === 'auto', 'Reduced-motion mode disables smooth scrolling');
  check(reducedMotionStyles.revealTransform === 'none' && reducedMotionStyles.revealDelay === '0s' && reducedMotionStyles.revealDuration === '0s', 'Reduced-motion mode removes reveal translation, delay and opacity transition');
  check(reducedMotionStyles.buttonTransition === '0s', 'Reduced-motion mode disables nonessential control motion');
  await page.locator('.site-header .hamburger-button').click();
  check(await page.locator('#primary-mobile-menu').evaluate((element) => getComputedStyle(element).animationName) === 'none', 'Reduced-motion mode disables mobile-menu decorative animation');
  await page.keyboard.press('Escape');
  check(await page.locator('#value .reveal, #services .reveal').count() === 0, 'Value and service content does not depend on reveal-on-scroll');

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
