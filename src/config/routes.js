import deHome from '../content/de/home.js';
import hrHome from '../content/hr/home.js';
import { legalPages as deLegalPages, seoPages as deSeoPages } from '../content/de/services-and-legal.js';
import { legalPages as hrLegalPages } from '../content/hr/legal.js';
import { seoPages as hrSeoPages } from '../content/hr/services.js';

const sourcePagesByPath = Object.fromEntries(
  [
    { ...deHome, title: deHome.pageTitle, path: '/', kind: 'home' },
    { ...hrHome, title: hrHome.pageTitle, path: '/hr/', kind: 'home' },
    ...deSeoPages.map((page) => ({ ...page, language: 'de', kind: 'service' })),
    ...hrSeoPages.map((page) => ({ ...page, language: 'hr', kind: 'service' })),
    ...deLegalPages.map((page) => ({ ...page, language: 'de', kind: 'legal' })),
    ...hrLegalPages.map((page) => ({ ...page, language: 'hr', kind: 'legal' })),
  ].map((page) => [page.path, page]),
);

export const routePairDefinitions = [
  { de: '/', hr: '/hr/' },
  { de: '/buchhaltung-wien', hr: '/hr/knjigovodstvo-bec' },
  { de: '/steuerberatung-wien', hr: '/hr/porezni-savjetnik-bec' },
  { de: '/lohnverrechnung-wien', hr: '/hr/obracun-placa-bec' },
  { de: '/jahresabschluss-wien', hr: '/hr/godisnji-obracun-bec' },
  { de: '/steuerberatung-gruender-wien', hr: '/hr/porezno-savjetovanje-poduzetnici-bec' },
  { de: '/unternehmensgruendung-wien', hr: '/hr/osnivanje-tvrtke-bec' },
  { de: '/impressum', hr: '/hr/impressum' },
  { de: '/datenschutzerklaerung', hr: '/hr/pravila-privatnosti' },
];

function resolvePage(path) {
  const page = sourcePagesByPath[path];
  if (!page) throw new Error(`Route configuration references missing page content: ${path}`);
  return page;
}

export const routePairs = routePairDefinitions.map((pair) => ({
  de: resolvePage(pair.de),
  hr: resolvePage(pair.hr),
}));

export const allPages = routePairs.flatMap((pair) => [
  { ...pair.de, alternatePaths: { de: pair.de.path, hr: pair.hr.path }, counterpartPath: pair.hr.path },
  { ...pair.hr, alternatePaths: { de: pair.de.path, hr: pair.hr.path }, counterpartPath: pair.de.path },
]);

export const pagesByPath = Object.fromEntries(allPages.map((page) => [page.path, page]));

export const homeContentByLanguage = { de: deHome, hr: hrHome };

export const servicePagesByLanguage = {
  de: allPages.filter((page) => page.language === 'de' && page.kind === 'service'),
  hr: allPages.filter((page) => page.language === 'hr' && page.kind === 'service'),
};

export function getPageByPath(path) {
  return pagesByPath[path] ?? null;
}
