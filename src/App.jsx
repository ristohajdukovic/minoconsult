/* TODO: Confirm with [Principal] which 3 industries to feature.
   Defaults below are best guesses - replace before launch. */
import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronsDown,
  Clock3,
  FileCheck2,
  FileText,
  Lock,
  Mail,
  MapPin,
  Phone,
  Plus,
  Scale,
  ShieldCheck,
  Smartphone,
  Sprout,
  Star,
  X,
} from 'lucide-react';
import { legalPages, legalPagesByPath, seoPages, seoPagesByPath } from './seoPages.js';
const languages = [
  { code: 'de', label: 'DE' },
  { code: 'bks', label: 'BKS' },
];

const timeSlots = ['08:30', '10:00', '11:30', '13:00', '14:30', '15:30'];

// Set real values from a verified source before rendering public review proof.
const trustProofConfig = {
  googleRating: null,
  googleReviewCount: null,
  googleStars: 3,
};

const siteUrl = 'https://ristohajdukovic.github.io/minoconsult';
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

  path = path.replace(/\/+$/, '') || '/';
  return path;
}

function getCanonicalUrl(path) {
  return `${siteUrl}${path === '/' ? '/' : path}`;
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

function useCurrentRoutePath() {
  const [routePath, setRoutePath] = useState(() => normalizeRoutePath(window.location.pathname));

  useEffect(() => {
    const updateRoute = () => setRoutePath(normalizeRoutePath(window.location.pathname));
    window.addEventListener('popstate', updateRoute);

    return () => window.removeEventListener('popstate', updateRoute);
  }, []);

  return routePath;
}

function resolveNavHref(href, routePath) {
  if (!href.startsWith('#')) return href;
  if (routePath === '/' || href === '#contact' || href === '#top') return href;
  return `${getRouteHref('/')}${href}`;
}

const content = {
  de: {
    pageTitle: 'MINO Consulting KG | Steuerberatung und Buchhaltung in Wien',
    meta: {
      languageLabel: 'Sprache',
      menuLabel: 'Navigation umschalten',
      appointmentAria: 'Termin bei MINO Consulting KG vereinbaren',
    },
    nav: [
      { label: 'Leistungen', href: '#services' },
      { label: 'Über uns', href: '#about' },
      { label: 'Kontakt', href: '#contact' },
    ],
    cta: {
      contact: 'Kontakt',
      book: 'Termin vereinbaren',
      call: 'Anrufen',
      consultation: 'Erstgespräch vereinbaren',
      scroll: 'Scrollen',
    },
    hero: {
      badge: 'Steuerberatung in Wien',
      title: [
        { text: 'Professionelle Wiener ' },
        { text: 'Buchhaltung', em: true },
        { text: ' und ' },
        { text: 'Steuerberatung', em: true },
      ],
      body:
        'MINO Consulting KG organisiert Belege, UVA-Fristen, Lohnverrechnung und Reporting, damit Unternehmen in Österreich mit aktuellen Zahlen und sauber dokumentierten Pflichten arbeiten.',
      reassurance: 'Erstgespräch kostenlos · Antwort innerhalb von 24 Stunden werktags',
      imageAlt: 'Beratungsgespräch zu Finanzplanung in einem hellen Büro',
    },
    value: {
      statement:
        'Wir sind eine Wiener Kanzlei, die Zahlen mit Entscheidungen verbindet. Aus komplexen Finanzdaten entstehen klare, umsetzbare Einblicke, damit Sie fundierte Entscheidungen treffen.',
      features: [
        {
          icon: BriefcaseBusiness,
          text: 'Von laufender Buchhaltung bis Lohnverrechnung: Leistungen, die auf österreichische Unternehmen abgestimmt sind.',
        },
        {
          icon: ShieldCheck,
          text: 'Wir führen UVA-Termine, FinanzOnline-Fristen und Meldeanforderungen in einer nachvollziehbaren Fristenliste zusammen.',
        },
        {
          icon: FileText,
          text: 'Jahresabschlüsse, Management Reports und geordnete Unterlagen unterstützen sichere Entscheidungen.',
        },
        {
          icon: CheckCircle2,
          text: 'Saubere Dokumentation, monatliche Abstimmungen und konkrete Hinweise zu SVS, Umsatzsteuer und Finanzamt halten Ihre Compliance im Blick.',
        },
      ],
    },
    servicesIntro: {
      title: [
        { text: 'Wir bieten ein breites Spektrum an ' },
        { text: 'Rechnungswesen und Steuerleistungen', em: true },
      ],
      body:
        'Individuelle Lösungen für Belegfluss, UVA, Lohnabrechnung und Jahresabschluss.',
    },
    services: [
      {
        id: 'buchhaltung-lohnverrechnung',
        icon: BookOpen,
        title: [
          { text: 'Buchhaltung & ' },
          { text: 'Lohnverrechnung', em: true },
        ],
        subtitle: 'Laufende Buchhaltung',
        body:
          'Monatliche und jährliche Buchhaltung, geordnete Belege, Lohnverrechnung, Gehaltsabrechnungen und klare Reporting-Routinen.',
        details: [
          'Laufende Verbuchung und Belegorganisation',
          'UVA-Vorbereitung und Abstimmung offener Posten',
          'Lohn- und Gehaltsabrechnungen inklusive Meldungen',
          'Monatliche Auswertungen für bessere Entscheidungen',
        ],
        price: 'Ab €290/Monat',
      },
      {
        id: 'steuerberatung-vertretung',
        icon: Scale,
        title: [{ text: 'Steuerberatung & Vertretung' }],
        subtitle: 'Finanzamt & Erklärungen',
        body:
          'Einkommensteuer- und Körperschaftsteuererklärungen, Steuerplanung und Vertretung gegenüber dem österreichischen Finanzamt.',
        details: [
          'Einkommensteuer- und Körperschaftsteuererklärungen',
          'Umsatzsteuerliche Fragen und Fristenplanung',
          'Vertretung und Korrespondenz mit dem Finanzamt',
          'Praktische Optimierung laufender Steuerlasten',
        ],
        price: 'Ab €180/Monat',
      },
      {
        id: 'jahresabschluss-reporting',
        icon: FileCheck2,
        title: [{ text: 'Jahresabschluss & Reporting' }],
        subtitle: 'Abschluss & Auswertung',
        body:
          'Jahresabschluss, Finanzberichte, prüfungsbereite Unterlagen, Managementauswertungen und entscheidungsorientierte Prognosen.',
        details: [
          'Jahresabschluss und strukturierte Abschlussunterlagen',
          'Management Reports mit klaren Kennzahlen',
          'Liquiditätsplanung und Forecasts',
          'Vorbereitung für Banken, Förderstellen oder Prüfungen',
        ],
        price: 'Ab €690/Jahr',
      },
      {
        id: 'gruendung-unternehmensberatung',
        icon: Sprout,
        title: [{ text: 'Gründung & Unternehmensberatung' }],
        subtitle: 'Start in Österreich',
        body:
          'Strategische Planung, Unterstützung bei der Gründung und finanzielle Grundlagen für neue Unternehmen und operative Entscheidungen.',
        details: [
          'Wahl der passenden Unternehmensstruktur',
          'Finanzielle Planung vor und nach der Gründung',
          'Registrierungs- und Behördenkoordination',
          'Setup von Buchhaltung, Fristen und Reporting',
        ],
        price: 'Ab €490 einmalig',
      },
    ],
    specialization: {
      title: 'Spezialisierung auf ausgewählte Branchen',
      body: 'Wir kennen die steuerlichen Eigenheiten Ihrer Branche.',
      cards: [
        {
          title: 'Immobilien & Hausverwaltung',
          body:
            'Vorsteuerabzug bei Vermietung, Liebhaberei-Beurteilung, WEG-Abrechnung und Hausverwalter-Reporting.',
        },
        {
          title: 'Gastronomie & Hotellerie',
          body:
            'Trinkgeld-Aufzeichnung, Pauschalierung, Registrierkassenpflicht und touristische Saisonbuchhaltung.',
        },
        {
          title: 'Gründer & Selbstständige',
          body:
            'Rechtsformwahl, Sozialversicherung (SVS), Kleinunternehmer-Regelung und Förderberatung vor der ersten UVA-Meldung.',
        },
      ],
    },
    localServices: {
      title: 'Beratung in Ihrer Nähe',
      body: 'Lokale Schwerpunktseiten für Wien.',
      label: 'Lokale Leistungsseiten',
    },
    about: {
      badge: 'Über MINO',
      founderImageAlt: 'Professioneller Berater im Anzug',
      principalName: 'Mag./Dr. Vorname Nachname',
      principalRole: 'Steuerberater · Geschäftsführer',
      principalRegistration: 'Mitglied der KSW · Berufsanwärter-Nr. / Registrierung ergänzen',
      title: [
        { text: 'Finanzielle Klarheit für Wiener Unternehmen, von einem Team, das die ' },
        { text: 'österreichische Steuerlandschaft', em: true },
        { text: ' kennt.' },
      ],
      paragraphs: [
        'MINO Consulting KG verbindet lokales Know-how in Wien mit direkter Abstimmung zu FinanzOnline, UVA-Fristen, SVS-Themen und laufender Buchhaltung.',
        'Wir begleiten Buchhaltung, Lohnverrechnung, Steuererklärungen, Jahresabschlüsse und Gründungsthemen mit Fokus auf Klarheit, Reaktionsfähigkeit und verlässliche Compliance.',
      ],
    },
    faq: {
      title: [
        { text: 'Häufig gestellte ' },
        { text: 'Fragen', em: true },
      ],
      body:
        'Antworten zu Steuerberatung, Buchhaltung und Lohnverrechnung in Wien für Gründer, KMU und wachsende Unternehmen.',
      items: [
        {
          question: 'Wann lohnt sich ein Steuerberater in Wien für ein Unternehmen?',
          answer:
            'Sobald laufende Buchhaltung, Umsatzsteuer, Lohnverrechnung oder Gründungsthemen Zeit kosten oder Risiken erzeugen. Ein Steuerberater in Wien hilft, Fristen einzuhalten, Unterlagen sauber aufzubereiten und Entscheidungen auf Basis aktueller Zahlen zu treffen.',
        },
        {
          question: 'Welche Unterlagen braucht MINO Consulting KG für die laufende Buchhaltung?',
          answer:
            'In der Regel genügen Ausgangs- und Eingangsrechnungen, Bankunterlagen, Belege, Kassa-Daten und relevante Verträge. Im Erstgespräch klären wir, welche Unterlagen Ihr Unternehmen in Österreich konkret liefern sollte und wie der Austausch am effizientesten organisiert wird.',
        },
        {
          question: 'Übernehmen Sie auch Lohnverrechnung in Wien?',
          answer:
            'Ja, wir unterstützen bei laufender Lohn- und Gehaltsverrechnung, An- und Abmeldungen, Meldungen an Behörden und einer sauberen monatlichen Abwicklung für Arbeitgeber in Österreich.',
        },
        {
          question: 'Können Sie den Jahresabschluss und die Kommunikation mit dem Finanzamt begleiten?',
          answer:
            'Wir unterstützen bei Jahresabschluss, Auswertungen und der geordneten Vorbereitung von Unterlagen. Dazu gehört auch die laufende Kommunikation rund um steuerliche Themen und Rückfragen des Finanzamts.',
        },
        {
          question: 'Ist eine Beratung auch für Gründer und Start-ups in Wien sinnvoll?',
          answer:
            'Gerade in der Gründungsphase ist strukturierte steuerliche und finanzielle Planung wichtig. Wir helfen bei Rechtsform, Fristen, Setup von Buchhaltung und einem praktikablen Start für Ihr Unternehmen in Wien.',
        },
        {
          question: 'Wie läuft ein Erstgespräch mit MINO Consulting KG ab?',
          answer:
            'Im Erstgespräch besprechen wir Ihr Geschäftsmodell, aktuelle Prozesse, offene Fragen und Prioritäten. Danach erhalten Sie eine klare Empfehlung, welche Leistungen, Unterlagen und nächsten Schritte sinnvoll sind.',
        },
        {
          question: 'Kann ich zu MINO Consulting KG wechseln, wenn ich bereits einen Steuerberater habe?',
          answer:
            'Ja. Ein Wechsel ist in vielen Fällen unkompliziert, wenn Unterlagen, Zugänge und Zuständigkeiten sauber übergeben werden. Wir unterstützen Sie dabei, den Übergang strukturiert zu organisieren.',
        },
      ],
    },
    contact: {
      badge: 'Kontakt',
      title: [
        { text: 'Bereit für den ' },
        { text: 'nächsten Schritt?', em: true },
      ],
      body:
        'Senden Sie uns eine Anfrage, und wir klären gemeinsam, welche Unterlagen, Fristen und Entscheidungen als Nächstes anstehen.',
      reassurance: 'Das Erstgespräch ist kostenlos und unverbindlich.',
      button: 'Termin anfragen',
      cards: [
        { icon: Clock3, label: 'Öffnungszeiten', value: 'Mo-Fr: 8:00-16:00' },
        { icon: Mail, label: 'E-Mail', value: 'office@mino-consulting.at' },
        { icon: Phone, label: 'Büro', value: '+43 1 234 5678' },
        { icon: Smartphone, label: 'Mobil', value: '+43 660 123 4567' },
        { icon: MapPin, label: 'Adresse', value: 'Geblergasse 95/8, 1170 Wien' },
        { icon: CalendarDays, label: 'Beratung', value: 'Vor Ort oder online nach Termin' },
      ],
      mapTitle: 'Standort in Wien',
      mapAddress: 'Geblergasse 95/8, 1170 Wien',
      backTop: 'Nach oben',
    },
    booking: {
      title: 'Termin vereinbaren',
      intro:
        'Wählen Sie Thema, Zeitpunkt und Kontaktangaben. Die Anfrage wird vorbereitet und kann direkt per E-Mail an MINO Consulting KG gesendet werden.',
      serviceLabel: 'Beratungsthema',
      modeLabel: 'Format',
      dateLabel: 'Datum',
      timeLabel: 'Uhrzeit',
      nameLabel: 'Name',
      companyLabel: 'Unternehmen',
      emailLabel: 'E-Mail',
      phoneLabel: 'Telefon',
      messageLabel: 'Nachricht',
      messagePlaceholder: 'Kurz beschreiben, wobei Sie Unterstützung benötigen.',
      submit: 'Anfrage prüfen',
      sendEmail: 'Per E-Mail senden',
      newRequest: 'Neue Anfrage',
      close: 'Schließen',
      securityText: 'Ihre Daten sind 100% sicher - keine Weitergabe an Dritte',
      responseBadge: '⏱ Antwort in 24h',
      required: 'Bitte füllen Sie Thema, Datum, Uhrzeit, Name und E-Mail aus.',
      successTitle: 'Ihre Terminanfrage ist vorbereitet.',
      successBody:
        'Prüfen Sie die Zusammenfassung und senden Sie die Anfrage per E-Mail. Eine echte Buchung wird bestätigt, sobald MINO Consulting KG antwortet.',
      modes: ['Online', 'Vor Ort', 'Telefonisch'],
      services: [
        'Erstgespräch',
        'Buchhaltung & Lohnverrechnung',
        'Steuerberatung',
        'Jahresabschluss & Reporting',
        'Gründung & Beratung',
      ],
    },
  },
  bks: {
    pageTitle: 'MINO Consulting KG | Računovodstvo i porezno savjetovanje u Beču',
    meta: {
      languageLabel: 'Jezik',
      menuLabel: 'Otvori navigaciju',
      appointmentAria: 'Zakaži konsultacije sa MINO Consulting KG',
    },
    nav: [
      { label: 'Usluge', href: '#services' },
      { label: 'O nama', href: '#about' },
      { label: 'Kontakt', href: '#contact' },
    ],
    cta: {
      contact: 'Kontakt',
      book: 'Zakaži termin',
      call: 'Pozovite nas',
      consultation: 'Zakaži prvi razgovor',
      scroll: 'Skroluj',
    },
    hero: {
      badge: 'Računovodstvo u Beču',
      title: [
        { text: 'Profesionalno računovodstvo i ' },
        { text: 'porezno savjetovanje', em: true },
        { text: ' u Beču' },
      ],
      body:
        'MINO Consulting KG organizuje dokumentaciju, PDV rokove, obračun plata i izvještavanje, kako bi firme u Austriji radile sa ažurnim brojkama i urednim obavezama.',
      reassurance: 'Prvi razgovor je besplatan · Odgovor u roku od 24 sata radnim danima',
      imageAlt: 'Poslovni savjetnici razgovaraju o finansijskom planiranju u svijetloj kancelariji',
    },
    value: {
      statement:
        'Mi smo računovodstvena kancelarija iz Beča koja povezuje brojke i odluke. Kompleksne finansijske podatke prevodimo u jasne uvide koje možete odmah koristiti.',
      features: [
        {
          icon: BriefcaseBusiness,
          text: 'Od knjigovodstva do obračuna plata: usluge prilagođene firmama koje posluju u Austriji.',
        },
        {
          icon: ShieldCheck,
          text: 'PDV rokove, FinanzOnline obaveze i prijave vodimo kroz preglednu listu rokova.',
        },
        {
          icon: FileText,
          text: 'Godišnji završni računi, izvještaji i uredna dokumentacija podržavaju sigurne poslovne odluke.',
        },
        {
          icon: CheckCircle2,
          text: 'Uredna dokumentacija, mjesečna usklađivanja i konkretne napomene za SVS, PDV i Finanzamt drže compliance pod kontrolom.',
        },
      ],
    },
    servicesIntro: {
      title: [
        { text: 'Pružamo širok spektar ' },
        { text: 'računovodstvenih i poreznih usluga', em: true },
      ],
      body:
        'Individualna rješenja za dokumentaciju, PDV, obračun plata i godišnji završni račun.',
    },
    services: [
      {
        id: 'knjigovodstvo-obracun-plata',
        icon: BookOpen,
        title: [
          { text: 'Knjigovodstvo & ' },
          { text: 'obračun plata', em: true },
        ],
        subtitle: 'Tekuće računovodstvo',
        body:
          'Mjesečno i godišnje knjigovodstvo, organizovani dokumenti, obračun plata, platne liste i jasni ritmovi izvještavanja.',
        details: [
          'Tekuće knjiženje i organizacija dokumentacije',
          'Priprema PDV prijava i usklađivanje otvorenih stavki',
          'Obračun plata i potrebne prijave',
          'Mjesečni izvještaji za jasnije odluke',
        ],
        price: 'Od €290/mjesec',
      },
      {
        id: 'porezno-savjetovanje-zastupanje',
        icon: Scale,
        title: [{ text: 'Porezno savjetovanje & zastupanje' }],
        subtitle: 'Finanzamt & prijave',
        body:
          'Porezne prijave za fizička i pravna lica, porezno planiranje i zastupanje pred austrijskim Finanzamtom.',
        details: [
          'Porezne prijave za fizička i pravna lica',
          'Planiranje rokova i pitanja vezana za PDV',
          'Zastupanje i komunikacija sa Finanzamtom',
          'Praktična optimizacija poreznih obaveza',
        ],
        price: 'Od €180/mjesec',
      },
      {
        id: 'godisnji-obracun-reporting',
        icon: FileCheck2,
        title: [{ text: 'Godišnji obračun & reporting' }],
        subtitle: 'Izvještaji & analiza',
        body:
          'Godišnji završni računi, finansijski izvještaji, dokumentacija spremna za kontrolu, menadžerski izvještaji i prognoze.',
        details: [
          'Godišnji završni računi i uredna dokumentacija',
          'Menadžerski izvještaji sa jasnim pokazateljima',
          'Planiranje likvidnosti i prognoze',
          'Priprema za banke, kontrole ili subvencije',
        ],
        price: 'Od €690/godina',
      },
      {
        id: 'osnivanje-firme-savjetovanje',
        icon: Sprout,
        title: [{ text: 'Osnivanje firme & savjetovanje' }],
        subtitle: 'Početak u Austriji',
        body:
          'Strateško planiranje, podrška pri osnivanju i finansijske osnove za nove firme i operativne odluke.',
        details: [
          'Odabir odgovarajuće strukture firme',
          'Finansijsko planiranje prije i poslije osnivanja',
          'Koordinacija registracije i administracije',
          'Setup knjigovodstva, rokova i izvještavanja',
        ],
        price: 'Od €490 jednokratno',
      },
    ],
    specialization: {
      title: 'Specijalizacija za odabrane branše',
      body: 'Poznajemo porezne specifičnosti vaše djelatnosti.',
      cards: [
        {
          title: 'Nekretnine & upravljanje objektima',
          body:
            'Odbitak pretporeza kod najma, procjena Liebhaberei rizika, WEG obračuni i izvještaji za upravitelje zgrada.',
        },
        {
          title: 'Gastronomija & hotelijerstvo',
          body:
            'Evidencija napojnica, paušaliranje, obaveze registracione kase i sezonsko knjigovodstvo za turizam.',
        },
        {
          title: 'Osnivači & samozaposleni',
          body:
            'Izbor pravne forme, socijalno osiguranje (SVS), Kleinunternehmer regulativa i savjetovanje prije prve PDV prijave.',
        },
      ],
    },
    localServices: {
      title: 'Savjetovanje u vašoj blizini',
      body: 'Lokalne fokus stranice za Beč.',
      label: 'Lokalne usluge',
    },
    about: {
      badge: 'O MINO',
      founderImageAlt: 'Profesionalni savjetnik u odijelu',
      principalName: 'Mag./Dr. Ime Prezime',
      principalRole: 'Porezni savjetnik · direktor',
      principalRegistration: 'Član KSW · broj kandidata / registraciju dopuniti',
      title: [
        { text: 'Finansijski pregled za firme u Beču, uz tim koji poznaje ' },
        { text: 'austrijski porezni sistem', em: true },
        { text: '.' },
      ],
      paragraphs: [
        'MINO Consulting KG spaja lokalno iskustvo u Beču sa direktnom koordinacijom oko FinanzOnline, PDV rokova, SVS tema i tekućeg knjigovodstva.',
        'Podržavamo knjigovodstvo, obračun plata, porezne prijave, godišnje završne račune i osnivanje firme uz fokus na jasnoću, brz odgovor i pouzdan compliance.',
      ],
    },
    faq: {
      title: [
        { text: 'Česta ' },
        { text: 'pitanja', em: true },
      ],
      body:
        'Odgovori na najčešća pitanja o poreznom savjetovanju, knjigovodstvu i obračunu plata u Beču za osnivače, mala i srednja preduzeća.',
      items: [
        {
          question: 'Kada se isplati angažovati poreznog savjetnika u Beču za firmu?',
          answer:
            'Čim tekuće knjigovodstvo, PDV, obračun plata ili pitanja vezana za osnivanje počnu trošiti vrijeme ili stvarati rizik. Porezni savjetnik u Beču pomaže da rokovi budu pod kontrolom, dokumentacija uredna i odluke zasnovane na stvarnim brojkama.',
        },
        {
          question: 'Koju dokumentaciju MINO Consulting KG treba za tekuće knjigovodstvo?',
          answer:
            'Najčešće su potrebne izlazne i ulazne fakture, bankovni izvodi, fiskalni i ostali računi, blagajnički podaci i relevantni ugovori. Na prvom sastanku preciziramo šta je vašoj firmi u Austriji potrebno pripremiti i kako najefikasnije organizovati razmjenu dokumenata.',
        },
        {
          question: 'Da li preuzimate i obračun plata u Beču?',
          answer:
            'Da. Pomažemo kod redovnog obračuna plata i zarada, prijava i odjava zaposlenih, potrebnih prijava prema institucijama i uredne mjesečne administracije za poslodavce u Austriji.',
        },
        {
          question: 'Možete li voditi godišnji završni račun i komunikaciju sa Finanzamtom?',
          answer:
            'Podržavamo pripremu godišnjeg završnog računa, izvještaja i uredne dokumentacije za poslovne odluke. U to spada i tekuća komunikacija oko poreznih pitanja i upita koje može postaviti Finanzamt.',
        },
        {
          question: 'Da li je savjetovanje korisno i za osnivače i startupe u Beču?',
          answer:
            'Posebno u fazi osnivanja vrijedi imati jasnu poreznu i finansijsku strukturu. Pomažemo kod izbora forme firme, rokova, postavke knjigovodstva i praktičnog starta poslovanja u Beču.',
        },
        {
          question: 'Kako izgleda prvi razgovor sa MINO Consulting KG?',
          answer:
            'Na prvom razgovoru prolazimo kroz vaš poslovni model, sadašnje procese, otvorena pitanja i prioritete. Nakon toga dobijate jasan prijedlog koje usluge, dokumenti i naredni koraci imaju najviše smisla.',
        },
        {
          question: 'Mogu li preći u MINO Consulting KG ako već imam poreznog savjetnika?',
          answer:
            'Da. Promjena je u mnogim slučajevima jednostavna kada se dokumentacija, pristupi i odgovornosti uredno prenesu. Pomažemo da tranzicija bude organizovana i pregledna.',
        },
      ],
    },
    contact: {
      badge: 'Kontakt',
      title: [
        { text: 'Spremni za ' },
        { text: 'sljedeći korak?', em: true },
      ],
      body:
        'Pošaljite nam upit i zajedno ćemo razjasniti dokumente, rokove i odluke koje su vam sada najvažnije.',
      reassurance: 'Prvi razgovor je besplatan i neobavezan.',
      button: 'Pošalji upit',
      cards: [
        { icon: Clock3, label: 'Radno vrijeme', value: 'Pon-Pet: 8:00-16:00' },
        { icon: Mail, label: 'E-mail', value: 'office@mino-consulting.at' },
        { icon: Phone, label: 'Telefon', value: '+43 1 234 5678' },
        { icon: Smartphone, label: 'Mobilni', value: '+43 660 123 4567' },
        { icon: MapPin, label: 'Adresa', value: 'Geblergasse 95/8, 1170 Beč' },
        { icon: CalendarDays, label: 'Konsultacije', value: 'U kancelariji ili online po dogovoru' },
      ],
      mapTitle: 'Lokacija u Beču',
      mapAddress: 'Geblergasse 95/8, 1170 Beč',
      backTop: 'Na vrh',
    },
    booking: {
      title: 'Zakaži termin',
      intro:
        'Odaberite temu, datum, vrijeme i unesite kontakt podatke. Upit se priprema za slanje e-mailom firmi MINO Consulting KG.',
      serviceLabel: 'Tema konsultacija',
      modeLabel: 'Format',
      dateLabel: 'Datum',
      timeLabel: 'Vrijeme',
      nameLabel: 'Ime i prezime',
      companyLabel: 'Firma',
      emailLabel: 'E-mail',
      phoneLabel: 'Telefon',
      messageLabel: 'Poruka',
      messagePlaceholder: 'Ukratko opišite gdje vam je potrebna podrška.',
      submit: 'Pregledaj upit',
      sendEmail: 'Pošalji e-mail',
      newRequest: 'Novi upit',
      close: 'Zatvori',
      securityText: 'Vaši podaci su 100% sigurni - bez prosljeđivanja trećim stranama',
      responseBadge: '⏱ Odgovor u 24h',
      required: 'Molimo unesite temu, datum, vrijeme, ime i e-mail.',
      successTitle: 'Vaš upit za termin je pripremljen.',
      successBody:
        'Provjerite sažetak i pošaljite upit e-mailom. Termin je potvrđen tek nakon odgovora MINO Consulting KG.',
      modes: ['Online', 'U kancelariji', 'Telefonski'],
      services: [
        'Prvi razgovor',
        'Knjigovodstvo & obračun plata',
        'Porezno savjetovanje',
        'Godišnji obračun & reporting',
        'Osnivanje firme & savjetovanje',
      ],
    },
  },
};

function RichText({ parts }) {
  return (
    <>
      {parts.map((part, index) =>
        part.em ? <em key={`${part.text}-${index}`}>{part.text}</em> : <React.Fragment key={`${part.text}-${index}`}>{part.text}</React.Fragment>,
      )}
    </>
  );
}

function BadgeIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 12.5h3.3c.8 0 1.5.6 1.5 1.4v.2H8.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.8 13.2 7 11.4l4.4 3.2h2.4l5.7-3.2c.5-.3 1.1-.1 1.4.4.2.5.1 1-.4 1.3l-6.3 4.3H9.5l-3.1-1.7-2.6 1.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="14.2" cy="7.2" r="2.7" stroke="currentColor" strokeWidth="1.7" />
    </svg>
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

function LanguageSwitcher({ language, setLanguage, label }) {
  return (
    <div className="language-switcher" aria-label={label}>
      {languages.map((item) => (
        <button
          key={item.code}
          type="button"
          className={language === item.code ? 'is-active' : ''}
          onClick={() => setLanguage(item.code)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function Header({ t, language, setLanguage, onBook, routePath, showLanguageSwitcher = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="relative z-50 border-b border-forest/50 bg-white">
      <nav className="section-shell flex h-[4.5rem] items-center justify-between sm:h-[4.75rem]" aria-label="Main navigation">
        <a href={routePath === '/' ? '#top' : getRouteHref('/')} className="flex items-center gap-2.5 sm:gap-3" onClick={closeMenu}>
          <span className="grid h-9 w-9 place-items-center rounded border border-forest bg-forest text-[0.9rem] font-black text-white sm:h-10 sm:w-10 sm:text-sm">
            MC
          </span>
          <span className="leading-tight">
            <span className="block text-[0.78rem] font-extrabold uppercase tracking-[0.1em] text-forest sm:text-sm sm:tracking-[0.12em]">
              MINO Consulting
            </span>
            <span className="block text-[0.6rem] font-medium uppercase tracking-[0.16em] text-forest/50 sm:text-[0.68rem]">
              KG
            </span>
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {t.nav.map((item) => (
            <a key={item.href} className="nav-link" href={resolveNavHref(item.href, routePath)}>
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {showLanguageSwitcher && (
            <LanguageSwitcher language={language} setLanguage={setLanguage} label={t.meta.languageLabel} />
          )}
          <div className="hidden sm:block">
            <button className="button-primary" type="button" onClick={onBook}>
              {t.cta.book}
            </button>
          </div>
          <button
            className="hamburger-button md:hidden"
            type="button"
            aria-label={t.meta.menuLabel}
            aria-expanded={isOpen}
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
        <div className="mobile-menu-panel border-t border-forest/50 bg-white md:hidden">
          <div className="section-shell grid gap-3 py-5">
            {t.nav.map((item) => (
              <a key={item.href} className="nav-link py-2" href={resolveNavHref(item.href, routePath)} onClick={closeMenu}>
                {item.label}
              </a>
            ))}
            <button
              className="button-primary mt-2"
              type="button"
              onClick={() => {
                closeMenu();
                onBook();
              }}
            >
              {t.cta.book}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

function DelayedStickyHeader({ t, language, setLanguage, onBook, isVisible, routePath, showLanguageSwitcher = true }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isVisible) setIsOpen(false);
  }, [isVisible]);

  return (
    <header className={`delayed-sticky-header ${isVisible ? 'is-visible' : ''}`}>
      <nav className="section-shell flex h-[4.5rem] items-center justify-between sm:h-16" aria-label="Sticky navigation">
        <a href={routePath === '/' ? '#top' : getRouteHref('/')} className="flex items-center gap-2.5 sm:gap-3" onClick={() => setIsOpen(false)}>
          <span className="grid h-9 w-9 place-items-center rounded border border-forest bg-forest text-[0.9rem] font-black text-white sm:h-10 sm:w-10 sm:text-sm">
            MC
          </span>
          <span className="leading-tight">
            <span className="block text-[0.78rem] font-extrabold uppercase tracking-[0.1em] text-forest sm:text-sm sm:tracking-[0.12em]">
              MINO Consulting
            </span>
            <span className="block text-[0.6rem] font-medium uppercase tracking-[0.16em] text-forest/50 sm:text-[0.68rem]">
              KG
            </span>
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {t.nav.map((item) => (
            <a key={item.href} className="nav-link" href={resolveNavHref(item.href, routePath)}>
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {showLanguageSwitcher && (
            <LanguageSwitcher language={language} setLanguage={setLanguage} label={t.meta.languageLabel} />
          )}
          <div className="hidden sm:block">
            <button className="button-primary py-2.5" type="button" onClick={onBook}>
              {t.cta.book}
            </button>
          </div>
          <button
            className="hamburger-button md:hidden"
            type="button"
            aria-label={t.meta.menuLabel}
            aria-expanded={isOpen}
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
        <div className="mobile-menu-panel border-t border-forest/50 bg-white md:hidden">
          <div className="section-shell grid gap-3 py-5">
            {t.nav.map((item) => (
              <a key={item.href} className="nav-link py-2" href={resolveNavHref(item.href, routePath)} onClick={() => setIsOpen(false)}>
                {item.label}
              </a>
            ))}
            <button
              className="button-primary mt-2"
              type="button"
              onClick={() => {
                setIsOpen(false);
                onBook();
              }}
            >
              {t.cta.book}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

function getGoogleRatingText(language) {
  if (!trustProofConfig.googleRating) return '';

  const label = language === 'de' ? 'Google Bewertung' : 'Google ocjena';

  if (!trustProofConfig.googleReviewCount) {
    return `${label}: ${trustProofConfig.googleRating}`;
  }

  const reviewLabel = language === 'de' ? 'Bewertungen' : 'recenzija';
  return `${label}: ${trustProofConfig.googleRating} (${trustProofConfig.googleReviewCount} ${reviewLabel})`;
}

function getOfficePhone(t) {
  return t.contact.cards.find((item) => item.icon === Phone)?.value ?? '';
}

function getPhoneHref(phoneNumber) {
  return `tel:${phoneNumber.replace(/[^\d+]/g, '')}`;
}

function getContactHref(item) {
  if (item.icon === Mail) return `mailto:${item.value}`;
  if (item.icon === Phone || item.icon === Smartphone) return getPhoneHref(item.value);
  return null;
}

function renderLegalItem(item) {
  const emailMatch = item.match(/office@mino-consulting\.at/);
  const phoneMatch = item.match(/\+43\s1\s234\s5678/);

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

  if (phoneMatch) {
    const [before, after] = item.split(phoneMatch[0]);
    return (
      <>
        {before}
        <a href={getPhoneHref(phoneMatch[0])}>{phoneMatch[0]}</a>
        {after}
      </>
    );
  }

  return item;
}

function HeroImage({ t, className = '' }) {
  return (
    <div className={className}>
      <div className="hero-image-frame">
        <img
          className="h-32 w-full rounded-t-md object-cover sm:h-[31rem]"
          src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1400&q=82"
          alt={t.hero.imageAlt}
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
      <div className="section-shell grid items-center gap-8 sm:gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
        <div className="max-w-[20.5rem] sm:max-w-xl reveal">
          <small className="tag-pill">
            <BadgeIcon />
            {t.hero.badge}
          </small>
          <h1 className="mt-4 sm:mt-5">
            <RichText parts={t.hero.title} />
          </h1>
          <p className="mt-4 max-w-lg text-forest/75 sm:mt-5">{t.hero.body}</p>

          <HeroImage t={t} className="mt-4 lg:hidden" />

          <div className="mt-4 flex flex-col gap-3 sm:mt-7 md:flex-row lg:mt-7" data-hero-cta>
            <button className="button-primary w-full md:w-auto" type="button" onClick={onBook}>
              {t.cta.book}
            </button>
            <a
              className="button-secondary hero-call-link w-full md:w-auto"
              href={phoneHref}
              aria-label={`MINO Consulting anrufen: ${officePhone}`}
            >
              {t.cta.call}
            </a>
          </div>
          <p className="hero-reassurance">{t.hero.reassurance}</p>
        </div>

        <HeroImage t={t} className="relative hidden lg:block reveal reveal-delay-1" />
      </div>
    </section>
  );
}

function ValueProposition({ t }) {
  return (
    <section id="value" className="section-spacious section-surface-light relative">
      <div className="section-shell">
        <h2 className="max-w-5xl reveal">
          {t.value.statement}
        </h2>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {t.value.features.map((item, index) => {
            const Icon = item.icon;
            return (
              <article key={item.text} className={`feature-item reveal reveal-delay-${Math.min(index, 2)}`}>
                <span className="feature-icon">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <p>{item.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Services({ t, onBook }) {
  const [openService, setOpenService] = useState(null);

  const toggleService = (serviceNumber) => {
    setOpenService((currentService) => (currentService === serviceNumber ? null : serviceNumber));
  };

  return (
    <section id="services" className="section-spacious section-surface-warm">
      <div className="section-shell">
        <div className="mx-auto max-w-3xl text-center reveal">
          <h2>
            <RichText parts={t.servicesIntro.title} />
          </h2>
        </div>

        <div className="services-intro-rule reveal" aria-hidden="true" />

        <p className="mx-auto mt-6 max-w-2xl text-center text-forest/70 reveal">
          {t.servicesIntro.body}
        </p>

        <div className="mx-auto mt-10 max-w-4xl">
          {t.services.map((service) => {
            const isOpen = openService === service.id;
            const panelId = `service-panel-${service.id}`;
            const headingId = `service-heading-${service.id}`;
            const ServiceIcon = service.icon;

            return (
              <article
                key={service.id}
                className="service-row reveal"
                data-open={isOpen ? 'true' : 'false'}
                onClick={() => toggleService(service.id)}
              >
                <div className="service-meta">
                  <small className="service-label">{service.subtitle}</small>
                </div>

                <div className="service-main">
                  <div className="service-title-row">
                    <ServiceIcon className="service-title-icon" size={20} aria-hidden="true" />
                    <h3 id={headingId}>
                      <RichText parts={service.title} />
                    </h3>
                  </div>
                  <p className="service-body">{service.body}</p>

                  <div
                    id={panelId}
                    className="service-accordion-panel"
                    data-open={isOpen ? 'true' : 'false'}
                    aria-hidden={!isOpen}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="service-accordion-inner">
                      <ul className="service-detail-list">
                        {service.details.map((detail) => (
                          <li key={detail}>{detail}</li>
                        ))}
                      </ul>
                      <div className="service-price-row">
                        <span className="service-price">{service.price}</span>
                        <button
                          className="button-primary px-4 py-2.5 text-xs"
                          type="button"
                          tabIndex={isOpen ? 0 : -1}
                          onClick={(event) => {
                            event.stopPropagation();
                            onBook();
                          }}
                        >
                          {t.cta.consultation}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  className="service-toggle-button"
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  aria-labelledby={headingId}
                >
                  <span className="service-toggle-icon" aria-hidden="true">
                    <ChevronDown size={18} />
                  </span>
                </button>
              </article>
            );
          })}
        </div>

        <nav className="service-page-nav reveal" aria-label="Lokale Leistungsseiten">
          <div className="service-page-nav-heading">
            <h3>{t.localServices.title}</h3>
            <p>{t.localServices.body}</p>
          </div>
          <small>{t.localServices.label}</small>
          <div className="service-page-link-grid">
            {seoPages.map((page) => (
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

function Specialization({ t }) {
  return (
    <section className="section-spacious section-surface-cream">
      <div className="section-shell">
        <div className="mx-auto max-w-3xl text-center reveal">
          <h2>{t.specialization.title}</h2>
          <p className="mt-4 text-forest/60">{t.specialization.body}</p>
        </div>

        <div className="specialization-grid reveal reveal-delay-1">
          {t.specialization.cards.map((card) => (
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
            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1100&q=82"
            alt={t.about.founderImageAlt}
            loading="lazy"
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
            {/* TODO: Confirm principal name before launch. */}
            <p className="principal-name">{t.about.principalName}</p>
            {/* TODO: Confirm exact title and role before launch. */}
            <p className="principal-role">{t.about.principalRole}</p>
            {/* TODO: Confirm KSW membership wording and registration field before launch. */}
            <p className="principal-registration">{t.about.principalRegistration}</p>
          </div>
          <div className="mt-6 space-y-5 text-forest/75">
            {t.about.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqStructuredData({ items }) {
  const schema = useMemo(
    () =>
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      }),
    [items],
  );

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />;
}

function FaqAccordion({ items, idPrefix = 'faq' }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="faq-list reveal reveal-delay-1">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `${idPrefix}-panel-${index}`;

        return (
          <article key={item.question} className="faq-item" data-open={isOpen ? 'true' : 'false'}>
            <h3>
              <button
                className="faq-trigger"
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex((currentIndex) => (currentIndex === index ? null : index))}
              >
                <span className="faq-question">{item.question}</span>
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
            >
              <div className="faq-panel-inner">
                <p>{item.answer}</p>
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
    <>
      <FaqStructuredData items={t.faq.items} />
      <section id="faq" className="section-spacious section-surface-cream">
        <div className="section-shell faq-layout">
          <div className="faq-intro reveal">
            <h2>
              <RichText parts={t.faq.title} />
            </h2>
            <p className="mt-5 text-forest/70">{t.faq.body}</p>
          </div>

          <FaqAccordion items={t.faq.items} idPrefix="home-faq" />
        </div>
      </section>
    </>
  );
}

function AccountingServiceStructuredData({ routePath }) {
  const schema = useMemo(
    () =>
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'AccountingService',
        name: 'MINO Consulting KG',
        url: getCanonicalUrl(routePath),
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Geblergasse 95/8',
          postalCode: '1170',
          addressLocality: 'Wien',
          addressCountry: 'AT',
        },
        areaServed: {
          '@type': 'City',
          name: 'Wien',
        },
      }),
    [routePath],
  );

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />;
}

function SeoLandingPageStructuredData({ page }) {
  const schema = useMemo(
    () =>
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: page.title,
        description: page.metaDescription,
        url: getCanonicalUrl(page.path),
        isPartOf: {
          '@type': 'WebSite',
          name: 'MINO Consulting KG',
          url: getCanonicalUrl('/'),
        },
        about: {
          '@type': 'AccountingService',
          name: 'MINO Consulting KG',
        },
      }),
    [page],
  );

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />;
}

function SeoLandingPage({ page, onBook }) {
  const relatedPages = page.related.map((path) => seoPagesByPath[path]).filter(Boolean);

  return (
    <>
      <SeoLandingPageStructuredData page={page} />
      <FaqStructuredData items={page.faq} />

      <section id="top" className="seo-hero-section section-surface-warm">
        <div className="section-shell seo-hero-layout">
          <div className="reveal">
            <small className="tag-pill">
              <MapPin size={14} aria-hidden="true" />
              {page.eyebrow}
            </small>
            <h1 className="mt-5">{page.h1}</h1>
            <p className="mt-5 max-w-2xl text-forest/75">{page.intro}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row" data-hero-cta>
              <button className="button-primary" type="button" onClick={onBook}>
                Erstgespräch vereinbaren
                <ArrowRight size={16} aria-hidden="true" />
              </button>
              <a className="button-secondary" href="#contact">
                Kontakt aufnehmen
              </a>
            </div>
          </div>

          <aside className="seo-hero-note reveal reveal-delay-1" aria-label="Lokaler Fokus">
            <small>Fokus</small>
            <p>Beratung für Wien, Gründer, Selbstständige und KMU mit klaren Abläufen und persönlicher Abstimmung.</p>
          </aside>
        </div>
      </section>

      <section className="section-spacious section-surface-light">
        <div className="section-shell seo-two-column">
          <article className="seo-info-block reveal">
            <small>{page.whoForTitle}</small>
            <ul className="seo-check-list">
              {page.whoFor.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="seo-info-block reveal reveal-delay-1">
            <small>{page.includedTitle}</small>
            <ul className="seo-check-list">
              {page.included.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="section-spacious section-surface-cream">
        <div className="section-shell">
          <div className="max-w-3xl reveal">
            <small>Prozess</small>
            <h2 className="mt-4">{page.processTitle}</h2>
          </div>

          <ol className="seo-process-list">
            {page.process.map((step, index) => (
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

      <section className="section-spacious section-surface-light">
        <div className="section-shell faq-layout">
          <div className="faq-intro reveal">
            <small>FAQ</small>
            <h2 className="mt-4">Häufige Fragen zu {page.eyebrow}</h2>
            <p className="mt-5 text-forest/70">Konkrete Antworten für Unternehmen und Selbstständige in Wien.</p>
          </div>

          <FaqAccordion items={page.faq} idPrefix={`seo-${page.path.slice(1)}`} />
        </div>
      </section>

      <section className="section-spacious section-surface-warm">
        <div className="section-shell">
          <div className="seo-cta-panel reveal">
            <div>
              <small>Nächster Schritt</small>
              <h2 className="mt-4">{page.ctaTitle}</h2>
              <p className="mt-5 text-forest/75">{page.ctaBody}</p>
            </div>
            <div className="seo-cta-actions">
              <button className="button-primary" type="button" onClick={onBook}>
                Erstgespräch vereinbaren
                <ArrowRight size={16} aria-hidden="true" />
              </button>
              <a className="button-secondary" href="#contact">
                Kontaktdaten ansehen
              </a>
            </div>
          </div>

          <nav className="seo-related-links reveal" aria-label="Verwandte lokale Leistungsseiten">
            <small>Verwandte Seiten</small>
            <div className="seo-related-grid">
              <a className="seo-related-link" href={getRouteHref('/')}>
                Startseite
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
              {relatedPages.map((relatedPage) => (
                <a key={relatedPage.path} className="seo-related-link" href={getRouteHref(relatedPage.path)}>
                  {relatedPage.eyebrow}
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

function LegalPage({ page }) {
  return (
    <section id="top" className="section-spacious section-surface-light">
      <div className="section-shell legal-page">
        <div className="max-w-3xl reveal">
          <small className="tag-pill">Rechtliches</small>
          <h1 className="mt-5">{page.h1}</h1>
          <p className="mt-5 text-forest/70">{page.intro}</p>
        </div>

        <div className="legal-section-grid reveal reveal-delay-1">
          {page.sections.map((section) => {
            const sectionId = `legal-${section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

            return (
              <section className="legal-section" key={section.title} aria-labelledby={sectionId}>
                <h2 id={sectionId}>{section.title}</h2>
                <ul>
                  {section.items.map((item) => (
                    <li key={item}>{renderLegalItem(item)}</li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Contact({ t, onBook, routePath }) {
  const contactDetails = t.contact.cards.filter((item) => item.icon !== CalendarDays);

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
              const Icon = item.icon;
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
              href="https://www.google.com/maps/search/?api=1&query=Geblergasse%2095%2F8%2C%201170%20Wien"
              target="_blank"
              rel="noreferrer"
            >
              Google Maps
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
          <div className="map-frame">
            <iframe
              title={t.contact.mapTitle}
              src="https://www.google.com/maps?q=Geblergasse%2095%2F8%2C%201170%20Wien&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>

        <div className="footer-bottom-bar">
          {/* TODO: Replace FN placeholder with verified Firmenbuchnummer before launch. */}
          {/* TODO: Replace UID placeholder with verified UID number before launch. */}
          <p>
            © {new Date().getFullYear()} MINO Consulting KG · Geblergasse 95/8 · 1170 Wien · FN [Firmenbuchnummer] · UID ATU[Nummer]
          </p>
          <div className="footer-bottom-links">
            {t.nav.map((item) => (
              <a className="hover:text-white" href={resolveNavHref(item.href, routePath)} key={item.href}>
                {item.label}
              </a>
            ))}
            <a className="hover:text-white" href={getRouteHref('/impressum')}>
              Impressum
            </a>
            <a className="hover:text-white" href={getRouteHref('/datenschutzerklaerung')}>
              Datenschutz
            </a>
            <a className="hover:text-white" href="#top">
              {t.contact.backTop}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function BookingModal({ t, language, isOpen, onClose }) {
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const googleRatingText = getGoogleRatingText(language);
  const initialForm = useMemo(
    () => ({
      service: t.booking.services[0],
      mode: t.booking.modes[0],
      date: '',
      time: '',
      name: '',
      company: '',
      email: '',
      phone: '',
      message: '',
    }),
    [t],
  );
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setForm(initialForm);
      setError('');
      setSubmitted(false);
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [initialForm, isOpen]);

  if (!isOpen) return null;

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.service || !form.date || !form.time || !form.name || !form.email) {
      setError(t.booking.required);
      return;
    }

    setSubmitted(true);
  };

  const emailBody = [
    `${t.booking.serviceLabel}: ${form.service}`,
    `${t.booking.modeLabel}: ${form.mode}`,
    `${t.booking.dateLabel}: ${form.date}`,
    `${t.booking.timeLabel}: ${form.time}`,
    `${t.booking.nameLabel}: ${form.name}`,
    `${t.booking.companyLabel}: ${form.company || '-'}`,
    `${t.booking.emailLabel}: ${form.email}`,
    `${t.booking.phoneLabel}: ${form.phone || '-'}`,
    `${t.booking.messageLabel}: ${form.message || '-'}`,
  ].join('\n');

  const mailtoHref = `mailto:office@mino-consulting.at?subject=${encodeURIComponent(
    language === 'de' ? 'Terminanfrage MINO Consulting KG' : 'Upit za termin MINO Consulting KG',
  )}&body=${encodeURIComponent(emailBody)}`;

  return (
    <div className="booking-overlay" role="dialog" aria-modal="true" aria-labelledby="booking-title">
      <div className="booking-panel">
        <div className="flex items-start justify-between gap-5 border-b border-forest/50 p-5 sm:p-6">
          <div>
            <small className="tag-pill">
              <CalendarDays size={14} aria-hidden="true" />
              {t.cta.book}
            </small>
            <h2 id="booking-title" className="mt-4">
              {t.booking.title}
            </h2>
            <p className="mt-3 max-w-2xl text-forest/70">{t.booking.intro}</p>
          </div>
          <button className="hamburger-button shrink-0" type="button" onClick={onClose} aria-label={t.booking.close}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {submitted ? (
          <div className="p-5 sm:p-6">
            <h3>{t.booking.successTitle}</h3>
            <p className="mt-3 text-forest/70">{t.booking.successBody}</p>
            <dl className="mt-6 grid gap-3 rounded-md border border-forest/50 bg-cream p-4 text-sm sm:grid-cols-2">
              {[
                [t.booking.serviceLabel, form.service],
                [t.booking.modeLabel, form.mode],
                [t.booking.dateLabel, form.date],
                [t.booking.timeLabel, form.time],
                [t.booking.nameLabel, form.name],
                [t.booking.emailLabel, form.email],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-bold uppercase tracking-[0.14em] text-forest/50">{label}</dt>
                  <dd className="mt-1 font-semibold text-forest">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a className="button-primary" href={mailtoHref}>
                {t.booking.sendEmail}
                <Mail size={16} aria-hidden="true" />
              </a>
              <button className="button-secondary" type="button" onClick={() => setSubmitted(false)}>
                {t.booking.newRequest}
              </button>
            </div>
          </div>
        ) : (
          <form className="grid gap-5 p-5 sm:p-6" onSubmit={handleSubmit}>
            <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
              <div className="space-y-5">
                <label className="form-field">
                  <span>{t.booking.serviceLabel}</span>
                  <select value={form.service} onChange={(event) => updateField('service', event.target.value)}>
                    {t.booking.services.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                </label>

                <div>
                  <small className="form-label">{t.booking.modeLabel}</small>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {t.booking.modes.map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        className={`choice-button ${form.mode === mode ? 'is-active' : ''}`}
                        onClick={() => updateField('mode', mode)}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="form-field">
                    <span>{t.booking.dateLabel}</span>
                    <input
                      type="date"
                      min={today}
                      value={form.date}
                      onChange={(event) => updateField('date', event.target.value)}
                    />
                  </label>
                  <div>
                    <small className="form-label">{t.booking.timeLabel}</small>
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          className={`choice-button ${form.time === slot ? 'is-active' : ''}`}
                          onClick={() => updateField('time', slot)}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <label className="form-field">
                  <span>{t.booking.nameLabel}</span>
                  <input value={form.name} onChange={(event) => updateField('name', event.target.value)} />
                </label>
                <label className="form-field">
                  <span>{t.booking.companyLabel}</span>
                  <input value={form.company} onChange={(event) => updateField('company', event.target.value)} />
                </label>
                <label className="form-field">
                  <span>{t.booking.emailLabel}</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField('email', event.target.value)}
                  />
                </label>
                <label className="form-field">
                  <span>{t.booking.phoneLabel}</span>
                  <input value={form.phone} onChange={(event) => updateField('phone', event.target.value)} />
                </label>
              </div>
            </div>

            <label className="form-field">
              <span>{t.booking.messageLabel}</span>
              <textarea
                value={form.message}
                placeholder={t.booking.messagePlaceholder}
                onChange={(event) => updateField('message', event.target.value)}
              />
            </label>

            {error && <p className="rounded-md border border-rose bg-rose-light px-4 py-3 text-rose">{error}</p>}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button className="button-secondary" type="button" onClick={onClose}>
                {t.booking.close}
              </button>
              <button className="button-primary" type="submit">
                {t.booking.submit}
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="booking-trust-row" aria-label="Booking trust information">
              <span className="booking-trust-item">
                <Lock size={13} aria-hidden="true" />
                {t.booking.securityText}
              </span>
              <span className="booking-response-pill">{t.booking.responseBadge}</span>
              {googleRatingText && (
                <span className="booking-trust-item">
                  <span className="booking-stars" aria-hidden="true">
                    {Array.from({ length: trustProofConfig.googleStars }).map((_, index) => (
                      <Star key={index} size={13} />
                    ))}
                  </span>
                  {googleRatingText}
                </span>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [language, setLanguage] = useState('de');
  const [bookingOpen, setBookingOpen] = useState(false);
  const routePath = useCurrentRoutePath();
  const seoPage = seoPagesByPath[routePath];
  const legalPage = legalPagesByPath[routePath];
  const activeLanguage = seoPage || legalPage ? 'de' : language;
  const t = content[activeLanguage];
  const currentTitle = seoPage ? seoPage.title : legalPage ? legalPage.title : t.pageTitle;
  const currentDescription = seoPage
    ? seoPage.metaDescription
    : legalPage
      ? legalPage.metaDescription
    : 'MINO Consulting KG bietet Buchhaltung, Lohnverrechnung, Steuerberatung, Auswertungen und Unternehmensberatung in Wien.';
  const canonicalPath = seoPage ? seoPage.path : legalPage ? legalPage.path : '/';
  const showDelayedStickyHeader = useDelayedStickyHeader();

  useScrollReveal();

  useEffect(() => {
    document.documentElement.lang = activeLanguage === 'de' ? 'de' : 'bs';
    document.title = currentTitle;
    setMetaContent('meta[name="description"]', currentDescription);
    setMetaContent('meta[property="og:title"]', currentTitle);
    setMetaContent('meta[property="og:description"]', currentDescription);
    setMetaContent('meta[property="og:type"]', 'website');
    setMetaContent('meta[property="og:url"]', getCanonicalUrl(canonicalPath));
    setCanonicalHref(getCanonicalUrl(canonicalPath));
  }, [activeLanguage, canonicalPath, currentDescription, currentTitle]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-cream text-forest">
      <div className="architect-grid" aria-hidden="true" />
      <div className="relative z-10">
        <AccountingServiceStructuredData routePath={canonicalPath} />
        <Header
          t={t}
          language={activeLanguage}
          setLanguage={setLanguage}
          onBook={() => setBookingOpen(true)}
          routePath={routePath}
          showLanguageSwitcher={!seoPage && !legalPage}
        />
        <DelayedStickyHeader
          t={t}
          language={activeLanguage}
          setLanguage={setLanguage}
          onBook={() => setBookingOpen(true)}
          isVisible={showDelayedStickyHeader}
          routePath={routePath}
          showLanguageSwitcher={!seoPage && !legalPage}
        />
        <main>
          {legalPage ? (
            <LegalPage page={legalPage} />
          ) : seoPage ? (
            <SeoLandingPage page={seoPage} onBook={() => setBookingOpen(true)} />
          ) : (
            <>
              <Hero t={t} onBook={() => setBookingOpen(true)} />
              <ValueProposition t={t} />
              <Services t={t} onBook={() => setBookingOpen(true)} />
              <Specialization t={t} />
              <About t={t} />
              <FaqSection t={t} />
            </>
          )}
        </main>
        <Contact t={t} onBook={() => setBookingOpen(true)} routePath={routePath} />
      </div>
      <BookingModal t={t} language={activeLanguage} isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </div>
  );
}
