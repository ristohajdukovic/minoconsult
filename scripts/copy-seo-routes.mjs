import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadEnv } from 'vite';
import { allPages, routePairs } from '../src/config/routes.js';
import {
  absoluteUrl,
  CONTACT_EMAIL,
  MAP_EXTERNAL_URL,
  OFFICE_ADDRESS,
  OFFICE_CITY,
  OFFICE_COUNTRY,
  OFFICE_PHONE,
  OFFICE_PHONE_HREF,
  OFFICE_POSTAL_CODE,
  OFFICE_STREET,
  resolveSiteUrl,
  SOCIAL_IMAGE_PATH,
  SITE_NAME,
} from '../src/config/site.js';

const distDir = resolve('dist');
const indexFile = resolve(distDir, 'index.html');
const env = loadEnv('production', process.cwd(), '');
const siteUrl = resolveSiteUrl(env, { production: true });
const isPreviewBuild = process.argv.includes('--preview');
const usesProjectPages = siteUrl.includes('ristohajdukovic.github.io/minoconsult');
const outputBasePath = isPreviewBuild || usesProjectPages ? '/minoconsult' : '';

function outputHref(path) {
  if (path === '/') return `${outputBasePath}/` || '/';
  return `${outputBasePath}${path}`;
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character],
  );
}

function escapeXml(value) {
  return escapeHtml(value);
}

function upsertMeta(html, attribute, key, content) {
  const tag = `<meta ${attribute}="${key}" content="${escapeHtml(content)}" />`;
  const pattern = new RegExp(`<meta\\s+${attribute}="${key}"[\\s\\S]*?>`, 'i');
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace(/<\/head>/i, `    ${tag}\n  </head>`);
}

function removeMeta(html, attribute, key) {
  const pattern = new RegExp(`\\s*<meta\\s+${attribute}="${key}"[\\s\\S]*?>`, 'gi');
  return html.replace(pattern, '');
}

function upsertCanonical(html, href) {
  const tag = `<link rel="canonical" href="${escapeHtml(href)}" />`;
  const pattern = /<link\s+rel="canonical"[\s\S]*?>/i;
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace(/<\/head>/i, `    ${tag}\n  </head>`);
}

function structuredDataForPage(page) {
  const canonical = absoluteUrl(siteUrl, page.path);
  const organizationId = `${siteUrl}/#organization`;
  const websiteId = `${siteUrl}/#website`;
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'AccountingService',
      '@id': organizationId,
      name: SITE_NAME,
      url: absoluteUrl(siteUrl, '/'),
      telephone: OFFICE_PHONE,
      email: CONTACT_EMAIL,
      address: {
        '@type': 'PostalAddress',
        streetAddress: OFFICE_STREET,
        postalCode: OFFICE_POSTAL_CODE,
        addressLocality: OFFICE_CITY,
        addressCountry: OFFICE_COUNTRY,
      },
      areaServed: { '@type': 'City', name: OFFICE_CITY },
      availableLanguage: ['de', 'hr'],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': websiteId,
      name: SITE_NAME,
      url: absoluteUrl(siteUrl, '/'),
      inLanguage: ['de', 'hr'],
      publisher: { '@id': organizationId },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${canonical}#webpage`,
      name: page.title,
      description: page.metaDescription,
      url: canonical,
      inLanguage: page.language,
      isPartOf: { '@id': websiteId },
      about: { '@id': organizationId },
    },
  ];

  const faqItems = page.faq?.items ?? page.faq;
  if (Array.isArray(faqItems) && faqItems.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      inLanguage: page.language,
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    });
  }

  return schemas;
}

function plainHeading(page) {
  if (page.h1) return page.h1;
  return page.hero?.title?.map((part) => part.text).join('') ?? SITE_NAME;
}

function staticFallbackForPage(page) {
  const isCroatian = page.language === 'hr';
  const homePath = isCroatian ? '/hr/' : '/';
  const contactHref = `${outputHref(homePath)}#contact`;
  const servicePages = allPages.filter((candidate) => candidate.language === page.language && candidate.kind === 'service');
  const intro = page.intro ?? page.hero?.body ?? page.metaDescription;
  const labels = isCroatian
    ? { nav: 'Glavna navigacija', home: 'Početna', services: 'Usluge', contact: 'Kontakt', language: 'Deutsch', legal: 'Pravne informacije', maps: 'Otvori adresu u Google Mapsu', email: 'E-pošta', phone: 'Telefon' }
    : { nav: 'Hauptnavigation', home: 'Startseite', services: 'Leistungen', contact: 'Kontakt', language: 'Hrvatski', legal: 'Rechtliches', maps: 'Adresse in Google Maps öffnen', email: 'E-Mail', phone: 'Telefon' };
  const otherHome = isCroatian ? '/' : '/hr/';
  const imprintPath = isCroatian ? '/hr/impressum' : '/impressum';
  const privacyPath = isCroatian ? '/hr/pravila-privatnosti' : '/datenschutzerklaerung';

  return [
    '    <!-- STATIC_FALLBACK_START -->',
    '    <noscript>',
    `      <main class="static-fallback" lang="${page.language}">`,
    `        <nav aria-label="${labels.nav}"><a href="${outputHref(homePath)}">${labels.home}</a><a href="${contactHref}">${labels.contact}</a><a href="${outputHref(otherHome)}" lang="${isCroatian ? 'de' : 'hr'}">${labels.language}</a></nav>`,
    `        <h1>${escapeHtml(plainHeading(page))}</h1>`,
    `        <p>${escapeHtml(intro)}</p>`,
    `        <section><h2>${labels.services}</h2><div class="static-fallback-links">${servicePages.map((service) => `<a href="${outputHref(service.path)}">${escapeHtml(service.eyebrow ?? service.h1)}</a>`).join('')}</div></section>`,
    `        <section id="contact"><h2>${labels.contact}</h2><p>${labels.email}: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a><br />${labels.phone}: <a href="${OFFICE_PHONE_HREF}">${OFFICE_PHONE}</a><br />${OFFICE_ADDRESS}</p><p><a href="${MAP_EXTERNAL_URL}" rel="noopener noreferrer">${labels.maps}</a></p></section>`,
    `        <section><h2>${labels.legal}</h2><div class="static-fallback-links"><a href="${outputHref(imprintPath)}">${isCroatian ? 'Impresum' : 'Impressum'}</a><a href="${outputHref(privacyPath)}">${isCroatian ? 'Pravila privatnosti' : 'Datenschutz'}</a></div></section>`,
    '      </main>',
    '    </noscript>',
    '    <!-- STATIC_FALLBACK_END -->',
  ].join('\n');
}

