import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { allPages, homeContentByLanguage } from '../src/config/routes.js';
import { ADVISER_PORTRAIT_PATH, CONTACT_EMAIL, HERO_IMAGE_PATH, MOBILE_PHONE, OFFICE_ADDRESS, OFFICE_PHONE } from '../src/config/site.js';
import {
  customerContent,
  getApprovedAdviserBiography,
  getApprovedImage,
  getApprovedProfessionalRegistration,
  getApprovedTargetClientCopy,
} from '../src/config/customerContent.js';
import { getPublicTrustFacts, verifiedBusinessFacts } from '../src/config/verifiedBusinessFacts.js';

const checks = [];
const failures = [];

function check(condition, message) {
  checks.push(message);
  if (!condition) failures.push(message);
}

function stringsIn(value) {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(stringsIn);
  if (value && typeof value === 'object') return Object.values(value).flatMap(stringsIn);
  return [];
}

const marketingPages = allPages.filter((page) => page.kind !== 'legal');
const marketingText = marketingPages.flatMap(stringsIn).join('\n');
const prohibitedGenericPhrases = [
  /maßgeschneiderte lösungen/i,
  /individuelle lösungen/i,
  /ganzheitliche beratung/i,
  /ihr verlässlicher partner/i,
  /höchste qualität/i,
  /maximale sicherheit/i,
  /individualna rješenja/i,
  /profesionalno knjigovodstvo/i,
  /spremni za sljedeći korak/i,
];

check(!/\b(?:TODO|TBD|Lorem ipsum|PLACEHOLDER)\b/i.test(marketingText), 'Public marketing content has no visible placeholder or TODO text');
check(!/\[(?:ZIELGRUPPE|CILJNA SKUPINA|[A-Z_]{3,})\]/.test(marketingText), 'Public marketing content has no bracketed content variables');
for (const pattern of prohibitedGenericPhrases) {
  check(!pattern.test(marketingText), `Prohibited generic phrase is absent: ${pattern}`);
}

for (const language of ['de', 'hr']) {
  const trustFacts = getPublicTrustFacts(language);
  check(trustFacts.length > 0 && trustFacts.every((fact) => fact.label && fact.value), `${language} trust strip has no empty item`);
  const home = homeContentByLanguage[language];
  check(Boolean(home.hero.eyebrow && home.hero.title?.length === 1 && home.hero.body), `${language} hero uses the direct factual hierarchy`);
  check(!HERO_IMAGE_PATH || Boolean(getApprovedImage('heroImage', language)?.alt), `${language} approved hero photography requires localized alt text`);
  check(Boolean(home.about.eyebrow && home.about.principalName && home.about.principalRole && home.about.summary), `${language} About section uses the concise adviser hierarchy`);
  check(home.about.facts.length === 3 && home.about.facts.some((fact) => fact.includes(OFFICE_ADDRESS.split(', 1170')[0])), `${language} About section retains the verified office details`);
  check(home.about.facts.some((fact) => fact.includes('Deutsch · Hrvatski')), `${language} About section states the verified languages`);
  check(home.about.facts.some((fact) => fact.includes('FN 157894y') && fact.includes('Handelsgericht Wien')), `${language} About section retains the verified register details`);
  check(!ADVISER_PORTRAIT_PATH || Boolean(getApprovedImage('adviserPortrait', language)?.alt), `${language} approved adviser photography requires localized alt text`);
  check(home.contact.cards.some((item) => item.value === CONTACT_EMAIL), `${language} home reads email from shared configuration`);
  check(home.contact.cards.some((item) => item.value === OFFICE_PHONE), `${language} home reads office phone from shared configuration`);
  check(home.contact.cards.some((item) => item.value === MOBILE_PHONE), `${language} home retains the mobile phone alternative`);
  check(home.contact.cards.some((item) => item.value === OFFICE_ADDRESS), `${language} home reads address from shared configuration`);
  check(/bestätig/i.test(home.booking.disclaimer) || /potvr/i.test(home.booking.disclaimer), `${language} appointment dialog contains a confirmation disclaimer`);
  check(language === 'de'
    ? home.booking.intro === 'Nennen Sie uns kurz Ihr Anliegen. Wir bereiten eine E-Mail vor, die Sie vor dem Senden prüfen können.'
    : home.booking.intro === 'Ukratko nam opišite svoj upit. Pripremit ćemo e-poruku koju možete provjeriti prije slanja.', `${language} appointment dialog uses the approved concise introduction`);
  check(/optional|neobavezno/i.test(home.booking.dateLabel) && /optional|neobavezno/i.test(home.booking.timeLabel), `${language} date and time labels identify optional preferences`);
  check(/Anfrage prüfen|Pregledajte upit/.test(home.booking.submit), `${language} appointment action remains an email review step`);
  check(!/(automatisch gesendet|automatski poslan)/i.test(stringsIn(home.booking).join(' ')), `${language} booking copy never claims automatic transmission`);
  check(!/(Termin jetzt buchen|Jetzt buchen)/i.test(stringsIn(home.cta).join(' ')), `${language} CTA does not imply a confirmed booking`);
  check(Boolean(home.value.eyebrow && home.value.title && home.value.intro), `${language} compact value section has an eyebrow, heading and introduction`);
  check(home.value.statement == null && home.value.features == null, `${language} home no longer contains the animated manifesto structure`);
  check(home.services.length === 5 && new Set(home.services.map((service) => service.path)).size === 5, `${language} homepage has five distinct primary service destinations`);
  check(home.services.every((service) => service.body.split(/[.!?]+/).filter(Boolean).length <= 2), `${language} homepage service descriptions use no more than two sentences`);
  const bookkeepingCopy = stringsIn(home.services[0]).join(' ');
  check(language === 'de' ? !/Lohnverrechnung/i.test(bookkeepingCopy) : !/obračun plaća/i.test(bookkeepingCopy), `${language} bookkeeping card does not duplicate payroll`);
}

