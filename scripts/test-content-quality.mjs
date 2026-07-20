import { allPages, homeContentByLanguage } from '../src/config/routes.js';
import { CONTACT_EMAIL, OFFICE_ADDRESS, OFFICE_PHONE } from '../src/config/site.js';
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
  check(home.contact.cards.some((item) => item.value === CONTACT_EMAIL), `${language} home reads email from shared configuration`);
  check(home.contact.cards.some((item) => item.value === OFFICE_PHONE), `${language} home reads office phone from shared configuration`);
  check(home.contact.cards.some((item) => item.value === OFFICE_ADDRESS), `${language} home reads address from shared configuration`);
  check(/bestätig/i.test(home.booking.disclaimer) || /potvr/i.test(home.booking.disclaimer), `${language} appointment dialog contains a confirmation disclaimer`);
  check(!/(Termin jetzt buchen|Jetzt buchen)/i.test(stringsIn(home.cta).join(' ')), `${language} CTA does not imply a confirmed booking`);
}

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
