/* NOTE: Firmenbuch Geschäftszweig is currently registered as
   "Unternehmensberatung". Steuerberatung services are legally
   provided based on the principal's KSW credential. Consider
   updating the Firmenbuch entry to add Steuerberatung at next
   Notar appointment. Not blocking for website launch. */
import React, { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getPageByPath,
  homeContentByLanguage,
  servicePagesByLanguage,
} from './config/routes.js';
import {
  absoluteUrl,
  MAP_EXTERNAL_URL,
  OFFICE_ADDRESS,
  SITE_NAME,
  SITE_URL,
} from './config/site.js';
import { getPublicTrustFacts, verifiedBusinessFacts } from './config/verifiedBusinessFacts.js';
import Icon from './components/Icon.jsx';
import { FOCUSABLE_SELECTOR, lockBodyScroll } from './accessibility/dialog.js';
import ConsentControlledMap from './privacy/ConsentControlledMap.jsx';

const PrivacySettingsDialog = lazy(() => import('./privacy/PrivacySettingsDialog.jsx'));
const BookingModal = lazy(() => import('./components/BookingModal.jsx'));

function createIcon(name) {
  return function IconAdapter(props) {
    return <Icon name={name} {...props} />;
  };
}

const ArrowRight = createIcon('arrow-right');
const ArrowUpRight = createIcon('arrow-up-right');
const BriefcaseBusiness = createIcon('briefcase');
const CheckCircle2 = createIcon('check');
const ChevronsDown = createIcon('chevrons-down');
const Clock3 = createIcon('clock');
const FileText = createIcon('file');
const Mail = createIcon('mail');
const MapPin = createIcon('map');
const Phone = createIcon('phone');
const Plus = createIcon('plus');
const ShieldCheck = createIcon('shield');
const Smartphone = createIcon('smartphone');
const X = createIcon('x');

const iconComponents = {
  briefcase: BriefcaseBusiness,
  check: CheckCircle2,
  clock: Clock3,
  file: FileText,
  mail: Mail,
  map: MapPin,
  phone: Phone,
  shield: ShieldCheck,
  smartphone: Smartphone,
};

const languages = [
  { code: 'de', label: 'DE' },
  { code: 'hr', label: 'HR' },
];

const pageUi = {
  de: {
    book: 'Erstgespräch anfragen', contact: 'Kontakt aufnehmen', focus: 'Worum es hier geht',
    focusText: 'Unterlagen, Pflichten und Umfang werden für Ihre Situation geklärt.',
    process: 'Ablauf', faq: 'Häufige Fragen zu', faqBody: 'Antworten zu Unterlagen, Zuständigkeiten und dem möglichen Leistungsumfang.',
    next: 'Anfrage', contactDetails: 'Kontaktdaten ansehen', related: 'Im Zusammenhang relevant', home: 'Zur Startseite',
    relatedLabel: 'Sachlich verwandte Leistungen', legal: 'Rechtliches',
    provides: 'Was Sie üblicherweise bereitstellen', limits: 'Wichtige Abgrenzung',
  },
  hr: {
    book: 'Zatražite prvi razgovor', contact: 'Obratite nam se', focus: 'Svrha usluge',
    focusText: 'Dokumentacija, obveze i opseg utvrđuju se za vašu situaciju.',
    process: 'Postupak', faq: 'Česta pitanja:', faqBody: 'Odgovori o dokumentaciji, odgovornostima i mogućem opsegu usluge.',
    next: 'Upit', contactDetails: 'Pogledajte kontaktne podatke', related: 'Povezano s ovom uslugom', home: 'Na početnu stranicu',
    relatedLabel: 'Sadržajno povezane usluge', legal: 'Pravne informacije',
    provides: 'Što obično trebate dostaviti', limits: 'Važno razgraničenje',
  },
};

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

function getRouteHref(path) {
  if (path === '/') return `${basePath}/` || '/';
  return `${basePath}${path}`;
}

function normalizeRoutePath(pathname) {
  let path = pathname || '/';

  if (basePath && path === basePath) return '/';
  if (basePath && path.startsWith(`${basePath}/`)) {
    path = path.slice(basePath.length);
  }

  if (path === '/hr' || path === '/hr/') return '/hr/';
  path = path.replace(/\/+$/, '') || '/';
  return path;
}

function getCanonicalUrl(path) {
  return absoluteUrl(SITE_URL, path);
}

function setMetaContent(selector, contentValue) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement('meta');
    const nameMatch = selector.match(/meta\[name="([^"]+)"\]/);
    const propertyMatch = selector.match(/meta\[property="([^"]+)"\]/);
    if (nameMatch) element.setAttribute('name', nameMatch[1]);
    if (propertyMatch) element.setAttribute('property', propertyMatch[1]);
    document.head.appendChild(element);
  }

  element.setAttribute('content', contentValue);
}

function setCanonicalHref(url) {
  let element = document.head.querySelector('link[rel="canonical"]');

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }

  element.setAttribute('href', url);
}

function setAlternateHref(hreflang, url) {
  let element = document.head.querySelector(`link[rel="alternate"][hreflang="${hreflang}"]`);

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'alternate');
    element.setAttribute('hreflang', hreflang);
    document.head.appendChild(element);
  }

  element.setAttribute('href', url);
}

