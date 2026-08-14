import { access } from 'node:fs/promises';
import { chromium } from 'playwright-core';
import { preview } from 'vite';

const failures = [];
const checks = [];
const deploymentBase = '/minoconsult';
const viewports = [
  [320, 568], [360, 800], [375, 812], [390, 844], [430, 932], [768, 1024],
  [820, 1180], [1024, 768], [1280, 800], [1440, 900], [1920, 1080],
];
const routes = [
  '/', '/hr/', '/buchhaltung-wien', '/hr/knjigovodstvo-bec',
  '/impressum', '/hr/impressum', '/datenschutzerklaerung', '/hr/pravila-privatnosti',
];

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

const server = await preview({ root: process.cwd(), preview: { host: '127.0.0.1', port: 0 }, logLevel: 'error' });
const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
const browser = await chromium.launch({ executablePath: await findBrowser(), headless: true });
const pageUrl = (path) => `${origin}${deploymentBase}${path}`;

async function hasHorizontalOverflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
}

try {
  for (const [width, height] of viewports) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
    const page = await context.newPage();

    for (const route of routes) {
      const response = await page.goto(pageUrl(route), { waitUntil: 'domcontentloaded' });
      await page.locator('main h1').first().waitFor();
      check(Boolean(response?.ok()), `${route} responds at ${width}x${height}`);
      check(!(await hasHorizontalOverflow(page)), `${route} has no horizontal overflow at ${width}x${height}`);
      const routeGutter = await page.locator('.section-shell').first().evaluate((element) => Number.parseFloat(getComputedStyle(element).paddingLeft));
      check(routeGutter >= 20, `${route} retains at least the configured minimum gutter at ${width}px`);
      const footerInside = await page.locator('.footer-contact-list').evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return rect.left >= -1 && rect.right <= document.documentElement.clientWidth + 1;
      });
      check(footerInside, `${route} footer contact details remain inside ${width}px`);
    }

    await page.goto(pageUrl('/'), { waitUntil: 'domcontentloaded' });
    const shellLeft = await page.locator('.hero-copy').evaluate((element) => element.getBoundingClientRect().left);
    check(shellLeft >= 19.5, `Homepage retains the minimum gutter at ${width}px`);
    const serviceHeadingsInside = await page.locator('.service-row h3').evaluateAll((headings) => headings.every((heading) => {
      const rect = heading.getBoundingClientRect();
      return rect.left >= -1 && rect.right <= document.documentElement.clientWidth + 1 && heading.scrollWidth <= heading.clientWidth + 1;
    }));
    check(serviceHeadingsInside, `German service headings fit at ${width}px`);
    const serviceColumnCount = await page.locator('.service-row').first().evaluate((row) => getComputedStyle(row).gridTemplateColumns.split(' ').length);
    check(serviceColumnCount === (width >= 1024 ? 2 : 1), `Homepage service row uses the expected column count at ${width}px`);
    const heroInside = await page.locator('.hero-copy').evaluate((element) => element.scrollWidth <= element.clientWidth + 1);
    check(heroInside, `Hero copy fits at ${width}px`);

    if (width === 320 || width === 390) {
      const headerControlsDoNotOverlap = await page.locator('.site-header .header-navigation').evaluate((header) => {
        const controls = [...header.children]
          .filter((element) => getComputedStyle(element).display !== 'none')
          .map((element) => element.getBoundingClientRect())
          .filter((rect) => rect.width > 0 && rect.height > 0);
        return controls.every((rect, index) => index === 0 || rect.left >= controls[index - 1].right - 1);
      });
      check(headerControlsDoNotOverlap, `Header controls do not overlap at ${width}px`);
    }

    await page.goto(pageUrl('/hr/'), { waitUntil: 'domcontentloaded' });
    const croatianHeadingsInside = await page.locator('.service-row h3').evaluateAll((headings) => headings.every((heading) => heading.scrollWidth <= heading.clientWidth + 1));
    check(croatianHeadingsInside, `Croatian service headings fit at ${width}px`);
    await context.close();
  }

  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto(pageUrl('/'), { waitUntil: 'domcontentloaded' });
  const alignment = await desktopPage.evaluate(() => {
    const left = (selector) => document.querySelector(selector)?.getBoundingClientRect().left;
    const values = [left('.brand-logo'), left('.hero-copy'), left('#services .services-intro'), left('#contact .negative-footer__content')];
    return Math.max(...values) - Math.min(...values);
  });
  check(alignment <= 1, 'Major container left edges remain aligned at 1440px');
  const measures = await desktopPage.locator('main p').evaluateAll((paragraphs) => paragraphs.map((paragraph) => paragraph.getBoundingClientRect().width));
  check(Math.max(...measures) <= 770, 'Body prose remains within the configured readable measure');
  const sectionPaddings = await desktopPage.locator('#services, #about, #faq').evaluateAll((sections) => sections.map((section) => Number.parseFloat(getComputedStyle(section).paddingTop)));
  check(sectionPaddings.every((padding) => padding >= 56 && padding <= 152.5), 'Major section spacing remains within semantic-token ranges');
  const targetSizes = await desktopPage.locator('.button-primary, .button-secondary, .hamburger-button, .language-switcher a, .faq-trigger, .choice-button').evaluateAll((elements) => elements.filter((element) => getComputedStyle(element).display !== 'none').map((element) => element.getBoundingClientRect().height));
  check(targetSizes.every((height) => height >= 44), 'Major controls meet the 44px practical target size');
  await desktopPage.evaluate(() => document.querySelector('#services').scrollIntoView());
  await desktopPage.waitForTimeout(100);
  const anchorClearance = await desktopPage.evaluate(() => {
    const section = document.querySelector('#services').getBoundingClientRect();
    const visibleHeader = [...document.querySelectorAll('.site-header, .delayed-sticky-header')].find((header) => getComputedStyle(header).visibility !== 'hidden' && Number.parseFloat(getComputedStyle(header).opacity) > 0);
    return section.top >= (visibleHeader?.getBoundingClientRect().height ?? 0) - 1;
  });
  check(anchorClearance, 'Sticky header does not obscure the services anchor');
  const revealVisible = await desktopPage.locator('.reveal').evaluateAll((elements) => elements.every((element) => Number.parseFloat(getComputedStyle(element).opacity) === 1));
  check(revealVisible, 'Reduced-motion mode leaves no invisible reveal layout space');
  const nonEmptySections = await desktopPage.locator('main > section').evaluateAll((sections) => sections.every((section) => section.textContent.trim().length > 0));
  check(nonEmptySections, 'No empty optional component leaves an unexplained section gap');
  await desktopContext.close();

  const languageContext = await browser.newContext({ viewport: { width: 820, height: 1180 }, reducedMotion: 'reduce' });
  const languagePage = await languageContext.newPage();
  const languageContainerRules = [];
  for (const path of ['/', '/hr/']) {
    await languagePage.goto(pageUrl(path), { waitUntil: 'domcontentloaded' });
    languageContainerRules.push(await languagePage.locator('.hero-layout').evaluate((element) => {
      const style = getComputedStyle(element);
      return [style.maxInlineSize, style.paddingInlineStart, style.paddingInlineEnd];
    }));
  }
  check(JSON.stringify(languageContainerRules[0]) === JSON.stringify(languageContainerRules[1]), 'German and Croatian homepages use equivalent container rules');
  await languageContext.close();

  for (const [width, height] of [[390, 844], [430, 932], [768, 1024], [1024, 768], [1440, 900]]) {
    for (const path of ['/', '/hr/']) {
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
      const page = await context.newPage();
      await page.goto(pageUrl(path), { waitUntil: 'domcontentloaded' });
      await page.locator('[data-hero-cta] button').first().click();
      const panel = page.getByRole('dialog').first();
      await panel.waitFor();
      await panel.evaluate((element) => element.scrollTop = element.scrollHeight);
      const actionsReachable = await panel.locator('form .button-primary').evaluate((button) => {
        const rect = button.getBoundingClientRect();
        return rect.top >= 0 && rect.bottom <= window.innerHeight + 1;
      });
      check(actionsReachable, `${path} appointment-dialog actions remain reachable at ${width}x${height}`);
      const confirmationNote = panel.locator('form .booking-disclaimer');
      await confirmationNote.scrollIntoViewIfNeeded();
      check(await confirmationNote.evaluate((note) => {
        const rect = note.getBoundingClientRect();
        return rect.top >= 0 && rect.bottom <= window.innerHeight + 1;
      }), `${path} appointment confirmation note remains reachable at ${width}x${height}`);
      check(await panel.locator('.booking-form').evaluate((form) => !['auto', 'scroll'].includes(getComputedStyle(form).overflowY)), `${path} inquiry form introduces no nested scroll container at ${width}x${height}`);
      check(!(await hasHorizontalOverflow(page)), `${path} appointment dialog creates no overflow at ${width}x${height}`);
      await page.keyboard.press('Escape');
      await page.getByRole('dialog').waitFor({ state: 'detached' });
      await page.locator('.footer-privacy-settings').click();
      await page.getByRole('dialog').waitFor();
      check(await page.getByRole('dialog').count() === 1, `${path} privacy-settings dialog remains reachable at ${width}x${height}`);
      await context.close();
    }
  }

  const textContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const textPage = await textContext.newPage();
  await textPage.goto(pageUrl('/hr/'), { waitUntil: 'domcontentloaded' });
  await textPage.addStyleTag({ content: '*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}' });
  await textPage.locator('.faq-trigger').first().click();
  const faqNotClipped = await textPage.locator('.faq-panel-inner').first().evaluate((element) => element.scrollHeight <= element.clientHeight + 1);
  check(faqNotClipped, 'FAQ answers do not clip after WCAG text-spacing overrides');
  check(!(await hasHorizontalOverflow(textPage)), 'Text-spacing overrides do not create horizontal overflow');
  const translatedBlocksNotClipped = await textPage.locator('.specialization-card, .seo-process-item, .legal-section').evaluateAll((elements) => elements.every((element) => element.scrollHeight <= element.clientHeight + 1));
  check(translatedBlocksNotClipped, 'No fixed section height clips translated content');
  await textContext.close();

  const landscapeContext = await browser.newContext({ viewport: { width: 844, height: 390 }, reducedMotion: 'reduce' });
  const landscapePage = await landscapeContext.newPage();
  await landscapePage.goto(pageUrl('/hr/'), { waitUntil: 'domcontentloaded' });
  check(!(await hasHorizontalOverflow(landscapePage)), 'Croatian homepage has no horizontal overflow in mobile landscape');
  check(Boolean(await landscapePage.locator('.site-header').boundingBox()), 'Mobile-landscape header remains rendered');
  await landscapeContext.close();

  const zoomContext = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  const zoomPage = await zoomContext.newPage();
  await zoomPage.goto(pageUrl('/datenschutzerklaerung'), { waitUntil: 'domcontentloaded' });
  await zoomPage.evaluate(() => document.documentElement.style.zoom = '2');
  check(!(await hasHorizontalOverflow(zoomPage)), 'Legal text reflows without horizontal overflow at 200% CSS zoom');
  const legalMeasure = await zoomPage.locator('.legal-section p').first().evaluate((paragraph) => paragraph.getBoundingClientRect().width / 2);
  check(legalMeasure <= 770, 'Legal text remains within readable measure at 200% zoom');
  await zoomContext.close();

  for (const [width, height] of [[320, 568], [1440, 900]]) {
    const context = await browser.newContext({ viewport: { width, height } });
    const page = await context.newPage();
    const response = await page.goto(pageUrl('/404.html'), { waitUntil: 'domcontentloaded' });
    check(Boolean(response?.ok()), `404 recovery page responds at ${width}x${height}`);
    check(!(await hasHorizontalOverflow(page)), `404 recovery page has no overflow at ${width}px`);
    await context.close();
  }
} finally {
  await browser.close();
  await server.close();
}

if (failures.length) {
  console.error(`Spacing and layout checks failed (${failures.length}/${checks.length}):\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Passed ${checks.length} spacing, overflow, alignment, reflow, target-size and dialog checks across ${viewports.length} viewports.`);
