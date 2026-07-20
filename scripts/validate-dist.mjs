import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadEnv } from 'vite';
import { allPages, homeContentByLanguage } from '../src/config/routes.js';
import { absoluteUrl, resolveSiteUrl } from '../src/config/site.js';

const distDir = resolve('dist');
const env = loadEnv('production', process.cwd(), '');
const siteUrl = resolveSiteUrl(env, { production: true });
const failures = [];
const titles = new Set();
const descriptions = new Set();

function routeFile(path) {
  return path === '/'
    ? resolve(distDir, 'index.html')
    : resolve(distDir, path.replace(/^\//, '').replace(/\/$/, ''), 'index.html');
}

function matches(html, pattern) {
  return [...html.matchAll(pattern)];
}

async function collectTextFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectTextFiles(entryPath));
    else if (/\.(?:html|css|js|xml|txt)$/i.test(entry.name)) files.push(entryPath);
  }
  return files;
}

for (const page of allPages) {
  let html;
  try {
    html = await readFile(routeFile(page.path), 'utf8');
  } catch {
    failures.push(`${page.path}: generated index.html is missing`);
    continue;
  }

  const titleMatches = matches(html, /<title>([\s\S]*?)<\/title>/gi);
  const canonicalMatches = matches(html, /<link\s+rel="canonical"\s+href="([^"]+)"\s*\/>/gi);
  const descriptionMatches = matches(html, /<meta\s+name="description"\s+content="([^"]+)"\s*\/>/gi);
  const expectedCanonical = absoluteUrl(siteUrl, page.path);

  if (!new RegExp(`<html\\s+lang="${page.language}"`, 'i').test(html)) failures.push(`${page.path}: incorrect html lang`);
  if (titleMatches.length !== 1 || titleMatches[0]?.[1] !== page.title) failures.push(`${page.path}: incorrect or duplicate title`);
  if (canonicalMatches.length !== 1 || canonicalMatches[0]?.[1] !== expectedCanonical) failures.push(`${page.path}: incorrect or duplicate canonical`);
  if (descriptionMatches.length !== 1) failures.push(`${page.path}: incorrect or duplicate meta description`);
  if (titles.has(page.title)) failures.push(`${page.path}: title is not unique`);
  if (descriptions.has(page.metaDescription)) failures.push(`${page.path}: meta description is not unique`);
  titles.add(page.title);
  descriptions.add(page.metaDescription);

  const expectedAlternates = {
    'de-AT': absoluteUrl(siteUrl, page.alternatePaths.de),
    hr: absoluteUrl(siteUrl, page.alternatePaths.hr),
    'x-default': absoluteUrl(siteUrl, page.alternatePaths.de),
  };
  for (const [hreflang, href] of Object.entries(expectedAlternates)) {
    const escapedLang = hreflang.replace('-', '\\-');
    const alternate = matches(html, new RegExp(`<link\\s+rel="alternate"\\s+hreflang="${escapedLang}"\\s+href="([^"]+)"\\s*\\/>`, 'gi'));
    if (alternate.length !== 1 || alternate[0]?.[1] !== href) failures.push(`${page.path}: invalid ${hreflang} alternate`);
  }

  for (const requiredMeta of ['og:title', 'og:description', 'og:type', 'og:url', 'og:site_name', 'og:locale']) {
    if (!new RegExp(`<meta\\s+property="${requiredMeta}"`, 'i').test(html)) failures.push(`${page.path}: missing ${requiredMeta}`);
  }
  if (!/<meta\s+name="twitter:card"\s+content="summary_large_image"/i.test(html)) failures.push(`${page.path}: missing twitter card`);

  const schemaMatches = matches(html, /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
  if (schemaMatches.length < 2) failures.push(`${page.path}: expected structured data is missing`);
  const schemaTypes = [];
  for (const schemaMatch of schemaMatches) {
    try {
      const schema = JSON.parse(schemaMatch[1]);
      schemaTypes.push(schema['@type']);
      if (['WebPage', 'FAQPage'].includes(schema['@type']) && schema.inLanguage !== page.language) {
        failures.push(`${page.path}: page-specific structured data has incorrect inLanguage`);
      }
      if (schema['@type'] === 'AccountingService' && schema['@id'] !== `${siteUrl}/#organization`) {
        failures.push(`${page.path}: organization structured data has an inconsistent @id`);
      }
      if (schema['@type'] === 'WebSite' && schema['@id'] !== `${siteUrl}/#website`) {
        failures.push(`${page.path}: website structured data has an inconsistent @id`);
      }
      if (schema['@type'] === 'FAQPage') {
        const visibleFaq = page.faq?.items ?? page.faq ?? [];
        const schemaFaq = schema.mainEntity ?? [];
        const faqMatches = visibleFaq.length === schemaFaq.length && visibleFaq.every((item, index) => (
          schemaFaq[index]?.name === item.question && schemaFaq[index]?.acceptedAnswer?.text === item.answer
        ));
        if (!faqMatches) failures.push(`${page.path}: FAQ structured data does not match visible FAQ content`);
      }
    } catch {
      failures.push(`${page.path}: structured data is not valid JSON`);
    }
  }
  for (const requiredType of ['AccountingService', 'WebSite', 'WebPage']) {
    if (schemaTypes.filter((type) => type === requiredType).length !== 1) failures.push(`${page.path}: expected one ${requiredType} schema`);
  }

  for (const requiredMeta of ['twitter:title', 'twitter:description']) {
    if (!new RegExp(`<meta\\s+name="${requiredMeta}"`, 'i').test(html)) failures.push(`${page.path}: missing ${requiredMeta}`);
  }
  if (!/<meta\s+name="robots"\s+content="index, follow"/i.test(html)) failures.push(`${page.path}: missing production robots directive`);
  const fallbackHtml = html.match(/<noscript>([\s\S]*?)<\/noscript>/i)?.[1] ?? '';
  if ((fallbackHtml.match(/<h1\b/gi) ?? []).length !== 1) failures.push(`${page.path}: static fallback does not contain exactly one H1`);
  if (!fallbackHtml.includes('mailto:') || !fallbackHtml.includes('tel:')) failures.push(`${page.path}: static fallback is missing core contact links`);

  if (/ristohajdukovic\.github\.io/i.test(html)) failures.push(`${page.path}: preview URL leaked into HTML`);
  if (/\[TODO\]|\bTODO\b/i.test(html)) failures.push(`${page.path}: TODO text leaked into HTML`);
  if (/<iframe\b[^>]*(?:google\.com\/maps|google\.at\/maps)/i.test(html)) failures.push(`${page.path}: Google Maps iframe exists in initial HTML`);
  if (/\/minoconsult\//i.test(html)) failures.push(`${page.path}: project preview base leaked into production HTML`);
  if (page.language === 'hr' && canonicalMatches[0]?.[1] === absoluteUrl(siteUrl, page.alternatePaths.de)) {
    failures.push(`${page.path}: Croatian page canonicalizes to German`);
  }
}

const sitemap = await readFile(resolve(distDir, 'sitemap.xml'), 'utf8');
const sitemapUrls = new Set(matches(sitemap, /<loc>([^<]+)<\/loc>/g).map((match) => match[1]));
const expectedUrls = new Set(allPages.map((page) => absoluteUrl(siteUrl, page.path)));
if (sitemapUrls.size !== expectedUrls.size || [...expectedUrls].some((url) => !sitemapUrls.has(url))) {
  failures.push('sitemap.xml URLs do not match generated routes');
}
if (!/xmlns:xhtml="http:\/\/www\.w3\.org\/1999\/xhtml"/.test(sitemap)) failures.push('sitemap.xml is missing the XHTML namespace');
if (/ristohajdukovic\.github\.io/i.test(sitemap)) failures.push('preview URL leaked into sitemap.xml');

const robots = await readFile(resolve(distDir, 'robots.txt'), 'utf8');
if (!robots.includes(`Sitemap: ${absoluteUrl(siteUrl, '/sitemap.xml')}`)) failures.push('robots.txt references the wrong sitemap');

try {
  const notFoundHtml = await readFile(resolve(distDir, '404.html'), 'utf8');
  if (!/<meta\s+name="robots"\s+content="noindex, follow"/i.test(notFoundHtml)) failures.push('404.html is missing noindex, follow');
  if ((notFoundHtml.match(/<h1\b/gi) ?? []).length !== 1) failures.push('404.html must contain exactly one H1');
  if (!notFoundHtml.includes('Seite nicht gefunden') || !notFoundHtml.includes('Stranica nije pronađena')) failures.push('404.html is missing bilingual recovery headings');
} catch {
  failures.push('404.html is missing');
}

for (const privacyPath of ['/datenschutzerklaerung', '/hr/pravila-privatnosti']) {
  if (!allPages.some((page) => page.path === privacyPath)) failures.push(`${privacyPath}: privacy route is missing from route configuration`);
}

for (const language of ['de', 'hr']) {
  const content = homeContentByLanguage[language];
  if (!content?.privacySettings?.button) failures.push(`${language}: footer privacy-settings label is missing`);
  if (!content?.mapConsent?.load) failures.push(`${language}: contextual Google Maps consent label is missing`);
  if (!content?.booking?.disclaimer) failures.push(`${language}: appointment-request disclaimer is missing`);
  if (content?.booking?.periods?.length !== 5) failures.push(`${language}: preferred appointment periods are incomplete`);
  if (language === 'de' && content?.cta?.book !== 'Erstgespräch anfragen') failures.push('German CTA does not use request terminology');
  if (language === 'hr' && content?.cta?.book !== 'Zatražite prvi razgovor') failures.push('Croatian CTA does not use request terminology');
}

try {
  const publicCname = (await readFile(resolve('public', 'CNAME'), 'utf8')).trim();
  const distCname = (await readFile(resolve(distDir, 'CNAME'), 'utf8')).trim();
  if (publicCname !== 'www.mino.co.at') failures.push('public/CNAME does not contain www.mino.co.at');
  if (distCname !== 'www.mino.co.at') failures.push('dist/CNAME does not contain www.mino.co.at');
} catch {
  failures.push('public/CNAME or dist/CNAME is missing');
}

const prohibitedPatterns = [
  ['Google Fonts stylesheet domain', /fonts\.googleapis\.com/i],
  ['Google Fonts asset domain', /fonts\.gstatic\.com/i],
  ['Unsplash production image domain', /images\.unsplash\.com/i],
  ['GitHub Pages preview domain', /ristohajdukovic\.github\.io/i],
];
for (const file of await collectTextFiles(distDir)) {
  const contents = await readFile(file, 'utf8');
  for (const [label, pattern] of prohibitedPatterns) {
    if (pattern.test(contents)) failures.push(`${file.replace(`${distDir}\\`, '')}: contains prohibited ${label}`);
  }
  if (/\[TODO\]/i.test(contents)) failures.push(`${file.replace(`${distDir}\\`, '')}: contains visible [TODO] text`);
}

if (failures.length > 0) {
  console.error(`Generated-site validation failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Validated ${allPages.length} generated routes, metadata groups, hreflang pairs, JSON-LD blocks, sitemap URLs, and robots.txt.`);