function applyPageMetadata(baseHtml, page) {
  const canonical = absoluteUrl(siteUrl, page.path);
  const deUrl = absoluteUrl(siteUrl, page.alternatePaths.de);
  const hrUrl = absoluteUrl(siteUrl, page.alternatePaths.hr);
  const locale = page.language === 'de' ? 'de_AT' : 'hr_HR';
  const alternateLocale = page.language === 'de' ? 'hr_HR' : 'de_AT';
  let html = baseHtml
    .replace(/<html\s+lang="[^"]*"/i, `<html lang="${page.language}"`)
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(page.title)}</title>`)
    .replace(/\s*<link\s+rel="alternate"[\s\S]*?>/gi, '')
    .replace(/\s*<script\s+type="application\/ld\+json"[\s\S]*?<\/script>/gi, '');

  html = upsertMeta(html, 'name', 'description', page.metaDescription);
  html = upsertMeta(html, 'name', 'robots', isPreviewBuild ? 'noindex, nofollow' : 'index, follow');
  html = upsertMeta(html, 'property', 'og:title', page.title);
  html = upsertMeta(html, 'property', 'og:description', page.metaDescription);
  html = upsertMeta(html, 'property', 'og:type', 'website');
  html = upsertMeta(html, 'property', 'og:url', canonical);
  html = upsertMeta(html, 'property', 'og:site_name', SITE_NAME);
  html = upsertMeta(html, 'property', 'og:locale', locale);
  html = upsertMeta(html, 'property', 'og:locale:alternate', alternateLocale);
  if (SOCIAL_IMAGE_PATH) {
    const socialImageUrl = absoluteUrl(siteUrl, SOCIAL_IMAGE_PATH);
    html = upsertMeta(html, 'property', 'og:image', socialImageUrl);
    html = upsertMeta(html, 'name', 'twitter:image', socialImageUrl);
    html = upsertMeta(html, 'name', 'twitter:card', 'summary_large_image');
  } else {
    html = removeMeta(html, 'property', 'og:image');
    html = removeMeta(html, 'name', 'twitter:image');
    html = upsertMeta(html, 'name', 'twitter:card', 'summary');
  }
  html = upsertMeta(html, 'name', 'twitter:title', page.title);
  html = upsertMeta(html, 'name', 'twitter:description', page.metaDescription);
  html = upsertCanonical(html, canonical);

  const alternates = [
    `<link rel="alternate" hreflang="de-AT" href="${escapeHtml(deUrl)}" />`,
    `<link rel="alternate" hreflang="hr" href="${escapeHtml(hrUrl)}" />`,
    `<link rel="alternate" hreflang="x-default" href="${escapeHtml(deUrl)}" />`,
  ].join('\n    ');
  const schemas = structuredDataForPage(page)
    .map((schema) => `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`)
    .join('\n    ');

  html = html.replace(/<\/head>/i, `    ${alternates}\n    ${schemas}\n  </head>`);
  return html.replace(/\s*<!-- STATIC_FALLBACK_START -->[\s\S]*?<!-- STATIC_FALLBACK_END -->/i, `\n${staticFallbackForPage(page)}`);
}

function sitemapXml() {
  const entries = routePairs.flatMap((pair) => [pair.de, pair.hr].map((page) => {
    const deUrl = absoluteUrl(siteUrl, pair.de.path);
    const hrUrl = absoluteUrl(siteUrl, pair.hr.path);
    return [
      '  <url>',
      `    <loc>${escapeXml(absoluteUrl(siteUrl, page.path))}</loc>`,
      `    <xhtml:link rel="alternate" hreflang="de-AT" href="${escapeXml(deUrl)}" />`,
      `    <xhtml:link rel="alternate" hreflang="hr" href="${escapeXml(hrUrl)}" />`,
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(deUrl)}" />`,
      '  </url>',
    ].join('\n');
  }));

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n');
}

const baseHtml = await readFile(indexFile, 'utf8');

await Promise.all(allPages.map(async (page) => {
  const html = applyPageMetadata(baseHtml, page);
  if (page.path === '/') {
    await writeFile(indexFile, html);
    return;
  }

  const routeDir = resolve(distDir, page.path.replace(/^\//, '').replace(/\/$/, ''));
  await mkdir(routeDir, { recursive: true });
  await writeFile(resolve(routeDir, 'index.html'), html);
}));

await writeFile(resolve(distDir, 'sitemap.xml'), sitemapXml());
await writeFile(
  resolve(distDir, 'robots.txt'),
  isPreviewBuild
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl(siteUrl, '/sitemap.xml')}\n`,
);

if (isPreviewBuild || usesProjectPages) {
  await rm(resolve(distDir, 'CNAME'), { force: true });
} else {
  await writeFile(resolve(distDir, 'CNAME'), `${new URL(siteUrl).hostname}\n`);
}