for (const [label, path] of [
  ['hero image', HERO_IMAGE_PATH],
  ['adviser portrait', ADVISER_PORTRAIT_PATH],
  ['social image', customerContent.media.socialImage.path],
]) {
  check(!path || (path.startsWith('/') && !/placeholder/i.test(path)), `Configured ${label} uses a local non-placeholder path`);
  check(!path || existsSync(resolve('public', path.replace(/^\//, ''))), `Configured ${label} exists in public assets`);
}

const customerControlledText = stringsIn(customerContent).join('\n');
check(!/\b(?:TODO|TBD|Lorem ipsum|PLACEHOLDER)\b/i.test(customerControlledText), 'Customer-controlled configuration contains no unresolved public tokens');
let productionDomainIsSafe = customerContent.productionDomain === null;
if (customerContent.productionDomain) {
  try {
    const productionUrl = new URL(customerContent.productionDomain);
    productionDomainIsSafe = productionUrl.protocol === 'https:' && productionUrl.pathname === '/' && !productionUrl.search && !productionUrl.hash;
  } catch {
    productionDomainIsSafe = false;
  }
}
check(productionDomainIsSafe, 'Approved production domain is either null or an HTTPS origin without extra URL parts');
check(customerContent.professionalRegistration.url === null || /^https:\/\//i.test(customerContent.professionalRegistration.url), 'Professional registration URL is either null or HTTPS');
check(customerContent.newMandates.status === null || typeof customerContent.newMandates.status === 'boolean', 'New-mandates status is null or an explicit boolean');
check(customerContent.formBookingDecision === null || typeof customerContent.formBookingDecision === 'string', 'Form and booking decision is null or an explicit approved value');
check(Boolean(getApprovedAdviserBiography('de')) === Boolean(getApprovedAdviserBiography('hr')), 'Approved adviser biography is published only with DE/HR parity');
check(Boolean(getApprovedTargetClientCopy('de')) === Boolean(getApprovedTargetClientCopy('hr')), 'Approved target-client copy is published only with DE/HR parity');
check(Boolean(getApprovedProfessionalRegistration('de')) === Boolean(getApprovedProfessionalRegistration('hr')), 'Professional registration link is published only with DE/HR labels');

check(getPublicTrustFacts('de').some((fact) => fact.value === 'Kanzlei in 1170 Wien'), 'German trust strip uses the verified office location');
check(getPublicTrustFacts('de').some((fact) => fact.value === 'Mag. Tomislav Siketic · Steuerberater'), 'German trust strip uses the published principal and title');
check(getPublicTrustFacts('hr').some((fact) => fact.value === 'Mag. Tomislav Siketic · Porezni savjetnik'), 'Croatian trust strip uses the localized published title');
check(verifiedBusinessFacts.consultationLanguages !== null || !getPublicTrustFacts('de').some((fact) => fact.label === 'Beratung'), 'Unverified consultation languages stay out of the trust strip');

check(verifiedBusinessFacts.googleRating === null && verifiedBusinessFacts.googleReviewCount === null, 'No fake review rating or count is configured');
check(verifiedBusinessFacts.acceptsNewClients === null, 'Unknown client-acceptance status remains unknown');
check(verifiedBusinessFacts.freeInitialConsultation === null, 'Unknown free-consultation status remains unknown');
check(!/1997/.test(marketingText), 'No unverified 1997 experience claim appears in marketing content');
check(!/(Antwort (?:innerhalb|in) \d|odgovor (?:u|unutar) \d)/i.test(marketingText), 'No unverified response time appears in marketing content');
check(!/(poreski savetnik|savetnik|preduzeće|izveštaj)/i.test(marketingPages.filter((page) => page.language === 'hr').flatMap(stringsIn).join(' ')), 'Croatian content contains no prohibited Serbian ekavian forms');

const servicePages = allPages.filter((page) => page.kind === 'service');
const normalizedIntros = servicePages.map((page) => page.intro.toLocaleLowerCase(page.language).replace(/\s+/g, ' ').trim());
check(new Set(normalizedIntros).size === normalizedIntros.length, 'No service page duplicates another service introduction');

for (const page of servicePages) {
  check(Boolean(page.h1 && page.ctaTitle && page.ctaBody), `${page.path} has an H1 and contextual primary CTA`);
  check(page.related.length > 0 && page.relatedLinkLabel, `${page.path} has meaningful related-service linking`);
  check(page.clientProvides?.length > 0 && page.limitations?.length > 0, `${page.path} explains client inputs and limitations`);
  check(page.related.every((path) => page.language === 'hr' ? path.startsWith('/hr/') : !path.startsWith('/hr/')), `${page.path} related links stay in the same language`);
}

const legalPages = allPages.filter((page) => page.kind === 'legal');
check(legalPages.every((page) => !page.ctaTitle && !page.related), 'Legal and privacy routes remain non-marketing pages');

if (failures.length) {
  console.error(`Content quality checks failed (${failures.length}/${checks.length}):\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Passed ${checks.length} bilingual content, trust, claim and service-structure checks.`);
