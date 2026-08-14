/* NOTE: Firmenbuch Geschäftszweig is currently registered as
   "Unternehmensberatung". Steuerberatung services are legally
   provided based on the principal's KSW credential. Consider
   updating the Firmenbuch entry to add Steuerberatung at next
   Notar appointment. Not blocking for website launch. */
import React, { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  getPageByPath,
  homeContentByLanguage,
  servicePagesByLanguage,
} from './config/routes.js';
import {
  absoluteUrl,
  MAP_EXTERNAL_URL,
  OFFICE_ADDRESS,
  SOCIAL_IMAGE_PATH,
  SITE_NAME,
  SITE_URL,
} from './config/site.js';
import {
  getApprovedAdviserBiography,
  getApprovedImage,
  getApprovedProfessionalRegistration,
  getApprovedTargetClientCopy,
} from './config/customerContent.js';
import { getCredentialFacts, getPublicTrustFacts, verifiedBusinessFacts } from './config/verifiedBusinessFacts.js';
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

function removeMeta(selector) {
  document.head.querySelector(selector)?.remove();
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

function SectionHeading({ as: Tag = 'h2', lead, emphasis, className }) {
  return (
    <Tag className={className}>
      {lead}
      <em>{emphasis}</em>
    </Tag>
  );
}

function ImageSlot({ src, alt, width, height, className = '', ...imgProps }) {
  if (!src) {
    return <div className={`image-slot image-slot-placeholder ${className}`} aria-hidden="true" />;
  }

  return (
    <img
      className={`image-slot ${className}`}
      src={src}
      alt={alt}
      width={width}
      height={height}
      {...imgProps}
    />
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

function useScrollReveal() {
  useLayoutEffect(() => {
    const elements = Array.from(document.querySelectorAll('.reveal'));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return undefined;
    }

    let observer;

    try {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.01 },
      );
    } catch {
      elements.forEach((element) => element.classList.add('is-visible'));
      return undefined;
    }

    try {
      elements.forEach((element) => observer.observe(element));
    } catch {
      observer.disconnect();
      elements.forEach((element) => element.classList.add('is-visible'));
      return undefined;
    }

    document.documentElement.classList.add('reveal-enhanced');
    const visibilityFallback = window.setTimeout(() => {
      elements.forEach((element) => element.classList.add('is-visible'));
    }, 1500);

    return () => {
      window.clearTimeout(visibilityFallback);
      observer.disconnect();
      document.documentElement.classList.remove('reveal-enhanced');
    };
  }, []);
}