function useCurrentRoutePath() {
  const [routePath, setRoutePath] = useState(() => normalizeRoutePath(window.location.pathname));

  useEffect(() => {
    const updateRoute = () => setRoutePath(normalizeRoutePath(window.location.pathname));
    window.addEventListener('popstate', updateRoute);

    return () => window.removeEventListener('popstate', updateRoute);
  }, []);

  return routePath;
}

function resolveNavHref(href, routePath, language) {
  if (!href.startsWith('#')) return href;
  const homePath = language === 'hr' ? '/hr/' : '/';
  if (routePath === homePath || href === '#contact' || href === '#top') return href;
  return `${getRouteHref(homePath)}${href}`;
}


function RichText({ parts }) {
  return (
    <>
      {parts.map((part, index) =>
        part.em ? <em key={`${part.text}-${index}`}>{part.text}</em> : <React.Fragment key={`${part.text}-${index}`}>{part.text}</React.Fragment>,
      )}
    </>
  );
}

const germanTerms = /(Finanzamt|FinanzOnline|Arbeitnehmerveranlagung|Kleinunternehmer|Steuerberater|WTBG 2017|WT-ARL|Liebhaberei|WEG)/g;

function LocalizedText({ text, language }) {
  if (language !== 'hr' || !germanTerms.test(text)) {
    germanTerms.lastIndex = 0;
    return text;
  }

  germanTerms.lastIndex = 0;
  return text.split(germanTerms).map((part, index) =>
    index % 2 === 1 ? <span lang="de" key={`${part}-${index}`}>{part}</span> : part,
  );
}

function ScrollHighlightText({ text }) {
  const headingRef = useRef(null);
  const words = useMemo(() => text.trim().split(/\s+/), [text]);
  const [activeWordCount, setActiveWordCount] = useState(1);

  useEffect(() => {
    const heading = headingRef.current;
    if (!heading) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduceMotion.matches) {
      setActiveWordCount(words.length);
      return undefined;
    }

    let frameId = 0;

    const updateHighlight = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        const rect = heading.getBoundingClientRect();
        const start = window.innerHeight * 0.86;
        const end = window.innerHeight * 0.2;
        const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end + rect.height * 0.5)));
        setActiveWordCount(Math.max(1, Math.ceil(progress * words.length)));
      });
    };

    updateHighlight();
    window.addEventListener('scroll', updateHighlight, { passive: true });
    window.addEventListener('resize', updateHighlight);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', updateHighlight);
      window.removeEventListener('resize', updateHighlight);
    };
  }, [words.length]);

  return (
    <h2 ref={headingRef} className="value-highlight-heading reveal">
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className={`value-highlight-word ${index < activeWordCount ? 'is-active' : ''}`}
        >
          {word}
        </span>
      ))}
    </h2>
  );
}

function useScrollReveal() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll('.reveal'));

    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.16 },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);
}

function useDelayedStickyHeader() {
  const [heroCtaScrolledOut, setHeroCtaScrolledOut] = useState(false);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);

  useEffect(() => {
    const hero = document.querySelector('#top');
    const heroCta = document.querySelector('[data-hero-cta]');

    if (!hero || !heroCta) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setHeroCtaScrolledOut(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 },
    );

    observer.observe(heroCta);

    let frameId = 0;

    const updateScrollThreshold = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        const heroBottom = hero.offsetTop + hero.offsetHeight;
        setScrolledPastHero(window.scrollY >= heroBottom + 200);
      });
    };

    updateScrollThreshold();
    window.addEventListener('scroll', updateScrollThreshold, { passive: true });
    window.addEventListener('resize', updateScrollThreshold);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', updateScrollThreshold);
      window.removeEventListener('resize', updateScrollThreshold);
    };
  }, []);

  return heroCtaScrolledOut && scrolledPastHero;
}

function useMobileMenu(isEnabled) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const closeMenu = (restoreFocus = true) => {
    setIsOpen(false);
    if (restoreFocus) window.requestAnimationFrame(() => buttonRef.current?.focus());
  };

  useEffect(() => {
    if (!isEnabled && isOpen) setIsOpen(false);
  }, [isEnabled, isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const unlockBodyScroll = lockBodyScroll();
    const firstFocusable = menuRef.current?.querySelector(FOCUSABLE_SELECTOR);
    window.requestAnimationFrame(() => firstFocusable?.focus());

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      unlockBodyScroll();
    };
  }, [isOpen]);

  return { isOpen, setIsOpen, closeMenu, buttonRef, menuRef };
}

function LanguageSwitcher({ page, label }) {
  return (
    <div className="language-switcher" aria-label={label}>
      {languages.map((item) => (
        <a
          key={item.code}
          className={page.language === item.code ? 'is-active' : ''}
          href={getRouteHref(page.alternatePaths[item.code])}
          hrefLang={item.code === 'de' ? 'de-AT' : 'hr'}
          lang={item.code}
          aria-current={page.language === item.code ? 'page' : undefined}
        >
          {item.label}
        </a>
      ))}
    </div>
  );
}

function BrandLogo({ routePath, language, onClick }) {
  const homePath = language === 'hr' ? '/hr/' : '/';
  return (
    <a href={routePath === homePath ? '#top' : getRouteHref(homePath)} className="brand-logo" onClick={onClick} aria-label="MINO Consulting KG">
      <img src={`${import.meta.env.BASE_URL}mino-logo.svg`} alt="" width="344" height="143" />
    </a>
  );
}

