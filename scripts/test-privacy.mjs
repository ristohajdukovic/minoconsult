import { access, readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright-core';
import { preview } from 'vite';

const failures = [];
const checks = [];
let baseUrl;

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
  const response = await page.goto(`${baseUrl}${path}`, { waitUntil: 'domcontentloaded' });
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
  check(await bookingDialog.getByText('Bevorzugter Zeitraum', { exact: true }).count() === 1, 'Appointment interface labels periods as preferences');
  check(await bookingDialog.getByRole('button', { name: '08:00–10:00' }).count() === 1, 'Appointment interface uses consultation periods');
  check(await bookingDialog.getByRole('button', { name: /08:30|11:30|14:30|15:30/ }).count() === 0, 'Appointment interface contains no simulated exact availability slots');
  check(await bookingDialog.getByText('Der gewünschte Termin ist erst nach einer Bestätigung durch MINO Consulting KG verbindlich.', { exact: true }).count() === 1, 'Confirmation disclaimer is visible before the email action');

  await bookingDialog.locator('#booking-date').fill('2026-08-01');
  await bookingDialog.getByRole('button', { name: '08:00–10:00' }).click();
  await bookingDialog.locator('#booking-name').fill('Test Person');
  await bookingDialog.locator('#booking-company').fill('Test KG');
  await bookingDialog.locator('#booking-email').fill('test@example.com');
  await bookingDialog.locator('#booking-phone').fill('+43 1 234 56');
  await bookingDialog.locator('#booking-message').fill('Frage zur Buchhaltung');
  check(await page.evaluate(() => Object.keys(localStorage).length === 0), 'Appointment form data is not stored in local storage');
  await bookingDialog.getByRole('button', { name: 'Anfrage prüfen' }).click();
  check(await bookingDialog.getByRole('heading', { name: 'Ihre Terminanfrage wurde vorbereitet.' }).count() === 1, 'German appointment success state uses the required request wording');
  const emailHref = await bookingDialog.getByRole('link', { name: /E-Mail-Anfrage öffnen/ }).getAttribute('href');
  const decodedEmailHref = decodeURIComponent(emailHref);
  check(decodedEmailHref.includes('Test Person') && decodedEmailHref.includes('Test KG') && decodedEmailHref.includes('Frage zur Buchhaltung'), 'Prepared email contains all entered form details');
  check(decodedEmailHref.includes('Bevorzugter Zeitraum: 08:00–10:00') && decodedEmailHref.includes('erst nach einer Bestätigung'), 'Prepared email contains localized period and disclaimer wording');
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

  const cname = (await readFile(resolve('dist', 'CNAME'), 'utf8')).trim();
  check(cname === 'www.mino.co.at', 'Production build contains the correct CNAME');
  const indexHtml = await readFile(resolve('dist', 'index.html'), 'utf8');
  check(/(?:src|href)="\/assets\//.test(indexHtml) && !/\/minoconsult\//.test(indexHtml), 'Production assets resolve from the custom-domain root');
  check(!/<iframe\b[^>]*google\.com\/maps/i.test(indexHtml), 'Initial generated HTML contains no Google Maps iframe');

  const generatedFiles = await collectFiles(resolve('dist'));
  const generatedText = (await Promise.all(generatedFiles
    .filter((file) => /\.(?:html|css|js|xml|txt)$/i.test(file))
    .map((file) => readFile(file, 'utf8')))).join('\n');
  for (const [label, pattern] of [
    ['fonts.googleapis.com', /fonts\.googleapis\.com/i],
    ['fonts.gstatic.com', /fonts\.gstatic\.com/i],
    ['images.unsplash.com', /images\.unsplash\.com/i],
    ['GitHub preview metadata', /ristohajdukovic\.github\.io/i],
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

console.log(`Passed ${checks.length} privacy, consent, appointment-request, asset and custom-domain checks.`);
