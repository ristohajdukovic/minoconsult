import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { legalPages, seoPages } from '../src/seoPages.js';

const distDir = resolve('dist');
const indexFile = resolve(distDir, 'index.html');
const siteUrl = 'https://ristohajdukovic.github.io/minoconsult';
const homePage = {
  path: '/',
  title: 'MINO Consulting KG | Steuerberatung und Buchhaltung in Wien',
  metaDescription:
    'MINO Consulting KG bietet Buchhaltung, Lohnverrechnung, Steuerberatung, Auswertungen und Unternehmensberatung in Wien.',
};

function escapeHtml(value) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character],
  );
}

function canonicalUrl(path) {
  return `${siteUrl}${path === '/' ? '/' : path}`;
}

function upsertMetaName(html, name, content) {
  const tag = `<meta name="${name}" content="${escapeHtml(content)}" />`;
  const pattern = new RegExp(`<meta\\s+name="${name}"[\\s\\S]*?>`, 'i');

  if (pattern.test(html)) {
    return html.replace(pattern, tag);
  }

  return html.replace(/<\/head>/i, `    ${tag}\n  </head>`);
}

function upsertMetaProperty(html, property, content) {
  const tag = `<meta property="${property}" content="${escapeHtml(content)}" />`;
  const pattern = new RegExp(`<meta\\s+property="${property}"[\\s\\S]*?>`, 'i');

  if (pattern.test(html)) {
    return html.replace(pattern, tag);
  }

  return html.replace(/<\/head>/i, `    ${tag}\n  </head>`);
}

function upsertCanonical(html, href) {
  const tag = `<link rel="canonical" href="${escapeHtml(href)}" />`;
  const pattern = /<link\s+rel="canonical"[\s\S]*?>/i;

  if (pattern.test(html)) {
    return html.replace(pattern, tag);
  }

  return html.replace(/<\/head>/i, `    ${tag}\n  </head>`);
}

function applyPageMetadata(html, page) {
  const canonical = canonicalUrl(page.path);
  let output = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(page.title)}</title>`);

  output = upsertMetaName(output, 'description', page.metaDescription);
  output = upsertMetaProperty(output, 'og:title', page.title);
  output = upsertMetaProperty(output, 'og:description', page.metaDescription);
  output = upsertMetaProperty(output, 'og:type', 'website');
  output = upsertMetaProperty(output, 'og:url', canonical);
  output = upsertCanonical(output, canonical);

  return output;
}

const baseHtml = await readFile(indexFile, 'utf8');
await writeFile(indexFile, applyPageMetadata(baseHtml, homePage));

await Promise.all(
  [...seoPages, ...legalPages].map(async (page) => {
    const routeDir = resolve(distDir, page.path.replace(/^\//, ''));
    await mkdir(routeDir, { recursive: true });
    await writeFile(resolve(routeDir, 'index.html'), applyPageMetadata(baseHtml, page));
  }),
);