function Header({ t, page, onBook, routePath, isInert = false }) {
  const { isOpen, setIsOpen, closeMenu, buttonRef, menuRef } = useMobileMenu(!isInert);
  const mobileMenuId = 'primary-mobile-menu';

  return (
    <header
      className="site-header relative z-50 border-b border-forest/50 bg-white"
      aria-hidden={isInert || undefined}
      inert={isInert ? true : undefined}
    >
      <nav className="section-shell header-navigation flex h-[4.5rem] items-center justify-between sm:h-[4.75rem]" aria-label={t.meta.primaryNavigationLabel}>
        <BrandLogo routePath={routePath} language={page.language} onClick={() => closeMenu(false)} />

        <div className="hidden items-center gap-8 md:flex">
          {t.nav.map((item) => (
            <a key={item.href} className="nav-link" href={resolveNavHref(item.href, routePath, page.language)}>
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher page={page} label={t.meta.languageLabel} />
          <div className="hidden sm:block">
            <button className="button-primary" type="button" onClick={onBook}>
              {t.cta.book}
            </button>
          </div>
          <button
            ref={buttonRef}
            className="hamburger-button md:hidden"
            type="button"
            aria-label={t.meta.menuLabel}
            aria-expanded={isOpen}
            aria-controls={mobileMenuId}
            onClick={() => setIsOpen((current) => !current)}
          >
            {isOpen ? (
              <X size={18} aria-hidden="true" />
            ) : (
              <span className="grid gap-1" aria-hidden="true">
                <span className="h-px w-4 bg-forest" />
                <span className="h-px w-4 bg-forest" />
                <span className="h-px w-4 bg-forest" />
              </span>
            )}
          </button>
        </div>
      </nav>

      {isOpen && (
        <nav
          ref={menuRef}
          id={mobileMenuId}
          className="mobile-menu-panel border-t border-forest/50 bg-white md:hidden"
          aria-label={t.meta.mobileNavigationLabel}
        >
          <div className="section-shell grid gap-3 py-5">
            {t.nav.map((item) => (
              <a key={item.href} className="nav-link py-2" href={resolveNavHref(item.href, routePath, page.language)} onClick={() => closeMenu(false)}>
                {item.label}
              </a>
            ))}
            <button
              className="button-primary mt-2"
              type="button"
              onClick={(event) => {
                closeMenu(false);
                onBook(event);
              }}
            >
              {t.cta.book}
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}

function DelayedStickyHeader({ t, page, onBook, isVisible, routePath }) {
  const { isOpen, setIsOpen, closeMenu, buttonRef, menuRef } = useMobileMenu(isVisible);
  const mobileMenuId = 'sticky-mobile-menu';

  return (
    <header
      className={`delayed-sticky-header ${isVisible ? 'is-visible' : ''}`}
      aria-hidden={!isVisible}
      inert={!isVisible ? true : undefined}
    >
      <nav className="section-shell header-navigation flex h-[4.5rem] items-center justify-between sm:h-16" aria-label={t.meta.stickyNavigationLabel}>
        <BrandLogo routePath={routePath} language={page.language} onClick={() => closeMenu(false)} />

        <div className="hidden items-center gap-8 md:flex">
          {t.nav.map((item) => (
            <a key={item.href} className="nav-link" href={resolveNavHref(item.href, routePath, page.language)}>
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher page={page} label={t.meta.languageLabel} />
          <div className="hidden sm:block">
            <button className="button-primary py-2.5" type="button" onClick={onBook}>
              {t.cta.book}
            </button>
          </div>
          <button
            ref={buttonRef}
            className="hamburger-button md:hidden"
            type="button"
            aria-label={t.meta.menuLabel}
            aria-expanded={isOpen}
            aria-controls={mobileMenuId}
            onClick={() => setIsOpen((current) => !current)}
          >
            {isOpen ? (
              <X size={18} aria-hidden="true" />
            ) : (
              <span className="grid gap-1" aria-hidden="true">
                <span className="h-px w-4 bg-forest" />
                <span className="h-px w-4 bg-forest" />
                <span className="h-px w-4 bg-forest" />
              </span>
            )}
          </button>
        </div>
      </nav>

      {isVisible && isOpen && (
        <nav
          ref={menuRef}
          id={mobileMenuId}
          className="mobile-menu-panel border-t border-forest/50 bg-white md:hidden"
          aria-label={t.meta.mobileNavigationLabel}
        >
          <div className="section-shell grid gap-3 py-5">
            {t.nav.map((item) => (
              <a key={item.href} className="nav-link py-2" href={resolveNavHref(item.href, routePath, page.language)} onClick={() => closeMenu(false)}>
                {item.label}
              </a>
            ))}
            <button
              className="button-primary mt-2"
              type="button"
              onClick={(event) => {
                closeMenu(false);
                onBook(event);
              }}
            >
              {t.cta.book}
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}

function getOfficePhone(t) {
  return t.contact.cards.find((item) => item.icon === 'phone')?.value ?? '';
}

function getPhoneHref(phoneNumber) {
  return `tel:${phoneNumber.replace(/[^\d+]/g, '')}`;
}

function getContactHref(item) {
  if (item.icon === 'mail') return `mailto:${item.value}`;
  if (item.icon === 'phone' || item.icon === 'smartphone') return getPhoneHref(item.value);
  return null;
}

function renderLegalItem(item, language, newWindowText) {
  const emailMatch = item.match(/office@mino-consulting\.at/);
  const officePhoneMatch = item.match(/\+43\s1\s90\s680\s200/);
  const mobilePhoneMatch = item.match(/\+43\s660\s21\s99\s444/);
  const kswMatch = item.match(/www\.ksw\.or\.at/);
  const odrMatch = item.match(/https:\/\/ec\.europa\.eu\/consumers\/odr/);
  const websiteMatch = item.match(/www\.mino-consulting\.at/);

  if (emailMatch) {
    const [before, after] = item.split(emailMatch[0]);
    return (
      <>
        {before}
        <a href={`mailto:${emailMatch[0]}`}>{emailMatch[0]}</a>
        {after}
      </>
    );
  }

  if (officePhoneMatch || mobilePhoneMatch) {
    const phone = officePhoneMatch?.[0] ?? mobilePhoneMatch[0];
    const [before, after] = item.split(phone);
    return (
      <>
        {before}
        <a href={getPhoneHref(phone)}>{phone}</a>
        {after}
      </>
    );
  }

  if (kswMatch || odrMatch || websiteMatch) {
    const matchedLink = kswMatch?.[0] ?? odrMatch?.[0] ?? websiteMatch[0];
    const href = matchedLink.startsWith('http') ? matchedLink : `https://${matchedLink}`;
    const [before, after] = item.split(matchedLink);
    const opensNewWindow = Boolean(kswMatch || odrMatch);

    return (
      <>
        <LocalizedText text={before} language={language} />
        <a
          href={href}
          target={opensNewWindow ? '_blank' : undefined}
          rel={opensNewWindow ? 'noopener noreferrer' : undefined}
          aria-label={opensNewWindow ? `${matchedLink} (${newWindowText})` : undefined}
        >
          {matchedLink}
        </a>
        <LocalizedText text={after} language={language} />
      </>
    );
  }

  return <LocalizedText text={item} language={language} />;
}

function HeroImage({ t, className = '' }) {
  return (
    <div className={className}>
      <div className="hero-image-frame">
        <img
          className="w-full rounded-t-md object-cover"
          src={`${import.meta.env.BASE_URL}images/hero/mino-office-consultation-placeholder.svg`}
          alt={t.hero.imageAlt}
          width="1400"
          height="933"
          fetchPriority="high"
          sizes="(min-width: 1024px) 46vw, 100vw"
          onError={(event) => event.currentTarget.classList.add('is-unavailable')}
        />
        <a className="scroll-badge" href="#value">
          {t.cta.scroll}
          <ChevronsDown size={15} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}

function Hero({ t, onBook }) {
  const officePhone = getOfficePhone(t);
  const phoneHref = getPhoneHref(officePhone);

  return (
    <section id="top" className="hero-section relative overflow-hidden">
      <div className="section-shell hero-layout">
        <div className="hero-copy reveal">
          <p className="hero-kicker">{t.hero.label}</p>
          <h1>
            <RichText parts={t.hero.title} />
          </h1>
          <p className="mt-4 max-w-lg text-forest/75 sm:mt-5"><LocalizedText text={t.hero.body} language={t.language} /></p>

          <div className="hero-actions reveal reveal-delay-2" data-hero-cta>
            <button className="button-primary w-full sm:w-auto" type="button" onClick={onBook}>
              {t.cta.book}
            </button>
            <a
              className="button-secondary w-full sm:w-auto"
              href={phoneHref}
              aria-label={`${t.cta.callAria}: ${officePhone}`}
            >
              {t.cta.call}
            </a>
          </div>

        </div>

        <HeroImage t={t} className="hero-visual relative reveal reveal-delay-1" />
      </div>
    </section>
  );
}

function VerifiedFactsStrip({ language }) {
  const facts = getPublicTrustFacts(language);
  if (facts.length === 0) return null;

  return (
    <section className="verified-facts-section" aria-label={language === 'hr' ? 'Provjereni podaci' : 'Verifizierte Angaben'}>
      <dl className="section-shell verified-facts-list">
        {facts.map((fact) => (
          <div key={fact.label} className="verified-fact">
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function ValueProposition({ t }) {
  return (
    <section id="value" className="section-spacious value-section section-surface-light relative">
      <div className="section-shell value-section-shell">
        <ScrollHighlightText text={t.value.statement} />

        <div className="value-feature-grid">
          {t.value.features.map((item, index) => {
            const Icon = iconComponents[item.icon];
            return (
              <article key={item.text} className={`feature-item reveal reveal-delay-${Math.min(index, 2)}`}>
                <span className="feature-icon">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <p><LocalizedText text={item.text} language={t.language} /></p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Services({ t, language }) {
  const servicesListRef = useRef(null);
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);

  useEffect(() => {
    const list = servicesListRef.current;
    if (!list) return undefined;
    const motionQuery = window.matchMedia('(min-width: 1024px) and (prefers-reduced-motion: no-preference)');
    let observer;

    const observeServices = () => {
      observer?.disconnect();
      if (!motionQuery.matches || !('IntersectionObserver' in window)) {
        setActiveServiceIndex(0);
        return;
      }

      const ratios = new Map();
      const items = Array.from(list.querySelectorAll('.service-editorial-item'));
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => ratios.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0));
        let nextIndex = 0;
        let highestRatio = 0;
        items.forEach((item, index) => {
          const ratio = ratios.get(item) ?? 0;
          if (ratio > highestRatio) {
            highestRatio = ratio;
            nextIndex = index;
          }
        });
        setActiveServiceIndex((currentIndex) => (currentIndex === nextIndex ? currentIndex : nextIndex));
      }, { rootMargin: '-18% 0px -34% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] });

      items.forEach((item) => observer.observe(item));
    };

    observeServices();
    motionQuery.addEventListener?.('change', observeServices);

    return () => {
      observer?.disconnect();
      motionQuery.removeEventListener?.('change', observeServices);
    };
  }, [t.services.length]);

  return (
    <section id="services" className="services-editorial-section section-surface-warm">
      <div className="section-shell services-editorial-shell">
        <div className="services-editorial-intro reveal">
          <h2>
            <RichText parts={t.servicesIntro.title} />
          </h2>
        </div>

        <div className="services-intro-rule reveal" aria-hidden="true" />

        <p className="services-editorial-lede reveal">
          {t.servicesIntro.body}
        </p>

        <div
          className="services-editorial-list"
          ref={servicesListRef}
          style={{ '--service-index': activeServiceIndex }}
        >
          <div className="service-number-rail" aria-hidden="true">
            <div className="service-number-sticky">
              <div className="service-number-stack">
                {t.services.map((service, index) => (
                  <span key={service.id}>{String(index + 1).padStart(2, '0')}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="service-editorial-items">
            {t.services.map((service, index) => {
              const serviceHref = getRouteHref(service.path);

              return (
                <article
                  key={service.id}
                  className="service-editorial-item reveal"
                  data-active={activeServiceIndex === index ? 'true' : 'false'}
                >
                  <div className="service-editorial-content">
                    <small className="service-editorial-label">{service.subtitle}</small>
                    <div className="service-editorial-heading-row">
                      <span className="service-editorial-mobile-number" aria-hidden="true">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <h3>
                        <RichText parts={service.title} />
                      </h3>
                    </div>
                    <p><LocalizedText text={service.body} language={language} /></p>

                    <a
                      className="service-editorial-link"
                      href={serviceHref}
                      aria-label={`${t.cta.learnMore}: ${service.title.map((part) => part.text).join('')}`}
                    >
                      {t.cta.learnMore}: {service.title.map((part) => part.text).join('')}
                      <ArrowRight size={17} aria-hidden="true" />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <nav className="service-page-nav reveal" aria-label={t.localServices.label}>
          <div className="service-page-nav-heading">
            <h3>{t.localServices.title}</h3>
            <p>{t.localServices.body}</p>
          </div>
          <small>{t.localServices.label}</small>
          <div className="service-page-link-grid">
            {servicePagesByLanguage[language].map((page) => (
              <a key={page.path} className="service-page-link" href={getRouteHref(page.path)}>
                {page.eyebrow}
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            ))}
          </div>
        </nav>
      </div>
    </section>
  );
}

function WorkingProcess({ t }) {
  if (!t.process?.steps?.length) return null;

  return (
    <section className="section-spacious section-surface-light">
      <div className="section-shell">
        <div className="max-w-3xl reveal">
          <small>{t.process.label}</small>
          <h2 className="mt-4">{t.process.title}</h2>
          <p className="mt-5 text-forest/70">{t.process.body}</p>
        </div>
        <ol className="seo-process-list">
          {t.process.steps.map((step, index) => (
            <li key={step.title} className="seo-process-item reveal">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function ClientFitSection({ t }) {
  if (!t.clientFit?.cards?.length) return null;

  return (
    <section className="section-spacious section-surface-cream">
      <div className="section-shell">
        <div className="mx-auto max-w-3xl text-center reveal">
          <h2>{t.clientFit.title}</h2>
          <p className="mt-4">{t.clientFit.body}</p>
        </div>

        <div className="specialization-grid reveal reveal-delay-1">
          {t.clientFit.cards.map((card) => (
            <article className="specialization-card" key={card.title}>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function About({ t }) {
  return (
    <section id="about" className="section-spacious section-surface-light">
      <div className="section-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="founder-placeholder reveal">
          <img
            src={`${import.meta.env.BASE_URL}images/team/tomislav-siketic-placeholder.svg`}
            alt=""
            width="1100"
            height="1375"
            loading="lazy"
            decoding="async"
            sizes="(min-width: 1024px) 40vw, 100vw"
            onError={(event) => event.currentTarget.classList.add('is-unavailable')}
          />
        </div>

        <div className="reveal reveal-delay-1">
          <small className="tag-pill">
            <ShieldCheck size={14} aria-hidden="true" />
            {t.about.badge}
          </small>
          <h2 className="mt-5">
            <RichText parts={t.about.title} />
          </h2>
          <div className="principal-block">
            <p className="principal-name">{t.about.principalName}</p>
            <p className="principal-role">{t.about.principalRole}</p>
            <p className="principal-registration">{t.about.principalRegistration}</p>
          </div>
          <div className="mt-6 space-y-5 text-forest/75">
            {t.about.paragraphs.map((paragraph) => (
              <p key={paragraph}><LocalizedText text={paragraph} language={t.language} /></p>
            ))}
          </div>
          <a className="about-legal-link" href={getRouteHref(t.language === 'hr' ? '/hr/impressum' : '/impressum')}>
            {t.about.legalLinkLabel}
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

function FaqAccordion({ items, language, idPrefix = 'faq' }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="faq-list reveal reveal-delay-1">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `${idPrefix}-panel-${index}`;
        const triggerId = `${idPrefix}-trigger-${index}`;

        return (
          <article key={item.question} className="faq-item" data-open={isOpen ? 'true' : 'false'}>
            <h3 id={triggerId}>
              <button
                className="faq-trigger"
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex((currentIndex) => (currentIndex === index ? null : index))}
              >
                <span className="faq-question"><LocalizedText text={item.question} language={language} /></span>
                <span className="faq-icon" aria-hidden="true">
                  <Plus size={18} />
                </span>
              </button>
            </h3>

            <div
              id={panelId}
              className="faq-panel"
              data-open={isOpen ? 'true' : 'false'}
              aria-hidden={!isOpen}
              aria-labelledby={triggerId}
              role="region"
              inert={!isOpen ? true : undefined}
            >
              <div className="faq-panel-inner">
                <p><LocalizedText text={item.answer} language={language} /></p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function FaqSection({ t }) {
  return (
      <section id="faq" className="section-spacious section-surface-cream">
        <div className="section-shell faq-layout">
          <div className="faq-intro reveal">
            <h2>
              <RichText parts={t.faq.title} />
            </h2>
            <p className="mt-5 text-forest/70">{t.faq.body}</p>
          </div>

          <FaqAccordion items={t.faq.items} language={t.language} idPrefix="home-faq" />
        </div>
      </section>
  );
}

function SeoLandingPage({ page, onBook }) {
  const relatedPages = page.related.map((path) => getPageByPath(path)).filter(Boolean);
  const ui = pageUi[page.language];
  const homePath = page.language === 'hr' ? '/hr/' : '/';

  return (
    <>
      <section id="top" className="seo-hero-section section-surface-warm">
        <div className="section-shell seo-hero-layout">
          <div className="reveal">
            <small className="tag-pill">
              <MapPin size={14} aria-hidden="true" />
              {page.eyebrow}
            </small>
            <h1 className="mt-5">{page.h1}</h1>
            <p className="mt-5 max-w-2xl text-forest/75"><LocalizedText text={page.intro} language={page.language} /></p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row" data-hero-cta>
              <button className="button-primary" type="button" onClick={onBook}>
                {ui.book}
                <ArrowRight size={16} aria-hidden="true" />
              </button>
              <a className="button-secondary" href="#contact">
                {ui.contact}
              </a>
            </div>
          </div>

          <aside className="seo-hero-note reveal reveal-delay-1" aria-label={ui.focus}>
            <small>{ui.focus}</small>
            <p>{ui.focusText}</p>
          </aside>
        </div>
      </section>

      <section className="section-spacious section-surface-light">
        <div className="section-shell seo-two-column">
          <article className="seo-info-block reveal">
            <small>{page.whoForTitle}</small>
            <ul className="seo-check-list">
              {page.whoFor.map((item) => (
                <li key={item}><LocalizedText text={item} language={page.language} /></li>
              ))}
            </ul>
          </article>

          <article className="seo-info-block reveal reveal-delay-1">
            <small>{page.includedTitle}</small>
            <ul className="seo-check-list">
              {page.included.map((item) => (
                <li key={item}><LocalizedText text={item} language={page.language} /></li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      {(page.clientProvides?.length || page.limitations?.length) && (
        <section className="section-spacious section-surface-warm">
          <div className="section-shell seo-two-column">
            {page.clientProvides?.length > 0 && (
              <article className="seo-info-block reveal">
                <small>{page.clientProvidesTitle ?? ui.provides}</small>
                <ul className="seo-check-list">
                  {page.clientProvides.map((item) => (
                    <li key={item}><LocalizedText text={item} language={page.language} /></li>
                  ))}
                </ul>
              </article>
            )}
            {page.limitations?.length > 0 && (
              <article className="seo-info-block reveal reveal-delay-1">
                <small>{page.limitationsTitle ?? ui.limits}</small>
                <ul className="seo-check-list">
                  {page.limitations.map((item) => (
                    <li key={item}><LocalizedText text={item} language={page.language} /></li>
                  ))}
                </ul>
              </article>
            )}
          </div>
        </section>
      )}

      <section className="section-spacious section-surface-cream">
        <div className="section-shell">
          <div className="max-w-3xl reveal">
            <small>{ui.process}</small>
            <h2 className="mt-4">{page.processTitle}</h2>
          </div>

          <ol className="seo-process-list">
            {page.process.map((step, index) => (
              <li key={step.title} className="seo-process-item reveal">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p><LocalizedText text={step.body} language={page.language} /></p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section-spacious section-surface-light">
        <div className="section-shell faq-layout">
          <div className="faq-intro reveal">
            <small>FAQ</small>
            <h2 className="mt-4">{ui.faq} {page.eyebrow}</h2>
            <p className="mt-5 text-forest/70">{ui.faqBody}</p>
          </div>

          <FaqAccordion items={page.faq} language={page.language} idPrefix={`seo-${page.path.slice(1).replaceAll('/', '-')}`} />
        </div>
      </section>

      <section className="section-spacious section-surface-warm">
        <div className="section-shell">
          <div className="seo-cta-panel reveal">
            <div>
              <small>{ui.next}</small>
              <h2 className="mt-4">{page.ctaTitle}</h2>
              <p className="mt-5 text-forest/75"><LocalizedText text={page.ctaBody} language={page.language} /></p>
            </div>
            <div className="seo-cta-actions">
              <button className="button-primary" type="button" onClick={onBook}>
                {ui.book}
                <ArrowRight size={16} aria-hidden="true" />
              </button>
              <a className="button-secondary" href="#contact">
                {ui.contactDetails}
              </a>
            </div>
          </div>

          <nav className="seo-related-links reveal" aria-label={ui.relatedLabel}>
            <small>{ui.related}</small>
            <div className="seo-related-grid">
              <a className="seo-related-link" href={getRouteHref(homePath)}>
                {ui.home}
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
              {relatedPages.map((relatedPage) => (
                <a key={relatedPage.path} className="seo-related-link" href={getRouteHref(relatedPage.path)}>
                  {relatedPage.relatedLinkLabel ?? relatedPage.eyebrow}
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              ))}
            </div>
          </nav>
        </div>
      </section>
    </>
  );
}

function LegalPage({ page, onPrivacySettings }) {
  const ui = pageUi[page.language];
  const isPrivacyPage = page.path.endsWith('datenschutzerklaerung') || page.path.endsWith('pravila-privatnosti');
  const privacyContent = homeContentByLanguage[page.language].privacySettings;
  return (
    <section id="top" className="section-spacious section-surface-light">
      <div className="section-shell legal-page">
        <div className={`max-w-3xl ${isPrivacyPage ? '' : 'reveal'}`}>
          <small className="tag-pill">{ui.legal}</small>
          <h1 className="mt-5">{page.h1}</h1>
          <p className="mt-5 text-forest/70"><LocalizedText text={page.intro} language={page.language} /></p>
          {isPrivacyPage && (
            <button className="button-secondary legal-privacy-settings-button" type="button" onClick={onPrivacySettings}>
              {privacyContent.button}
            </button>
          )}
        </div>

        {isPrivacyPage && (
          <nav className="privacy-table-of-contents" aria-label={page.tableOfContentsLabel}>
            <h2>{page.tableOfContentsTitle}</h2>
            <ol>
              {page.sections.map((section, index) => (
                <li key={section.title}><a href={`#privacy-section-${index + 1}`}>{section.title}</a></li>
              ))}
            </ol>
          </nav>
        )}

        <div className={`legal-section-grid ${isPrivacyPage ? '' : 'reveal reveal-delay-1'}`}>
          {page.sections.map((section, index) => {
            const sectionId = isPrivacyPage
              ? `privacy-section-${index + 1}`
              : `legal-${section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

            return (
              <section className="legal-section" key={section.title} aria-labelledby={sectionId}>
                <h2 id={sectionId}>{section.title}</h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph}>{renderLegalItem(paragraph, page.language, homeContentByLanguage[page.language].meta.newWindow)}</p>
                ))}
                {section.items && (
                  <ul>
                    {section.items.map((item) => (
                      <li key={item}>{renderLegalItem(item, page.language, homeContentByLanguage[page.language].meta.newWindow)}</li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Contact({ t, onBook, onPrivacySettings, routePath }) {
  const contactDetails = t.contact.cards.filter((item) => item.icon !== 'calendar');

  return (
    <footer id="contact" className="footer-spacious footer-contact bg-forest text-white">
      <div className="section-shell">
        <div className="footer-contact-top">
          <div className="reveal">
            <div className="footer-accent-line" aria-hidden="true" />
            <h2 className="mt-6 text-white">
              <RichText parts={t.contact.title} />
            </h2>
            <p className="footer-contact-copy mt-6">{t.contact.body}</p>
            <p className="footer-contact-copy mt-3">{t.contact.reassurance}</p>
            <button
              className="footer-cta-button mt-9"
              type="button"
              onClick={onBook}
            >
              {t.contact.button}
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </div>

          <div className="footer-contact-list reveal reveal-delay-1">
            {contactDetails.map((item) => {
              const Icon = iconComponents[item.icon];
              const href = getContactHref(item);
              return (
                <div key={item.label} className="footer-contact-item">
                  <Icon size={21} aria-hidden="true" />
                  <div>
                    <small>{item.label}</small>
                    <p>
                      {href ? (
                        <a href={href}>{item.value}</a>
                      ) : (
                        item.value
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="map-panel footer-map-panel reveal">
          <div className="footer-map-meta">
            <div>
              <small className="text-white/50">{t.contact.mapTitle}</small>
              <p className="mt-2 text-white">{t.contact.mapAddress}</p>
            </div>
            <a
              className="inline-flex items-center gap-2 text-sm font-bold text-taupe transition hover:text-white"
              href={MAP_EXTERNAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t.contact.mapLink} (${t.meta.newWindow})`}
            >
              {t.contact.mapLink}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
          <ConsentControlledMap content={t.mapConsent} />
        </div>

        <div className="footer-bottom-bar">
          <p>
            © {new Date().getFullYear()} {verifiedBusinessFacts.companyName} · {OFFICE_ADDRESS} · {verifiedBusinessFacts.commercialRegisterNumber} ({verifiedBusinessFacts.commercialRegisterCourt})
          </p>
          <div className="footer-bottom-links">
            {t.nav.map((item) => (
              <a className="hover:text-white" href={resolveNavHref(item.href, routePath, t.language)} key={item.href}>
                {item.label}
              </a>
            ))}
            <a className="hover:text-white" href={getRouteHref(t.language === 'hr' ? '/hr/impressum' : '/impressum')}>
              {t.contact.legalLinks.imprint}
            </a>
            <a className="hover:text-white" href={getRouteHref(t.language === 'hr' ? '/hr/pravila-privatnosti' : '/datenschutzerklaerung')}>
              {t.contact.legalLinks.privacy}
            </a>
            <button className="footer-privacy-settings" type="button" onClick={onPrivacySettings}>
              {t.privacySettings.button}
            </button>
            <a className="hover:text-white" href="#top">
              {t.contact.backTop}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}


export default function App() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [privacySettingsOpen, setPrivacySettingsOpen] = useState(false);
  const bookingOpenerRef = useRef(null);
  const privacySettingsOpenerRef = useRef(null);
  const routePath = useCurrentRoutePath();
  const page = getPageByPath(routePath) ?? getPageByPath('/');
  const t = homeContentByLanguage[page.language];
  const showDelayedStickyHeader = useDelayedStickyHeader();

  const openBooking = useCallback((event) => {
    bookingOpenerRef.current = event?.currentTarget ?? document.activeElement;
    setPrivacySettingsOpen(false);
    setBookingOpen(true);
  }, []);

  const closeBooking = useCallback(() => {
    setBookingOpen(false);
    window.requestAnimationFrame(() => bookingOpenerRef.current?.focus());
  }, []);

  const openPrivacySettings = useCallback((event) => {
    privacySettingsOpenerRef.current = event?.currentTarget ?? document.activeElement;
    setBookingOpen(false);
    setPrivacySettingsOpen(true);
  }, []);

  const closePrivacySettings = useCallback(() => {
    setPrivacySettingsOpen(false);
    window.requestAnimationFrame(() => privacySettingsOpenerRef.current?.focus());
  }, []);

  const modalOpen = bookingOpen || privacySettingsOpen;

  useScrollReveal();

  useEffect(() => {
    const locale = page.language === 'de' ? 'de_AT' : 'hr_HR';
    document.documentElement.lang = page.language;
    document.title = page.title ?? page.pageTitle;
    setMetaContent('meta[name="description"]', page.metaDescription);
    setMetaContent('meta[name="robots"]', 'index, follow');
    setMetaContent('meta[property="og:title"]', page.title ?? page.pageTitle);
    setMetaContent('meta[property="og:description"]', page.metaDescription);
    setMetaContent('meta[property="og:type"]', 'website');
    setMetaContent('meta[property="og:url"]', getCanonicalUrl(page.path));
    setMetaContent('meta[property="og:site_name"]', SITE_NAME);
    setMetaContent('meta[property="og:locale"]', locale);
    setMetaContent('meta[name="twitter:card"]', 'summary_large_image');
    setMetaContent('meta[name="twitter:title"]', page.title ?? page.pageTitle);
    setMetaContent('meta[name="twitter:description"]', page.metaDescription);
    setCanonicalHref(getCanonicalUrl(page.path));
    setAlternateHref('de-AT', getCanonicalUrl(page.alternatePaths.de));
    setAlternateHref('hr', getCanonicalUrl(page.alternatePaths.hr));
    setAlternateHref('x-default', getCanonicalUrl(page.alternatePaths.de));
  }, [page]);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-cream text-forest">
      <div className="architect-grid" aria-hidden="true" />
      <div
        className="relative z-10"
        aria-hidden={modalOpen || undefined}
        inert={modalOpen ? true : undefined}
      >
        <a className="skip-link" href="#main-content">{t.meta.skipLink}</a>
        <Header
          t={t}
          page={page}
          onBook={openBooking}
          routePath={routePath}
          isInert={showDelayedStickyHeader}
        />
        <DelayedStickyHeader
          t={t}
          page={page}
          onBook={openBooking}
          isVisible={showDelayedStickyHeader}
          routePath={routePath}
        />
        <main id="main-content" tabIndex="-1">
          {page.kind === 'legal' ? (
            <LegalPage page={page} onPrivacySettings={openPrivacySettings} />
          ) : page.kind === 'service' ? (
            <SeoLandingPage page={page} onBook={openBooking} />
          ) : (
            <>
              <Hero t={t} onBook={openBooking} />
              <VerifiedFactsStrip language={page.language} />
              <ValueProposition t={t} />
              <Services t={t} language={page.language} />
              <WorkingProcess t={t} />
              <ClientFitSection t={t} />
              <About t={t} />
              <FaqSection t={t} />
            </>
          )}
        </main>
        <Contact t={t} onBook={openBooking} onPrivacySettings={openPrivacySettings} routePath={routePath} />
      </div>
      {bookingOpen && (
        <Suspense fallback={null}>
          <BookingModal t={t} language={page.language} isOpen={bookingOpen} onClose={closeBooking} />
        </Suspense>
      )}
      {privacySettingsOpen && (
        <Suspense fallback={null}>
          <PrivacySettingsDialog
            content={t.privacySettings}
            isOpen={privacySettingsOpen}
            onClose={closePrivacySettings}
          />
        </Suspense>
      )}
    </div>
  );
}
