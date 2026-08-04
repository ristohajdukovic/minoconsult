import { access } from 'node:fs/promises';
import { chromium } from 'playwright-core';
import { preview } from 'vite';

const deploymentBase = '/minoconsult';
const failures = [];
const checks = [];
const requiredViewports = [
  [320, 568], [360, 800], [375, 812], [390, 844], [430, 932],
  [768, 1024], [1024, 768], [1280, 800], [1440, 900], [1920, 1080],
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
      // Try the next installed browser.
    }
  }
  throw new Error('No Chromium browser found. Set PLAYWRIGHT_EXECUTABLE_PATH and rerun.');
}

const server = await preview({
  root: process.cwd(),
  preview: { host: '127.0.0.1', port: 0, strictPort: false },
  logLevel: 'error',
});
const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
const browser = await chromium.launch({ executablePath: await findBrowser(), headless: true });
const pageUrl = (path) => `${origin}${deploymentBase}${path}`;

async function openPage(page, path) {
  const response = await page.goto(pageUrl(path), { waitUntil: 'domcontentloaded' });
  await page.locator('main h1').first().waitFor();
  check(Boolean(response?.ok()), `${path} responds successfully`);
}

async function hasHorizontalOverflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
}

try {
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const mobilePage = await mobileContext.newPage();

  for (const language of [
    {
      path: '/', heroEyebrow: 'Steuerberatung und Buchhaltung · Wien',
      heroTitle: 'Steuerberatung, Buchhaltung und Lohnverrechnung in Wien',
      heroBody: 'MINO Consulting KG unterstützt Unternehmen bei laufender Buchhaltung, Lohnverrechnung, Jahresabschluss und konkreten Steuerfragen. Im Erstgespräch klären wir den Bedarf und die benötigten Unterlagen.',
      aboutEyebrow: 'IHR ANSPRECHPARTNER', role: 'Steuerberater',
      aboutSummary: 'MINO Consulting KG unterstützt bei Buchhaltung, Lohnverrechnung, Jahresabschluss und konkreten Steuer- oder Gründungsfragen.',
      legalPath: '/minoconsult/impressum',
      valueTitle: 'Verlässliche Unterstützung für laufende Pflichten und konkrete Fragen',
      secondaryPath: '/minoconsult/steuerberatung-gruender-wien',
    },
    {
      path: '/hr/', heroEyebrow: 'Porezno savjetovanje i knjigovodstvo · Beč',
      heroTitle: 'Porezno savjetovanje, knjigovodstvo i obračun plaća u Beču',
      heroBody: 'MINO Consulting KG pruža podršku poduzećima pri tekućem knjigovodstvu, obračunu plaća, godišnjem obračunu i konkretnim poreznim pitanjima. Na prvom razgovoru utvrđujemo potrebe i potrebnu dokumentaciju.',
      aboutEyebrow: 'VAŠ POREZNI SAVJETNIK', role: 'Porezni savjetnik',
      aboutSummary: 'MINO Consulting KG pruža podršku pri knjigovodstvu, obračunu plaća, godišnjem obračunu te konkretnim poreznim pitanjima ili pitanjima pri osnivanju.',
      legalPath: '/minoconsult/hr/impressum',
      valueTitle: 'Podrška za redovite obveze i konkretna pitanja',
      secondaryPath: '/minoconsult/hr/porezno-savjetovanje-poduzetnici-bec',
    },
  ]) {
    await openPage(mobilePage, language.path);
    const hero = mobilePage.locator('#top');
    check(await hero.locator('.hero-eyebrow').getByText(language.heroEyebrow, { exact: true }).count() === 1, `${language.path} hero uses the localized factual eyebrow`);
    check(await hero.getByRole('heading', { name: language.heroTitle }).count() === 1, `${language.path} hero uses the localized factual H1`);
    check(await hero.getByText(language.heroBody, { exact: true }).count() === 1, `${language.path} hero uses the approved supporting copy`);
    check(await hero.getByRole('button', { name: language.path === '/' ? 'Erstgespräch anfragen' : 'Zatražite prvi razgovor' }).count() === 1, `${language.path} hero retains its primary inquiry CTA`);
    check((await hero.locator('a[href^="tel:"]').getAttribute('href')) === 'tel:+43190680200', `${language.path} hero call CTA retains the office phone link`);
    check(await hero.locator('.hero-image-frame[data-media="brand"] .hero-brand-fallback img').count() === 1, `${language.path} hero renders the intentional brand fallback`);
    check(await hero.locator('.hero-brand-fallback img').getAttribute('alt') === '', `${language.path} decorative hero fallback uses empty alt text`);
    check((await hero.locator('.hero-brand-fallback img').getAttribute('src')) === '/minoconsult/brand/mino-logo.svg', `${language.path} hero fallback reuses the approved complete logo`);
    check(await hero.locator('img[src*="mino-office-consultation-placeholder"]').count() === 0, `${language.path} hero no longer renders the consultation placeholder`);
    check(await hero.locator('.hero-copy').evaluate((copy) => Boolean(copy.compareDocumentPosition(document.querySelector('.hero-visual')) & Node.DOCUMENT_POSITION_FOLLOWING)), `${language.path} mobile DOM order keeps copy and CTAs before fallback art`);

    const value = mobilePage.locator('#value');
    check(await value.getByRole('heading', { name: language.valueTitle }).count() === 1, `${language.path} uses the compact localized value heading`);
    check(await value.locator('.value-highlight-word').count() === 0, `${language.path} value copy is not split into animated word spans`);
    const services = mobilePage.locator('#services');
    check(await services.locator('.service-card').count() === 5, `${language.path} renders five primary service cards`);
    check(await services.locator('.service-number-rail, .service-editorial-mobile-number').count() === 0, `${language.path} renders no giant service numbers`);
    check(await services.locator('.service-secondary-nav a').count() === 1, `${language.path} keeps only the missing service destination in the secondary row`);
    check(new URL(await services.locator('.service-secondary-nav a').getAttribute('href'), 'http://localhost').pathname === language.secondaryPath, `${language.path} secondary row retains the founder-specific service route`);

    const facts = mobilePage.locator('.verified-facts-section');
    check(await facts.evaluate((element) => getComputedStyle(element).display === 'none' && element.getBoundingClientRect().height === 0), `${language.path} facts are fully hidden at 390px`);
    check(await facts.locator('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])').count() === 0, `${language.path} hidden facts contain no focusable controls`);
    check(await mobilePage.evaluate(() => {
      const heroBottom = document.querySelector('#top').getBoundingClientRect().bottom;
      const nextTop = document.querySelector('#value').getBoundingClientRect().top;
      return Math.abs(nextTop - heroBottom) <= 1;
    }), `${language.path} hidden facts leave no layout gap`);

    const about = mobilePage.locator('#about');
    check(await about.locator('.about-eyebrow').getByText(language.aboutEyebrow, { exact: true }).count() === 1, `${language.path} About uses the localized adviser eyebrow`);
    check(await about.locator('h2').filter({ hasText: /^Mag\. Tomislav Siketic$/ }).count() === 1, `${language.path} About heading names Mag. Tomislav Siketic`);
    check(await about.locator('.principal-role').filter({ hasText: new RegExp(`^${language.role}$`) }).count() === 1, `${language.path} About role is correctly localized`);
    check(await about.getByText(language.aboutSummary, { exact: true }).count() === 1, `${language.path} About uses the concise verified service summary`);
    check(await about.locator('.about-facts li').count() === 3, `${language.path} About presents three concise verified fact lines`);
    check(await about.locator('.about-facts').filter({ hasText: 'Deutsch · Hrvatski' }).count() === 1, `${language.path} About retains the verified languages`);
    check(await about.locator('.about-facts').filter({ hasText: 'FN 157894y' }).count() === 1, `${language.path} About retains the verified register number`);
    check((await about.locator('.about-legal-link').getAttribute('href')) === language.legalPath, `${language.path} About retains the localized Impressum link`);
    check(await about.locator('.adviser-visual[data-media="brand"] .adviser-identity-panel').count() === 1, `${language.path} missing portrait renders the intentional identity panel`);
    check((await about.locator('.adviser-identity-panel img').getAttribute('src')) === '/minoconsult/brand/mino-logo.svg', `${language.path} adviser fallback reuses the approved wordmark`);
    check(await about.locator('.adviser-identity-panel img').getAttribute('alt') === '', `${language.path} fallback wordmark is decorative beside visible identity text`);
    check(await about.locator('img[src*="/images/team/"]').count() === 0, `${language.path} About makes no team-image request while portrait configuration is empty`);
    check(await about.locator('.founder-placeholder, .tag-pill').count() === 0, `${language.path} About removes placeholder and badge decoration wrappers`);
  }
  await mobileContext.close();

  const desktopContext = await browser.newContext({ viewport: { width: 1024, height: 768 }, reducedMotion: 'reduce' });
  const desktopPage = await desktopContext.newPage();
  await openPage(desktopPage, '/');
  check(await desktopPage.locator('.verified-facts-section').evaluate((element) => getComputedStyle(element).display !== 'none' && element.getBoundingClientRect().height > 0), 'Verified facts remain visible at 1024px');
  check(await desktopPage.locator('.verified-fact').count() === 2, 'Trust strip exposes only currently verified customer-facing facts');
  check(await desktopPage.locator('.verified-fact').filter({ hasText: 'Kanzlei in 1170 Wien' }).count() === 1, 'Trust strip shows the verified Vienna office location');
  check(await desktopPage.locator('.verified-fact').filter({ hasText: 'Mag. Tomislav Siketic · Steuerberater' }).count() === 1, 'Trust strip shows the published principal and professional title');
  const accentStyles = await desktopPage.evaluate(() => ({
    accentToken: getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim().toLowerCase(),
    hoverAccentToken: getComputedStyle(document.documentElement).getPropertyValue('--color-hover-accent').trim().toLowerCase(),
    onAccentToken: getComputedStyle(document.documentElement).getPropertyValue('--color-on-accent').trim().toLowerCase(),
    primary: getComputedStyle(document.querySelector('.button-primary')).backgroundColor,
    primaryText: getComputedStyle(document.querySelector('.button-primary')).color,
    language: getComputedStyle(document.querySelector('.language-switcher .is-active')).backgroundColor,
    languageText: getComputedStyle(document.querySelector('.language-switcher .is-active')).color,
    navRule: getComputedStyle(document.querySelector('.nav-link'), '::after').backgroundColor,
    footerCta: getComputedStyle(document.querySelector('.footer-cta-button')).backgroundColor,
    footerCtaText: getComputedStyle(document.querySelector('.footer-cta-button')).color,
  }));
  check(accentStyles.accentToken === '#313638', 'The persistent accent token is #313638');
  check(accentStyles.hoverAccentToken === '#b86a64', 'The hover accent token remains #B86A64');
  check(accentStyles.onAccentToken === '#f4f0e7', 'The centralized on-accent token is the bright cream-white #F4F0E7');
  check([accentStyles.primary, accentStyles.language, accentStyles.footerCta].every((value) => value === 'rgb(49, 54, 56)'), 'Primary buttons, active language and footer CTA use the persistent accent color');
  check(accentStyles.navRule === 'rgb(184, 106, 100)', 'Navigation hover rule retains the previous hover accent');
  check([accentStyles.primaryText, accentStyles.languageText, accentStyles.footerCtaText].every((value) => value === 'rgb(244, 240, 231)'), 'Text on persistent accent backgrounds uses the bright cream-white color');
  const secondaryButton = desktopPage.locator('.button-secondary').first();
  await secondaryButton.hover();
  check(await secondaryButton.evaluate((button) => {
    const style = getComputedStyle(button);
    return style.backgroundColor === 'rgb(244, 240, 231)' && style.color === 'rgb(10, 28, 26)' && style.borderColor === 'rgb(184, 106, 100)';
  }), 'Secondary button hover limits coral to the border accent');
  check(await desktopPage.locator('.brand-logo img').first().getAttribute('src') === '/minoconsult/brand/mino-logo.svg', 'Header uses the approved complete logo asset');
  const refinementStyles = await desktopPage.evaluate(() => ({
    heroSurface: getComputedStyle(document.querySelector('.hero-section')).backgroundColor,
    heroTexture: getComputedStyle(document.querySelector('.hero-section')).backgroundImage,
    warmSurface: getComputedStyle(document.querySelector('#services')).backgroundColor,
    warmTexture: getComputedStyle(document.querySelector('#services')).backgroundImage,
    lightSurface: getComputedStyle(document.querySelector('#value')).backgroundColor,
    mintSurface: getComputedStyle(document.querySelector('.section-surface-cream')).backgroundColor,
    controlShadow: getComputedStyle(document.querySelector('.button-primary')).boxShadow,
    controlShadowToken: getComputedStyle(document.documentElement).getPropertyValue('--shadow-control').trim(),
    panelShadowToken: getComputedStyle(document.documentElement).getPropertyValue('--shadow-panel').trim(),
    sectionTab: getComputedStyle(document.querySelector('.section-spacious'), '::after').content,
    sectionBracket: getComputedStyle(document.querySelector('.section-spacious > .section-shell'), '::after').content,
    heroBracket: getComputedStyle(document.querySelector('.hero-image-frame'), '::before').content,
  }));
  check(refinementStyles.heroSurface === 'rgb(244, 240, 231)' && refinementStyles.heroTexture === 'none', 'Hero uses a solid off-white surface without texture');
  check(refinementStyles.warmSurface === 'rgb(244, 240, 231)' && refinementStyles.warmTexture === 'none', 'Warm sections use the shared solid off-white surface');
  check(refinementStyles.lightSurface === 'rgb(255, 255, 255)', 'Light sections use the dominant white surface');
  check(refinementStyles.mintSurface === 'rgb(222, 236, 230)' && await desktopPage.locator('main .section-surface-cream').count() === 2, 'Homepage reserves mint for two meaningful sections');
  check(Boolean(refinementStyles.controlShadowToken && refinementStyles.panelShadowToken) && !refinementStyles.controlShadow.includes('4px 4px'), 'Controls and panels use consolidated subtle shadow tokens');
  check([refinementStyles.sectionTab, refinementStyles.sectionBracket, refinementStyles.heroBracket].every((content) => content === 'none'), 'Decorative section tabs and corner brackets are removed');
  check(await desktopPage.locator('.architect-grid, .tag-pill, .footer-accent-line, .map-placeholder-mark').count() === 0, 'Template grid, filled pills, accent stroke and pseudo-map drawing are absent');
  check(await desktopPage.locator('.section-eyebrow svg').count() === 0, 'Eyebrows are text-only');
  check(await desktopPage.locator('#services h2 em').count() === 1 && await desktopPage.locator('#faq h2 em, #contact h2 em').count() === 0, 'Italic emphasis is reserved for one selected homepage heading');
  await desktopPage.locator('[data-hero-cta] button').click();
  const bookingDialog = desktopPage.getByRole('dialog');
  await bookingDialog.waitFor();
  check(await bookingDialog.locator('.section-eyebrow, .tag-pill').count() === 0 && await bookingDialog.locator('#booking-title').count() === 1, 'Booking modal opens with the direct title and no redundant eyebrow treatment');
  await desktopPage.keyboard.press('Escape');
  await bookingDialog.waitFor({ state: 'detached' });

  const decorativeWordmark = await desktopPage.locator('.negative-footer__wordmark').evaluate((image) => {
    const stage = image.parentElement;
    const content = document.querySelector('.negative-footer__content-wrap');
    const imageRect = image.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();
    return {
      source: new URL(image.src).pathname,
      alt: image.getAttribute('alt'),
      ariaHidden: image.getAttribute('aria-hidden'),
      draggable: image.getAttribute('draggable'),
      oversized: imageRect.width > document.documentElement.clientWidth * 0.8,
      ratioPreserved: Math.abs((imageRect.width / imageRect.height) - (343.55 / 79.5)) < 0.02,
      cropped: getComputedStyle(stage).overflow !== 'visible',
      overlaps: contentRect.top < stageRect.bottom && contentRect.top > stageRect.top,
    };
  });
  check(decorativeWordmark.source === '/minoconsult/brand/mino-wordmark-footer-white.svg', 'Footer uses the approved cream-white wordmark-only asset');
  check(decorativeWordmark.alt === '' && decorativeWordmark.ariaHidden === 'true' && decorativeWordmark.draggable === 'false', 'Oversized wordmark remains decorative and non-draggable');
  check(decorativeWordmark.oversized, 'Footer wordmark is intentionally oversized on desktop');
  check(decorativeWordmark.ratioPreserved, 'Footer wordmark preserves the SVG aspect ratio');
  check(decorativeWordmark.cropped, 'Footer wordmark is contained by a cropped stage');
  check(decorativeWordmark.overlaps, 'Cream footer panel overlaps the wordmark stage');
  check(await desktopPage.locator('.footer-column').nth(1).locator('a').count() === 6, 'Footer services are populated from all configured service routes');
  const footerButtonColors = await desktopPage.locator('.footer-cta-button').first().evaluate((button) => {
    const style = getComputedStyle(button);
    return [style.backgroundColor, style.color];
  });
  check(footerButtonColors[0] !== 'rgba(0, 0, 0, 0)' && footerButtonColors[0] !== footerButtonColors[1], 'Cream-panel appointment CTA retains a visible contrasting background');

  const footerStructure = await desktopPage.locator('#contact').evaluate((footer) => {
    const main = footer.querySelector('.footer-main');
    const bottom = footer.querySelector('.footer-bottom-bar');
    const border = getComputedStyle(bottom).borderTopWidth;
    const rect = bottom.getBoundingClientRect();
    return {
      mainExists: Boolean(main),
      bottomExists: Boolean(bottom),
      bottomIsFinalChild: footer.lastElementChild === bottom,
      hasDivider: Number.parseFloat(border) > 0,
      isFullWidth: Math.abs(rect.width - document.documentElement.clientWidth) <= 1,
      position: getComputedStyle(footer).position,
    };
  });
  check(footerStructure.mainExists && footerStructure.bottomExists, 'Footer has separate main and bottom tiers');
  check(footerStructure.bottomIsFinalChild, 'Footer bottom tier is the final footer child');
  check(footerStructure.hasDivider && footerStructure.isFullWidth, 'Footer bottom tier has a full-width structural divider');
  check(!['fixed', 'absolute'].includes(footerStructure.position), 'Footer remains in normal document flow');
  check(await desktopPage.locator('.footer-contact-item').filter({ hasText: 'Geblergasse 95/8, 1170 Wien' }).count() === 1, 'Footer contact directory retains one visible address entry');
  check(await desktopPage.locator('.footer-map-meta p').count() === 0 && await desktopPage.locator('.footer-map-meta a').count() === 1, 'Map panel removes the repeated address while retaining the direct Google Maps link');
  check(await desktopPage.locator('.map-consent-placeholder').evaluate((element) => element.getBoundingClientRect().height < 280), 'Unloaded consent-gated map remains compact');

  const shellRules = await desktopPage.locator('.site-shell').evaluate((shell) => {
    const main = shell.querySelector(':scope > main');
    const footer = shell.querySelector(':scope > footer');
    return {
      display: getComputedStyle(shell).display,
      minHeight: Number.parseFloat(getComputedStyle(shell).minHeight),
      flexGrow: Number.parseFloat(getComputedStyle(main).flexGrow),
      footerLast: shell.lastElementChild === footer,
    };
  });
  check(shellRules.display === 'flex' && shellRules.minHeight >= 768 && shellRules.flexGrow === 1 && shellRules.footerLast, 'Page shell keeps the final footer at the viewport bottom on short pages');
  await desktopContext.close();

  for (const language of [
    { path: '/', imprint: '/minoconsult/impressum', privacy: '/minoconsult/datenschutzerklaerung' },
    { path: '/hr/', imprint: '/minoconsult/hr/impressum', privacy: '/minoconsult/hr/pravila-privatnosti' },
  ]) {
    const context = await browser.newContext({ viewport: { width: 768, height: 1024 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await openPage(page, language.path);
    const hrefs = await page.locator('.footer-bottom-links a').evaluateAll((links) => links.map((link) => new URL(link.href).pathname));
    check(hrefs.includes(language.imprint) && hrefs.includes(language.privacy), `${language.path} footer retains the correct localized legal links`);
    const metadata = await page.evaluate(() => ({
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.content,
      canonical: document.querySelector('link[rel="canonical"]')?.href,
      alternates: document.querySelectorAll('link[rel="alternate"][hreflang]').length,
    }));
    check(Boolean(metadata.title && metadata.description && metadata.canonical && metadata.alternates >= 3), `${language.path} SEO metadata and language alternates remain populated`);
    await context.close();
  }

  for (const [width, height] of requiredViewports) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    for (const path of ['/', '/hr/']) {
      await openPage(page, path);
      check(!(await hasHorizontalOverflow(page)), `${path} has no horizontal overflow at ${width}x${height}`);
      const factsVisible = await page.locator('.verified-facts-section').evaluate((element) => getComputedStyle(element).display !== 'none');
      check(factsVisible === (width >= 640), `${path} facts visibility is correct at ${width}px`);
      if (width >= 1024) {
        const firstViewportFits = await page.evaluate(() => {
          const headerHeight = document.querySelector('.site-header').getBoundingClientRect().height;
          const heroHeight = document.querySelector('#top').getBoundingClientRect().height;
          return headerHeight + heroHeight <= window.innerHeight + 1;
        });
        check(firstViewportFits, `${path} desktop hero fits within the first viewport at ${width}x${height}`);
      }
      const wordmarkIsOversized = await page.locator('.negative-footer__wordmark').evaluate((image) => image.getBoundingClientRect().width >= document.documentElement.clientWidth * 1.35);
      check(wordmarkIsOversized === (width < 640), `${path} footer wordmark scale follows the mobile composition at ${width}px`);
    }
    if (width === 320) {
      const bottomFits = await page.locator('.footer-bottom-bar').evaluate((element) => element.scrollWidth <= element.clientWidth + 1);
      check(bottomFits, 'Footer bottom content wraps without overflow at 320px');
    }
    await context.close();
  }

  const zoomContext = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  const zoomPage = await zoomContext.newPage();
  await openPage(zoomPage, '/impressum');
  await zoomPage.evaluate(() => { document.documentElement.style.zoom = '2'; });
  const zoomResult = await zoomPage.locator('.footer-bottom-bar').evaluate((element) => ({
    fits: element.scrollWidth <= element.clientWidth + 1 && document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
    readable: Number.parseFloat(getComputedStyle(element.querySelector('p')).fontSize) >= 14,
  }));
  check(zoomResult.fits && zoomResult.readable, 'Footer bottom remains readable and reflows without overflow at 200% zoom');
  await zoomContext.close();
} finally {
  await browser.close();
  await server.close();
}

if (failures.length) {
  console.error(`Focused refinement checks failed (${failures.length}/${checks.length}):\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Passed ${checks.length} hero, facts, About, footer, language, metadata and responsive checks.`);
