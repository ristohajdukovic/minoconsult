import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { allPages, homeContentByLanguage, routePairs } from '../src/config/routes.js';

const distDir = resolve('dist');
const routePaths = new Set(allPages.map((page) => page.path));
const inboundRoutes = new Set();
const failures = [];
const deploymentBase = '/minoconsult';

function routeFile(path) {
  return path === '/' ? resolve(distDir, 'index.html') : resolve(distDir, path.replace(/^\//, ''), 'index.html');
}

function normalizePath(href) {
  let pathname = href.split('#')[0].split('?')[0] || '/';
  if (pathname === deploymentBase || pathname === `${deploymentBase}/`) pathname = '/';
  else if (pathname.startsWith(`${deploymentBase}/`)) pathname = pathname.slice(deploymentBase.length);
  const normalized = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  return normalized === '/hr' ? '/hr/' : normalized;
}

for (const pair of routePairs) {
  if (!pair.de || !pair.hr) failures.push('A route pair is missing a language counterpart.');
}

for (const language of ['de', 'hr']) {
  const home = homeContentByLanguage[language];
  for (const service of home.services) {
    if (!routePaths.has(service.path)) failures.push(`${language} homepage service link is missing: ${service.path}`);
    if (language === 'hr' !== service.path.startsWith('/hr/')) failures.push(`${language} homepage points to the wrong language: ${service.path}`);
  }
  for (const item of home.nav.filter((item) => item.href.startsWith('#'))) {
    if (!['#services', '#about', '#contact'].includes(item.href)) failures.push(`${language} navigation has an unsupported hash link: ${item.href}`);
  }
}

for (const page of allPages) {
  let html;
  try {
    html = await readFile(routeFile(page.path), 'utf8');
  } catch {
    failures.push(`${page.path}: output file is missing`);
    continue;
  }

  for (const match of html.matchAll(/<a\b[^>]*href="([^"]+)"/gi)) {
    const href = match[1];
    if (/^(?:mailto:|tel:|https?:\/\/)/i.test(href)) {
      if (/ristohajdukovic\.github\.io/i.test(href)) failures.push(`${page.path}: link points to the preview domain`);
      continue;
    }
    if (href.startsWith('#')) continue;
    const targetPath = normalizePath(href);
    if (!routePaths.has(targetPath)) failures.push(`${page.path}: local link does not resolve: ${href}`);
    else inboundRoutes.add(targetPath);
  }

  for (const relatedPath of page.related ?? []) {
    const relatedPage = allPages.find((candidate) => candidate.path === relatedPath);
    if (!relatedPage) failures.push(`${page.path}: related route does not exist: ${relatedPath}`);
    else if (relatedPage.language !== page.language) failures.push(`${page.path}: related route switches language: ${relatedPath}`);
  }
}

inboundRoutes.add('/');
inboundRoutes.add('/hr/');
for (const page of allPages) {
  if (!inboundRoutes.has(page.path)) failures.push(`${page.path}: indexable route is orphaned`);
}

for (const path of ['/impressum', '/datenschutzerklaerung', '/hr/impressum', '/hr/pravila-privatnosti']) {
  if (!routePaths.has(path)) failures.push(`Footer legal route is missing: ${path}`);
}

if (failures.length) {
  console.error(`Internal-link validation failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Validated internal links, language boundaries, counterparts, related pages and inbound paths for ${allPages.length} routes.`);