function useHeaderFocusHandoff(stickyVisible) {
  const lastHeaderFocus = useRef(null);
  const previousStickyVisible = useRef(stickyVisible);

  useEffect(() => {
    const rememberHeaderFocus = (event) => {
      if (!(event.target instanceof HTMLElement)) return;
      const header = event.target.closest('.site-header, .delayed-sticky-header');
      if (!header) return;

      lastHeaderFocus.current = {
        element: event.target,
        headerKind: header.classList.contains('delayed-sticky-header') ? 'sticky' : 'primary',
        wasInMobileMenu: Boolean(event.target.closest('.mobile-menu-panel')),
      };
    };

    document.addEventListener('focusin', rememberHeaderFocus);
    return () => document.removeEventListener('focusin', rememberHeaderFocus);
  }, []);

  useLayoutEffect(() => {
    if (previousStickyVisible.current === stickyVisible) return;
    previousStickyVisible.current = stickyVisible;

    const previous = lastHeaderFocus.current;
    const sourceKind = stickyVisible ? 'primary' : 'sticky';
    if (!previous || previous.headerKind !== sourceKind) return;

    const sourceHeader = previous.element.closest('.site-header, .delayed-sticky-header');
    const activeElement = document.activeElement;
    if (activeElement !== previous.element && activeElement !== document.body && !sourceHeader?.contains(activeElement)) return;

    const targetHeader = document.querySelector(stickyVisible ? '.delayed-sticky-header' : '.site-header');
    if (!targetHeader) return;

    let target;
    if (previous.wasInMobileMenu || previous.element.matches('.hamburger-button')) {
      target = targetHeader.querySelector('.hamburger-button');
    } else if (previous.element.matches('.language-switcher a')) {
      target = targetHeader.querySelector(`.language-switcher a[lang="${previous.element.lang}"]`);
    } else if (previous.element.matches('.brand-logo')) {
      target = targetHeader.querySelector('.brand-logo');
    } else if (previous.element.matches('[data-booking-trigger]')) {
      target = targetHeader.querySelector('[data-booking-trigger]');
    } else if (previous.element.matches('a[href]')) {
      const href = previous.element.getAttribute('href');
      target = Array.from(targetHeader.querySelectorAll('a[href]')).find((link) => link.getAttribute('href') === href);
    }

    target?.focus({ preventScroll: true });
  }, [stickyVisible]);
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
      <img src={`${import.meta.env.BASE_URL}brand/mino-logo.svg`} alt="" width="344" height="143" />
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
      <nav className="section-shell header-navigation flex items-center justify-between" aria-label={t.meta.primaryNavigationLabel}>
        <BrandLogo routePath={routePath} language={page.language} onClick={() => closeMenu(false)} />

        <div className="desktop-nav hidden items-center lg:flex">
          {t.nav.map((item) => (
            <a key={item.href} className="nav-link" href={resolveNavHref(item.href, routePath, page.language)}>
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher page={page} label={t.meta.languageLabel} />
          <div className="hidden sm:block">
            <button className="button-primary" type="button" onClick={onBook} data-booking-trigger="header">
              {t.cta.book}
            </button>
          </div>
          <button className="button-primary mobile-cta-pill sm:hidden" type="button" onClick={onBook} data-booking-trigger="header-mobile">
            {t.cta.mobileBook}
          </button>
          <button
            ref={buttonRef}
            className="hamburger-button lg:hidden"
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
          className="mobile-menu-panel border-t border-forest/50 bg-white lg:hidden"
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
      <nav className="section-shell header-navigation flex items-center justify-between" aria-label={t.meta.stickyNavigationLabel}>
        <BrandLogo routePath={routePath} language={page.language} onClick={() => closeMenu(false)} />

        <div className="desktop-nav hidden items-center lg:flex">
          {t.nav.map((item) => (
            <a key={item.href} className="nav-link" href={resolveNavHref(item.href, routePath, page.language)}>
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher page={page} label={t.meta.languageLabel} />
          <div className="hidden sm:block">
            <button className="button-primary py-2.5" type="button" onClick={onBook} data-booking-trigger="sticky-header">
              {t.cta.book}
            </button>
          </div>
          <button className="button-primary mobile-cta-pill sm:hidden" type="button" onClick={onBook} data-booking-trigger="sticky-header-mobile">
            {t.cta.mobileBook}
          </button>
          <button
            ref={buttonRef}
            className="hamburger-button lg:hidden"
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
          className="mobile-menu-panel border-t border-forest/50 bg-white lg:hidden"
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

function HeroVisual({ t, className = '' }) {
  const approvedHeroImage = getApprovedImage('heroImage', t.language);
  const [imageUnavailable, setImageUnavailable] = useState(false);
  const hasApprovedHeroImage = Boolean(approvedHeroImage && !imageUnavailable);

  useEffect(() => setImageUnavailable(false), [approvedHeroImage?.path]);

  return (
    <div className={className}>
      <ImageSlot
        className="hero-visual-slot"
        src={hasApprovedHeroImage ? `${import.meta.env.BASE_URL}${approvedHeroImage.path.replace(/^\//, '')}` : null}
        alt={hasApprovedHeroImage ? approvedHeroImage.alt : ''}
        width={approvedHeroImage?.width}
        height={approvedHeroImage?.height}
        fetchPriority="high"
        sizes="(min-width: 1024px) 46vw, 100vw"
        onError={() => setImageUnavailable(true)}
      />
    </div>
  );
}

function Hero({ t, onBook }) {
  const officePhone = getOfficePhone(t);
  const phoneHref = getPhoneHref(officePhone);

  return (
    <section id="top" className="hero-section relative overflow-hidden">
      <div className="section-shell hero-layout">
        <div className="hero-copy">
          <p className="hero-eyebrow">{t.hero.eyebrow}</p>
          <h1>{t.hero.title}</h1>
          <p className="mt-4 max-w-lg text-forest/75 sm:mt-5"><LocalizedText text={t.hero.body} language={t.language} /></p>

          <div className="hero-actions" data-hero-cta>
            <button className="button-primary w-full sm:w-auto" type="button" onClick={onBook} data-booking-trigger="home-hero">
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

          {/* TODO: remove this note once the hosted-form migration lands and appointment booking no longer relies on a locally prepared email. */}
          <p className="hero-note">{t.hero.note}</p>
        </div>

        <HeroVisual t={t} className="hero-visual relative" />
      </div>
    </section>
  );
}

const CREDENTIAL_MARQUEE_PX_PER_SECOND = 60;
const CREDENTIAL_MARQUEE_MIN_SECONDS = 14;

function CredentialMarqueeRow({ facts, language, duplicate }) {
  return (
    <ul className="credential-marquee-row" aria-hidden={duplicate || undefined}>
      {facts.map((fact, index) => (
        <li key={fact.label} className="credential-marquee-item">
          {index > 0 && <span className="credential-marquee-divider" aria-hidden="true">•</span>}
          <span className="credential-marquee-label"><LocalizedText text={fact.label} language={language} /></span>
          <span className="credential-marquee-inline-sep" aria-hidden="true"> · </span>
          <span className="credential-marquee-value"><LocalizedText text={fact.value} language={language} /></span>
        </li>
      ))}
    </ul>
  );
}

function CredentialBand({ language }) {
  const facts = [...getPublicTrustFacts(language), ...getCredentialFacts(language)];
  const trackRef = useRef(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const singleSetWidth = track.scrollWidth / 2;
    const duration = Math.max(singleSetWidth / CREDENTIAL_MARQUEE_PX_PER_SECOND, CREDENTIAL_MARQUEE_MIN_SECONDS);
    track.style.setProperty('--credential-marquee-duration', `${duration.toFixed(1)}s`);
  }, [language, facts.length]);

  if (facts.length === 0) return null;

  return (
    <section className="credential-band" aria-label={language === 'hr' ? 'Vjerodajnice' : 'Kanzleiangaben'}>
      <div className="credential-marquee" tabIndex={0}>
        <div className="credential-marquee-track" ref={trackRef}>
          <CredentialMarqueeRow facts={facts} language={language} duplicate={false} />
          <CredentialMarqueeRow facts={facts} language={language} duplicate />
        </div>
      </div>
    </section>
  );
}

function Services({ t, language }) {
  const primaryPaths = new Set(t.services.map((service) => service.path));
  const secondaryServicePages = servicePagesByLanguage[language]
    .filter((page) => !primaryPaths.has(page.path));

  return (
    <section id="services" className="services-section section-surface-cream">
      <div className="section-shell services-shell">
        <div className="services-intro">
          <SectionHeading lead={t.servicesIntro.title.lead} emphasis={t.servicesIntro.title.emphasis} />
          <p>{t.servicesIntro.body}</p>
        </div>

        <div className="service-list">
          {t.services.map((service) => {
            const headingId = `service-${service.id}-heading`;
            return (
              <a
                key={service.id}
                className="service-row"
                href={getRouteHref(service.path)}
                aria-labelledby={headingId}
              >
                <small>{service.subtitle}</small>
                <h3 id={headingId}><RichText parts={service.title} /></h3>
                <p><LocalizedText text={service.body} language={language} /></p>
                <span className="service-row-cta" aria-hidden="true">
                  {t.cta.learnMore}
                  <ArrowRight size={16} aria-hidden="true" />
                </span>
              </a>
            );
          })}
        </div>

        {secondaryServicePages.length > 0 && (
          <nav className="service-secondary-nav" aria-label={t.localServices.label}>
            <small>{t.localServices.label}</small>
            {secondaryServicePages.map((page) => (
              <a key={page.path} href={getRouteHref(page.path)}>
                {page.eyebrow}
                <ArrowRight size={15} aria-hidden="true" />
              </a>
            ))}
          </nav>
        )}
      </div>
    </section>
  );
}

function ClientFitSection({ t }) {
  const clientFit = getApprovedTargetClientCopy(t.language) ?? t.clientFit;
  if (!clientFit?.cards?.length) return null;
  const isApprovedOverride = typeof clientFit.title === 'string';

  return (
    <section className="section-spacious section-surface-cream">
      <div className="section-shell">
        <div className="mx-auto max-w-3xl text-center reveal">
          {isApprovedOverride ? (
            <h2>{clientFit.title}</h2>
          ) : (
            <SectionHeading lead={clientFit.title.lead} emphasis={clientFit.title.emphasis} className="text-center" />
          )}
          <p className="mt-4">{clientFit.body}</p>
        </div>

        <div className="specialization-grid reveal reveal-delay-1">
          {clientFit.cards.map((card) => (
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

function AdviserVisual({ t }) {
  const approvedPortrait = getApprovedImage('adviserPortrait', t.language);
  const [imageUnavailable, setImageUnavailable] = useState(false);
  const hasApprovedPortrait = Boolean(approvedPortrait && !imageUnavailable);

  useEffect(() => setImageUnavailable(false), [approvedPortrait?.path]);

  return (
    <ImageSlot
      className="adviser-visual"
      src={hasApprovedPortrait ? `${import.meta.env.BASE_URL}${approvedPortrait.path.replace(/^\//, '')}` : null}
      alt={hasApprovedPortrait ? approvedPortrait.alt : ''}
      width={approvedPortrait?.width}
      height={approvedPortrait?.height}
      loading="lazy"
      decoding="async"
      sizes="(min-width: 1024px) 36vw, 100vw"
      onError={() => setImageUnavailable(true)}
    />
  );
}

function About({ t }) {
  const adviserBiography = getApprovedAdviserBiography(t.language) ?? t.about.summary;
  const professionalRegistration = getApprovedProfessionalRegistration(t.language);

  return (
    <section id="about" className="about-section section-surface-light">
      <div className="section-shell about-layout">
        <AdviserVisual t={t} />

        <div className="about-copy">
          <p className="about-eyebrow">{t.about.eyebrow}</p>
          <h2>{t.about.principalName}</h2>
          <p className="principal-role">{t.about.principalRole}</p>
          <p className="about-summary"><LocalizedText text={adviserBiography} language={t.language} /></p>
          <ul className="about-facts" aria-label={t.about.factsLabel}>
            {t.about.facts.map((fact) => <li key={fact}>{fact}</li>)}
          </ul>
          <a className="about-legal-link" href={getRouteHref(t.language === 'hr' ? '/hr/impressum' : '/impressum')}>
            {t.about.legalLinkLabel}
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          {professionalRegistration && (
            <a className="about-legal-link" href={professionalRegistration.url} target="_blank" rel="noopener noreferrer">
              {professionalRegistration.label}
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          )}
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
      <section id="faq" className="section-spacious section-surface-warm">
        <div className="section-shell faq-layout">
          <div className="faq-intro reveal">
            <SectionHeading lead={t.faq.title.lead} emphasis={t.faq.title.emphasis} />
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
            <small className="section-eyebrow">{page.eyebrow}</small>
            <h1 className="mt-5">{page.h1}</h1>
            <p className="mt-5 max-w-2xl text-forest/75"><LocalizedText text={page.intro} language={page.language} /></p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row" data-hero-cta>
              <button className="button-primary" type="button" onClick={onBook} data-booking-trigger="service-hero">
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
              <button className="button-primary" type="button" onClick={onBook} data-booking-trigger="service-cta">
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
          <small className="section-eyebrow">{ui.legal}</small>
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
  const servicePages = servicePagesByLanguage[t.language];

  return (
    <footer id="contact" className="footer-contact">
      <div className="footer-main">
        <div className="negative-footer__wordmark-stage" aria-hidden="true">
          <img
            className="negative-footer__wordmark"
            src={`${import.meta.env.BASE_URL}brand/mino-wordmark-footer-white.svg`}
            alt=""
            aria-hidden="true"
            width="343.55"
            height="79.5"
            draggable="false"
          />
        </div>

        <div className="negative-footer__content-wrap">
          <div className="section-shell">
            <div className="negative-footer__content">
              <div className="footer-contact-top reveal">
                <div>
                  <SectionHeading lead={t.contact.title.lead} emphasis={t.contact.title.emphasis} />
                  <p className="footer-contact-copy">{t.contact.body}</p>
                  <p className="footer-contact-copy">{t.contact.reassurance}</p>
                </div>
                <button className="footer-cta-button" type="button" onClick={onBook} data-booking-trigger="footer">
                  {t.contact.button}
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
              </div>

              <div className="footer-directory">
                <nav className="footer-column" aria-label={t.meta.primaryNavigationLabel}>
                  <small>{t.meta.primaryNavigationLabel}</small>
                  {t.nav.map((item) => (
                    <a href={resolveNavHref(item.href, routePath, t.language)} key={item.href}>{item.label}</a>
                  ))}
                </nav>

                <nav className="footer-column" aria-label={t.localServices.label}>
                  <small>{t.nav[0].label}</small>
                  {servicePages.map((page) => (
                    <a href={getRouteHref(page.path)} key={page.path}>{page.eyebrow}</a>
                  ))}
                </nav>

                <div className="footer-column footer-contact-list">
                  <small>{t.nav[2].label}</small>
                  {contactDetails.map((item) => {
                    const Icon = iconComponents[item.icon];
                    const href = getContactHref(item);
                    return (
                      <div key={item.label} className="footer-contact-item">
                        <Icon size={19} aria-hidden="true" />
                        <div>
                          <small>{item.label}</small>
                          <p>{href ? <a href={href}>{item.value}</a> : item.value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="map-panel footer-map-panel reveal">
                <div className="footer-map-meta">
                  <a
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
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <div className="section-shell footer-bottom-inner">
          <p>
            © {new Date().getFullYear()} {verifiedBusinessFacts.companyName} · {OFFICE_ADDRESS} · {verifiedBusinessFacts.commercialRegisterNumber} ({verifiedBusinessFacts.commercialRegisterCourt})
          </p>
          <nav className="footer-bottom-links" aria-label={`${t.contact.legalLinks.imprint} / ${t.contact.legalLinks.privacy}`}>
            <a href={getRouteHref(t.language === 'hr' ? '/hr/impressum' : '/impressum')}>{t.contact.legalLinks.imprint}</a>
            <a href={getRouteHref(t.language === 'hr' ? '/hr/pravila-privatnosti' : '/datenschutzerklaerung')}>{t.contact.legalLinks.privacy}</a>
            <button className="footer-privacy-settings" type="button" onClick={onPrivacySettings}>{t.privacySettings.button}</button>
            <a href="#top">{t.contact.backTop}</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}


const PRELOADER_SESSION_KEY = 'mino_preloader_shown';
const PRELOADER_DURATION_MS = 850;

function SessionPreloader() {
  const [visible, setVisible] = useState(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    try {
      return sessionStorage.getItem(PRELOADER_SESSION_KEY) !== 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!visible) return undefined;
    try {
      sessionStorage.setItem(PRELOADER_SESSION_KEY, 'true');
    } catch {
      // Storage unavailable (e.g. blocked cookies) - the timer below still removes the overlay.
    }
    const timer = window.setTimeout(() => setVisible(false), PRELOADER_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="preloader" aria-hidden="true">
      <div className="preloader-panel" />
    </div>
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
  useHeaderFocusHandoff(showDelayedStickyHeader);

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
    document.documentElement.lang = page.language === 'de' ? 'de-AT' : 'hr';
    document.title = page.title ?? page.pageTitle;
    setMetaContent('meta[name="description"]', page.metaDescription);
    setMetaContent('meta[name="robots"]', 'index, follow');
    setMetaContent('meta[property="og:title"]', page.title ?? page.pageTitle);
    setMetaContent('meta[property="og:description"]', page.metaDescription);
    setMetaContent('meta[property="og:type"]', 'website');
    setMetaContent('meta[property="og:url"]', getCanonicalUrl(page.path));
    setMetaContent('meta[property="og:site_name"]', SITE_NAME);
    setMetaContent('meta[property="og:locale"]', locale);
    if (SOCIAL_IMAGE_PATH) {
      const socialImageUrl = absoluteUrl(SITE_URL, SOCIAL_IMAGE_PATH);
      setMetaContent('meta[property="og:image"]', socialImageUrl);
      setMetaContent('meta[name="twitter:image"]', socialImageUrl);
      setMetaContent('meta[name="twitter:card"]', 'summary_large_image');
    } else {
      removeMeta('meta[property="og:image"]');
      removeMeta('meta[name="twitter:image"]');
      setMetaContent('meta[name="twitter:card"]', 'summary');
    }
    setMetaContent('meta[name="twitter:title"]', page.title ?? page.pageTitle);
    setMetaContent('meta[name="twitter:description"]', page.metaDescription);
    setCanonicalHref(getCanonicalUrl(page.path));
    setAlternateHref('de-AT', getCanonicalUrl(page.alternatePaths.de));
    setAlternateHref('hr', getCanonicalUrl(page.alternatePaths.hr));
    setAlternateHref('x-default', getCanonicalUrl(page.alternatePaths.de));
  }, [page]);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-white text-forest">
      <SessionPreloader />
      <div
        className="site-shell relative z-10"
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
              <CredentialBand language={page.language} />
              <Services t={t} language={page.language} />
              <About t={t} />
              <ClientFitSection t={t} />
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
