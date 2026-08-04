import { access, readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright-core';
import { preview } from 'vite';

const failures = [];
const checks = [];
let baseUrl;
const deploymentBase = '/minoconsult';

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
      // Try the next browser.
    }
  }
  throw new Error('No Chromium browser found. Set PLAYWRIGHT_EXECUTABLE_PATH and rerun.');
}

async function goto(page, path) {
  const response = await page.goto(`${baseUrl}${deploymentBase}${path}`, { waitUntil: 'domcontentloaded' });
  check(Boolean(response?.ok()), `${path} returns a successful response`);
  await page.locator('.site-header').waitFor();
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(path));
    else files.push(path);
  }
  return files;
}

const server = await preview({
  root: process.cwd(),
  preview: { host: '127.0.0.1', port: 0, strictPort: false },
  logLevel: 'error',
});
const address = server.httpServer.address();
baseUrl = `http://127.0.0.1:${address.port}`;
const browser = await chromium.launch({ executablePath: await findBrowser(), headless: true });

try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: baseUrl });
  await context.route('https://www.google.com/maps**', (route) => route.fulfill({
    status: 200,
    contentType: 'text/html',
    body: '<!doctype html><title>Map test fixture</title>',
  }));
  const page = await context.newPage();
  const requestUrls = [];
  page.on('request', (request) => requestUrls.push(request.url()));

  await goto(page, '/');
  await page.waitForTimeout(300);
  const initialRequests = [...requestUrls];
  check(!initialRequests.some((url) => /(?:google\.com\/maps|google\.at\/maps)/i.test(url)), 'No Google Maps request occurs before consent');
  check(!initialRequests.some((url) => /fonts\.(?:googleapis|gstatic)\.com/i.test(url)), 'No Google Fonts request occurs before consent');
  const remoteImages = await page.locator('img').evaluateAll((images) => images
    .map((image) => image.currentSrc || image.src)
    .filter((source) => source && !source.startsWith(window.location.origin)));
  check(remoteImages.length === 0, 'Homepage images are served from the local site origin');
  check(await page.locator('iframe').count() === 0, 'Google Maps iframe is absent in the initial page state');

  await page.getByRole('button', { name: 'Google Maps laden' }).click();
  await page.locator('.map-frame iframe').waitFor({ state: 'attached' });
  await page.waitForTimeout(100);
  check(await page.locator('.map-frame iframe').count() === 1, 'Google Maps iframe mounts after the contextual consent action');
  check(requestUrls.some((url) => /google\.com\/maps/i.test(url)), 'Loading the consented map initiates the Google Maps request');
  check(await page.evaluate(() => JSON.parse(localStorage.getItem('mino_privacy_preferences_v1')).googleMaps === true), 'Google Maps preference is stored without personal data');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('.map-frame iframe').waitFor({ state: 'attached' });
  check(await page.locator('.map-frame iframe').count() === 1, 'Google Maps preference persists after reload');
  await page.locator('.map-frame iframe').evaluate((iframe) => iframe.dispatchEvent(new Event('error')));
  await page.getByRole('alert').filter({ hasText: 'Die Karte konnte nicht geladen werden.' }).waitFor();
  check(await page.getByRole('button', { name: 'Karte erneut laden' }).count() === 1, 'Failed Google Maps load exposes a retry action');
  check(await page.getByRole('link', { name: /Adresse in Google Maps öffnen/ }).count() === 1, 'Map failure retains the ordinary external Google Maps link');
  await page.getByRole('button', { name: 'Karte erneut laden' }).click();
  await page.locator('.map-frame iframe').waitFor({ state: 'attached' });
  check(await page.locator('.map-frame iframe').count() === 1, 'Google Maps retry remounts the iframe once');

  const settingsOpener = page.getByRole('button', { name: 'Datenschutzeinstellungen' });
  await settingsOpener.click();
  const settingsDialog = page.getByRole('dialog', { name: 'Datenschutzeinstellungen' });
  await settingsDialog.waitFor();
  check(await settingsDialog.count() === 1, 'Footer opens the privacy-settings dialog');
  await page.waitForFunction(() => document.activeElement?.id === 'privacy-settings-title');
  check(await page.locator('#privacy-settings-title').evaluate((element) => document.activeElement === element), 'Privacy-settings dialog moves focus to its title');
  const saveButton = settingsDialog.getByRole('button', { name: 'Auswahl speichern' });
  await saveButton.focus();
  await page.keyboard.press('Tab');
  check(await settingsDialog.locator('input[type="checkbox"]').evaluate((element) => document.activeElement === element), 'Privacy-settings dialog traps keyboard focus');
  await page.keyboard.press('Escape');
  check(await settingsDialog.count() === 0, 'Escape closes privacy settings without changing the preference');
  await page.waitForFunction(() => document.activeElement?.textContent?.trim() === 'Datenschutzeinstellungen');
  check(await settingsOpener.evaluate((element) => document.activeElement === element), 'Privacy-settings dialog restores focus to its opener');

  await settingsOpener.click();
  const checkbox = settingsDialog.locator('input[type="checkbox"]');
  await checkbox.uncheck();
  await settingsDialog.getByRole('button', { name: 'Auswahl speichern' }).click();
  check(await page.locator('iframe').count() === 0, 'Disabling Google Maps immediately unmounts the iframe');
  check(await page.evaluate(() => localStorage.getItem('mino_privacy_preferences_v1') === null), 'Disabling Google Maps removes stored permission');

  await goto(page, '/hr/');
  check(await page.getByRole('button', { name: 'Postavke privatnosti' }).count() === 1, 'Croatian footer exposes privacy settings');
  check(await page.getByRole('button', { name: 'Učitaj Google Maps' }).count() === 1, 'Croatian map placeholder exposes contextual consent');

  await goto(page, '/');
  const bookingOpener = page.locator('[data-hero-cta] button').first();
  check(await bookingOpener.textContent() === 'Erstgespräch anfragen', 'German hero uses appointment-request terminology');
  await bookingOpener.click();
  const bookingDialog = page.getByRole('dialog', { name: 'Erstgespräch anfragen' });
  await bookingDialog.waitFor();
  check(await bookingDialog.getByText('Nennen Sie uns kurz Ihr Anliegen. Wir bereiten eine E-Mail vor, die Sie vor dem Senden prüfen können.', { exact: true }).count() === 1, 'German inquiry dialog uses the concise email-preparation introduction');
  check(await bookingDialog.getByText('Bevorzugtes Datum (optional)', { exact: true }).count() === 1 && await bookingDialog.getByText('Bevorzugter Zeitraum (optional)', { exact: true }).count() === 1, 'Appointment interface clearly labels date and period as optional preferences');
  check(await bookingDialog.getByText('Datum und Zeitraum sind unverbindliche Wünsche und keine Terminbuchung.', { exact: true }).count() === 1, 'Appointment interface explains that preferences are not a booking');
  check(await bookingDialog.evaluate((dialog) => {
    const ids = ['booking-service', 'booking-name', 'booking-company', 'booking-email', 'booking-phone', 'booking-mode', 'booking-date', 'booking-time', 'booking-message'];
    const nodes = ids.map((id) => dialog.querySelector(`#${id}`));
    return nodes.every(Boolean) && nodes.every((node, index) => index === 0 || Boolean(nodes[index - 1].compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING));
  }), 'Inquiry fields follow the intended service, identity, contact, format/preferences and message order');
  check(await bookingDialog.getByRole('button', { name: '08:00–10:00' }).count() === 1, 'Appointment interface uses consultation periods');
  check(await bookingDialog.getByRole('button', { name: /08:30|11:30|14:30|15:30/ }).count() === 0, 'Appointment interface contains no simulated exact availability slots');
  check(await bookingDialog.getByText('Der gewünschte Termin ist erst nach einer Bestätigung durch MINO Consulting KG verbindlich.', { exact: true }).count() === 1, 'Confirmation disclaimer is visible before the email action');

  await bookingDialog.locator('#booking-date').fill('2026-12-01');
  await bookingDialog.getByRole('button', { name: '08:00–10:00' }).click();
  await bookingDialog.locator('#booking-name').fill('Synthetic Person');
  await bookingDialog.locator('#booking-company').fill('Synthetic KG');
  await bookingDialog.locator('#booking-email').fill('inquiry@example.invalid');
  await bookingDialog.locator('#booking-phone').fill('+43 000 000');
  await bookingDialog.locator('#booking-message').fill('Synthetische Frage zur Buchhaltung');
  check(await page.evaluate(() => Object.keys(localStorage).length === 0), 'Appointment form data is not stored in local storage');
  await bookingDialog.getByRole('button', { name: 'Anfrage prüfen' }).click();
  check(await bookingDialog.getByRole('heading', { name: 'Ihre Terminanfrage wurde vorbereitet.' }).count() === 1, 'German appointment success state uses the required request wording');
  const emailHref = await bookingDialog.getByRole('link', { name: /E-Mail-Anfrage öffnen/ }).getAttribute('href');
  const decodedEmailHref = decodeURIComponent(emailHref);
  check(decodedEmailHref.includes('Synthetic Person') && decodedEmailHref.includes('Synthetic KG') && decodedEmailHref.includes('Synthetische Frage zur Buchhaltung'), 'Prepared email contains all synthetic form details');
  check(decodedEmailHref.includes('Bevorzugter Zeitraum (optional): 08:00–10:00') && decodedEmailHref.includes('erst nach einer Bestätigung'), 'Prepared email contains localized preference and disclaimer wording');
  await bookingDialog.getByRole('button', { name: 'Zusammenfassung kopieren' }).click();
  await bookingDialog.getByRole('status').filter({ hasText: 'Zusammenfassung kopiert.' }).waitFor();
  check(await bookingDialog.getByRole('status').textContent() === 'Zusammenfassung kopiert.', 'Copy-summary action announces localized success');
  check(await bookingDialog.getByText(/Falls sich Ihr E-Mail-Programm nicht öffnet/).count() === 1, 'Appointment summary remains usable when a mail client does not open');
  check(await bookingDialog.getByRole('link', { name: 'office@mino-consulting.at' }).count() === 1, 'Appointment summary exposes the office email address');
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('blocked')) }, configurable: true });
    document.execCommand = () => false;
  });
  await bookingDialog.getByRole('button', { name: 'Zusammenfassung kopieren' }).click();
  await bookingDialog.getByRole('status').filter({ hasText: 'Die Zusammenfassung konnte nicht automatisch kopiert werden.' }).waitFor();
  check((await bookingDialog.getByRole('status').textContent()).startsWith('Die Zusammenfassung konnte nicht automatisch kopiert werden.'), 'Clipboard failure provides a localized fallback message');
  check(await page.evaluate(() => Object.keys(localStorage).length === 0), 'Copying or preparing an appointment request stores no form data');
  await page.keyboard.press('Escape');

  await page.setViewportSize({ width: 1440, height: 900 });
  const verifyBookingTrigger = async (trigger, label) => {
    await trigger.scrollIntoViewIfNeeded();
    await trigger.focus();
    await page.keyboard.press('Enter');
    const openedDialog = page.getByRole('dialog');
    await openedDialog.waitFor();
    check(await openedDialog.locator('#booking-title').count() === 1, `${label} opens the inquiry dialog`);
    await page.keyboard.press('Escape');
    await openedDialog.waitFor({ state: 'detached' });
    await page.waitForFunction((element) => document.activeElement === element, await trigger.elementHandle());
    check(await trigger.evaluate((element) => document.activeElement === element), `${label} restores focus to its opener`);
  };

  await goto(page, '/');
  await verifyBookingTrigger(page.locator('[data-booking-trigger="header"]'), 'Primary header trigger');
  await verifyBookingTrigger(page.locator('[data-booking-trigger="home-hero"]'), 'Homepage hero trigger');
  await verifyBookingTrigger(page.locator('[data-booking-trigger="footer"]'), 'Footer trigger');
  await page.evaluate(() => window.scrollTo(0, document.querySelector('#services').offsetTop + 700));
  await page.waitForFunction(() => document.querySelector('.delayed-sticky-header')?.getAttribute('aria-hidden') === 'false');
  await verifyBookingTrigger(page.locator('[data-booking-trigger="sticky-header"]'), 'Delayed sticky-header trigger');

  await goto(page, '/steuerberatung-wien');
  await verifyBookingTrigger(page.locator('[data-booking-trigger="service-hero"]'), 'Service-hero trigger');
  await verifyBookingTrigger(page.locator('[data-booking-trigger="service-cta"]'), 'Service closing CTA trigger');

  await goto(page, '/');
  const keyboardOpener = page.locator('[data-booking-trigger="home-hero"]');
  await keyboardOpener.focus();
  await page.keyboard.press('Enter');
  const keyboardDialog = page.getByRole('dialog');
  await keyboardDialog.waitFor();
  for (const [selector, value] of [
    ['#booking-name', 'Keyboard Synthetic'],
    ['#booking-company', 'Keyboard Synthetic KG'],
    ['#booking-email', 'keyboard@example.invalid'],
    ['#booking-phone', '+43 000 001'],
    ['#booking-message', 'Synthetischer Tastaturtest'],
  ]) {
    await keyboardDialog.locator(selector).focus();
    await page.keyboard.type(value);
  }
  check(await keyboardDialog.locator('.booking-trust-item').getAttribute('href') === '/minoconsult/datenschutzerklaerung', 'Keyboard flow retains the direct privacy link');
  await keyboardDialog.getByRole('button', { name: 'Anfrage prüfen' }).focus();
  await page.keyboard.press('Enter');
  await keyboardDialog.getByRole('heading', { name: 'Ihre Terminanfrage wurde vorbereitet.' }).waitFor();
  const keyboardEmailHref = decodeURIComponent(await keyboardDialog.getByRole('link', { name: /E-Mail-Anfrage öffnen/ }).getAttribute('href'));
  check(keyboardEmailHref.includes('Keyboard Synthetic') && keyboardEmailHref.includes('Bevorzugtes Datum (optional): -') && keyboardEmailHref.includes('Bevorzugter Zeitraum (optional): -'), 'Keyboard-only completion preserves blank optional preferences in the prepared email');
  await page.keyboard.press('Escape');

  await goto(page, '/hr/');
  const croatianOpener = page.locator('[data-booking-trigger="home-hero"]');
  await croatianOpener.click();
  const croatianDialog = page.getByRole('dialog', { name: 'Zatražite prvi razgovor' });
  await croatianDialog.waitFor();
  check(await croatianDialog.getByText('Ukratko nam opišite svoj upit. Pripremit ćemo e-poruku koju možete provjeriti prije slanja.', { exact: true }).count() === 1, 'Croatian dialog uses the equivalent concise email-preparation introduction');
  check(await croatianDialog.getByText('Željeni datum (neobavezno)', { exact: true }).count() === 1 && await croatianDialog.getByText('Željeno razdoblje (neobavezno)', { exact: true }).count() === 1, 'Croatian dialog labels both appointment preferences as optional');
  check(await croatianDialog.getByRole('button', { name: 'Pregledajte upit' }).count() === 1, 'Croatian dialog retains the email-based review action');
  await page.keyboard.press('Escape');

  for (const [path, settingsLabel] of [
    ['/datenschutzerklaerung', 'Datenschutzeinstellungen'],
    ['/hr/pravila-privatnosti', 'Postavke privatnosti'],
  ]) {
    await goto(page, path);
    check(await page.locator('.legal-section').count() === 17, `${path} renders all 17 privacy sections`);
    check(await page.locator('.privacy-table-of-contents a').count() === 17, `${path} renders a complete linked table of contents`);
    check(await page.getByRole('button', { name: settingsLabel }).first().count() === 1, `${path} links directly to privacy settings`);
    check(!/\[?TODO\]?/i.test(await page.locator('main').innerText()), `${path} contains no visible TODO marker`);
  }

  let cnameExists = true;
  try {
    await access(resolve('dist', 'CNAME'));
  } catch {
    cnameExists = false;
  }
  check(!cnameExists, 'Project Pages build contains no custom-domain CNAME');
  const indexHtml = await readFile(resolve('dist', 'index.html'), 'utf8');
  check(/(?:src|href)="\/minoconsult\/assets\//.test(indexHtml), 'Production assets resolve from the GitHub Pages project path');
  check(!/<iframe\b[^>]*google\.com\/maps/i.test(indexHtml), 'Initial generated HTML contains no Google Maps iframe');
  const futureIntegrationNotes = await readFile(resolve('FUTURE_INQUIRY_INTEGRATIONS.md'), 'utf8');
  check(/Direct form delivery/.test(futureIntegrationNotes) && /Availability-based booking/.test(futureIntegrationNotes) && /No provider has been selected/.test(futureIntegrationNotes), 'Future inquiry integrations are documented without selecting a provider');

  const generatedFiles = await collectFiles(resolve('dist'));
  const generatedText = (await Promise.all(generatedFiles
    .filter((file) => /\.(?:html|css|js|xml|txt)$/i.test(file))
    .map((file) => readFile(file, 'utf8')))).join('\n');
  for (const [label, pattern] of [
    ['fonts.googleapis.com', /fonts\.googleapis\.com/i],
    ['fonts.gstatic.com', /fonts\.gstatic\.com/i],
    ['images.unsplash.com', /images\.unsplash\.com/i],
  ]) check(!pattern.test(generatedText), `Generated production files contain no ${label}`);

  await context.close();
} finally {
  await browser.close();
  await server.close();
}

if (failures.length > 0) {
  console.error(`Privacy and launch checks failed (${failures.length}/${checks.length}):\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Passed ${checks.length} privacy, consent, appointment-request and project Pages checks.`);
