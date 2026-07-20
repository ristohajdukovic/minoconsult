import { CONTACT_EMAIL, MOBILE_PHONE, OFFICE_ADDRESS, OFFICE_PHONE } from '../../config/site.js';

const home = {
  language: 'de',
  pageTitle: 'MINO Consulting KG | Steuerberatung und Buchhaltung in Wien',
  metaDescription: 'Buchhaltung, Lohnverrechnung und Steuerberatung in Wien. Informieren Sie sich über Leistungen und fragen Sie ein Erstgespräch bei MINO Consulting KG an.',
  meta: {
    languageLabel: 'Sprache',
    menuLabel: 'Navigation umschalten',
    appointmentAria: 'Erstgespräch bei MINO Consulting KG anfragen',
    skipLink: 'Zum Hauptinhalt springen',
    primaryNavigationLabel: 'Hauptnavigation',
    stickyNavigationLabel: 'Fixierte Hauptnavigation',
    mobileNavigationLabel: 'Mobile Navigation',
    newWindow: 'öffnet in einem neuen Tab',
  },
  nav: [
    { label: 'Leistungen', href: '#services' },
    { label: 'Über uns', href: '#about' },
    { label: 'Kontakt', href: '#contact' },
  ],
  cta: {
    contact: 'Kontakt', book: 'Erstgespräch anfragen', call: 'Anrufen',
    consultation: 'Erstgespräch anfragen', scroll: 'Scrollen', learnMore: 'Mehr erfahren',
    callAria: 'MINO Consulting anrufen',
  },
  hero: {
    label: 'Buchhaltung und Steuerberatung · Wien',
    title: [
      { text: 'Buchhaltung und ' }, { text: 'Steuerberatung', em: true },
      { text: ' für Unternehmen in Wien' },
    ],
    body: 'MINO Consulting KG unterstützt bei laufender Buchhaltung, Lohnverrechnung, Steuerfragen, Jahresabschluss und dem steuerlichen Start eines Unternehmens. In einem Erstgespräch klären wir, welche Leistung und welche Unterlagen zu Ihrer Situation passen.',
    imageAlt: '',
  },
  value: {
    statement: 'Wenn Belege fehlen, Fristen näher rücken oder aktuelle Zahlen nicht greifbar sind, wird aus einer laufenden Pflicht schnell ein betriebliches Problem. MINO ordnet mit Ihnen, was vorliegt, was fehlt und welche Leistung benötigt wird.',
    features: [
      { icon: 'briefcase', text: 'Laufende Geschäftsfälle, Bankbewegungen und Belege werden für die vereinbarte Buchhaltung vorbereitet und verarbeitet.' },
      { icon: 'shield', text: 'Bei Steuerfragen werden die konkrete Ausgangslage, vorhandene Unterlagen und maßgebliche Fristen gemeinsam eingeordnet.' },
      { icon: 'file', text: 'Für Lohnverrechnung und Jahresabschluss hängt ein verlässlicher Ablauf von vollständigen und rechtzeitig übermittelten Angaben ab.' },
      { icon: 'check', text: 'Bei einer Gründung klären wir steuerliche und buchhalterische Fragen; Rechts- und Notariatsleistungen sind davon getrennt.' },
    ],
  },
  servicesIntro: {
    title: [{ text: 'Leistungen für ' }, { text: 'laufende Pflichten und konkrete Fragen', em: true }],
    body: 'Die Übersichten zeigen, wobei MINO unterstützen kann. Der tatsächliche Umfang wird anhand Ihrer Unterlagen und Ihrer betrieblichen Situation vereinbart.',
  },
  services: [
    {
      id: 'bookkeeping-payroll', title: [{ text: 'Buchhaltung & ' }, { text: 'Lohnverrechnung', em: true }],
      subtitle: 'Laufende Geschäftsfälle', body: 'Verbuchung laufender Geschäftsfälle, Belegorganisation und Abstimmung offener Fragen. Die Lohnverrechnung wird als eigene Leistung erläutert.',
      path: '/buchhaltung-wien',
    },
    {
      id: 'tax-advice', title: [{ text: 'Steuerberatung & Vertretung' }], subtitle: 'Finanzamt & Erklärungen',
      body: 'Einordnung von Steuerfragen, Vorbereitung von Erklärungen und Kommunikation mit dem österreichischen Finanzamt im vereinbarten Umfang.', path: '/steuerberatung-wien',
    },
    {
      id: 'payroll', title: [{ text: 'Lohnverrechnung' }], subtitle: 'Mitarbeiterdaten und Abrechnung',
      body: 'Vorbereitung laufender Lohn- und Gehaltsabrechnungen auf Grundlage der rechtzeitig bereitgestellten Stamm- und Änderungsdaten.', path: '/lohnverrechnung-wien',
    },
    {
      id: 'annual-accounts', title: [{ text: 'Jahresabschluss & Reporting' }], subtitle: 'Abschluss & Auswertung',
      body: 'Abstimmung der Abschlussunterlagen, Klärung offener Buchhaltungspunkte und Besprechung der Ergebnisse und nächsten Pflichten.', path: '/jahresabschluss-wien',
    },
    {
      id: 'company-formation', title: [{ text: 'Gründung & Unternehmensberatung' }], subtitle: 'Start in Österreich',
      body: 'Steuerliche Einordnung und Aufbau von Buchhaltungsabläufen vor oder nach dem Start. Rechtliche und notarielle Leistungen sind nicht Teil dieser Beschreibung.', path: '/unternehmensgruendung-wien',
    },
  ],
  process: {
    label: 'Von der Anfrage zum Gespräch',
    title: 'So funktioniert die Terminanfrage',
    body: 'Die Website bereitet Ihre Angaben für Ihr eigenes E-Mail-Programm vor und reserviert keinen Termin.',
    steps: [
      { title: 'Anfrage vorbereiten', body: 'Sie nennen Thema, Gesprächsformat und Terminwunsch und öffnen die vorbereitete E-Mail. Alternativ können Sie anrufen.' },
      { title: 'Bestätigung abwarten', body: 'Der Termin ist erst verbindlich, nachdem MINO Consulting KG ihn separat bestätigt hat.' },
      { title: 'Bedarf besprechen', body: 'Im Gespräch werden Ausgangslage, benötigte Unterlagen und ein möglicher Leistungsumfang geklärt.' },
    ],
  },
  clientFit: {
    title: 'Wann ein Erstgespräch sinnvoll sein kann', body: 'Diese Situationen entsprechen den auf der Website beschriebenen Leistungen. Ob MINO den konkreten Auftrag übernehmen kann, wird erst nach Prüfung der Anfrage geklärt.',
    cards: [
      { title: 'Laufende Unterlagen ordnen', body: 'Belege, Bankbewegungen oder offene Buchhaltungspunkte sollen in einen vereinbarten Arbeitsablauf gebracht werden.' },
      { title: 'Mitarbeiter abrechnen', body: 'Für die laufende Lohnverrechnung müssen Stamm- und Monatsdaten vollständig und fristgerecht zusammengeführt werden.' },
      { title: 'Gründung oder Wechsel vorbereiten', body: 'Steuerliche Fragen und das künftige Buchhaltungssetup sollen vor dem Start oder einer möglichen Übergabe geklärt werden.' },
    ],
  },
  localServices: { title: 'Leistungen im Detail', body: 'Jede Seite erklärt Zweck, benötigte Unterlagen, Ablauf und Abgrenzungen der jeweiligen Leistung.', label: 'Leistungsübersicht' },
  about: {
    badge: 'Über MINO', founderImageAlt: '', principalName: 'Mag. Tomislav Siketic',
    principalRole: 'Steuerberater', principalRegistration: 'Berufsrechtliche Angaben im Impressum',
    title: [{ text: 'MINO Consulting KG in ' }, { text: '1170 Wien', em: true }],
    paragraphs: [
      'MINO Consulting KG ist unter FN 157894y beim Handelsgericht Wien eingetragen. Die Kanzlei befindet sich in der Geblergasse 95/8, 1170 Wien.',
      'Auf dieser Website werden Buchhaltung, Lohnverrechnung, Steuerberatung, Jahresabschluss sowie steuerliche und buchhalterische Fragen rund um eine Gründung beschrieben.',
      'Zuständigkeit, Leistungsumfang und benötigte Unterlagen werden für jede Anfrage gesondert geklärt.',
    ],
    legalLinkLabel: 'Berufs- und Unternehmensangaben im Impressum',
  },
  faq: {
    title: [{ text: 'Häufig gestellte ' }, { text: 'Fragen', em: true }],
    body: 'Antworten zu Unterlagen, Terminanfrage und Leistungsumfang.',
    items: [
      { question: 'Welche Unterlagen braucht MINO Consulting KG für die laufende Buchhaltung?', answer: 'In der Regel genügen Ausgangs- und Eingangsrechnungen, Bankunterlagen, Belege, Kassa-Daten und relevante Verträge. Im Erstgespräch klären wir den konkreten Bedarf und einen effizienten Austausch.' },
      { question: 'Ist die Terminanfrage bereits eine Buchung?', answer: 'Nein. Datum, Zeitraum und Gesprächsformat sind Wünsche. Ein Termin ist erst verbindlich, nachdem MINO Consulting KG ihn separat bestätigt hat.' },
      { question: 'Kann ich einen Wechsel von einer anderen Steuerberatung anfragen?', answer: 'Ja, Sie können die geplante Übergabe als Thema angeben. Ob und zu welchem Zeitpunkt eine Übernahme möglich ist und welche Unterlagen benötigt werden, wird anschließend gesondert geklärt.' },
      { question: 'Findet das Gespräch online, telefonisch oder in Wien statt?', answer: 'Im Anfrageformular können Sie ein bevorzugtes Format auswählen. Das tatsächliche Format wird zusammen mit dem Termin bestätigt.' },
      { question: 'Wie wird der Preis einer Leistung bestimmt?', answer: 'Der Aufwand hängt unter anderem von Leistungsumfang, Unterlagen und laufendem Bearbeitungsbedarf ab. Verbindliche Preise oder Pauschalen werden auf der Website derzeit nicht genannt.' },
      { question: 'Werden derzeit neue Mandate angenommen?', answer: 'Eine Terminanfrage ist noch keine Annahme eines Mandats. MINO Consulting KG prüft die Anfrage und meldet sich dazu gesondert zurück.' },
    ],
  },
  contact: {
    title: [{ text: 'Besprechen wir, welche ' }, { text: 'Unterstützung Sie benötigen', em: true }],
    body: 'Nennen Sie Thema, Gesprächsformat und Terminwunsch. Die Website bereitet eine E-Mail vor; Sie können auch direkt anrufen.',
    reassurance: 'Ihre Anfrage wird persönlich geprüft. Ein Termin gilt erst nach einer separaten Bestätigung.', button: 'Terminanfrage vorbereiten',
    cards: [
      { icon: 'mail', label: 'E-Mail', value: CONTACT_EMAIL },
      { icon: 'phone', label: 'Büro', value: OFFICE_PHONE },
      { icon: 'smartphone', label: 'Mobil', value: MOBILE_PHONE },
      { icon: 'map', label: 'Adresse', value: OFFICE_ADDRESS },
    ],
    mapTitle: 'Standort in Wien', mapAddress: OFFICE_ADDRESS, backTop: 'Nach oben', mapLink: 'Adresse in Google Maps öffnen',
    legalLinks: { imprint: 'Impressum', privacy: 'Datenschutz' },
  },
  mapConsent: {
    title: 'Standort in Wien',
    explanation: 'Beim Laden der Karte wird eine Verbindung zu Google hergestellt. Dabei können Daten wie Ihre IP-Adresse an Google übertragen werden.',
    load: 'Google Maps laden',
    enabled: 'Google Maps ist aktiviert.',
    disable: 'Google Maps deaktivieren',
    loading: 'Google Maps wird geladen …',
    error: 'Die Karte konnte nicht geladen werden. Sie können es erneut versuchen oder die Adresse über den externen Google-Maps-Link öffnen.',
    retry: 'Karte erneut laden',
  },
  privacySettings: {
    button: 'Datenschutzeinstellungen', title: 'Datenschutzeinstellungen',
    intro: 'Sie entscheiden, ob die optionale Google-Maps-Karte auf dieser Website geladen werden darf.',
    googleMapsLabel: 'Google Maps', enabled: 'Aktiviert', disabled: 'Deaktiviert', save: 'Auswahl speichern', close: 'Ohne Änderung schließen',
  },
  booking: {
    title: 'Erstgespräch anfragen', intro: 'Wählen Sie Thema, bevorzugtes Gesprächsformat, Datum und Zeitraum und geben Sie Name und E-Mail-Adresse an. Die Website bereitet daraus eine Nachricht für Ihr E-Mail-Programm vor; sie speichert oder sendet das Formular nicht selbst.',
    serviceLabel: 'Beratungsthema', modeLabel: 'Format', dateLabel: 'Bevorzugtes Datum', timeLabel: 'Bevorzugter Zeitraum', nameLabel: 'Name', companyLabel: 'Unternehmen (optional)', emailLabel: 'E-Mail', phoneLabel: 'Telefon (optional)', messageLabel: 'Nachricht (optional)',
    messagePlaceholder: 'Kurz beschreiben, wobei Sie Unterstützung benötigen.', submit: 'Anfrage prüfen', sendEmail: 'E-Mail-Anfrage öffnen', callOffice: 'Jetzt anrufen', copySummary: 'Zusammenfassung kopieren', editRequest: 'Angaben bearbeiten', newRequest: 'Neue Anfrage', close: 'Schließen',
    copySuccess: 'Zusammenfassung kopiert.', copyFailure: 'Die Zusammenfassung konnte nicht automatisch kopiert werden. Markieren und kopieren Sie die Angaben oben oder verwenden Sie die E-Mail-Adresse.',
    emailFallback: 'Falls sich Ihr E-Mail-Programm nicht öffnet, bleibt die Zusammenfassung hier sichtbar. Sie können sie kopieren oder direkt an die folgende Adresse senden:',
    disclaimer: 'Der gewünschte Termin ist erst nach einer Bestätigung durch MINO Consulting KG verbindlich.',
    securityText: 'Datenschutzhinweise zur Terminanfrage', responseBadge: 'Separate Terminbestätigung erforderlich',
    required: 'Dieses Feld ist erforderlich.', invalidEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
    errorSummary: 'Bitte überprüfen Sie die markierten Felder.', successTitle: 'Ihre Terminanfrage wurde vorbereitet.',
    successBody: 'Prüfen Sie Ihre Angaben und öffnen Sie anschließend die vorbereitete E-Mail. Der Termin wird erst nach einer Rückmeldung von MINO Consulting KG bestätigt.',
    modes: ['Online', 'Vor Ort', 'Telefonisch'],
    periods: ['08:00–10:00', '10:00–12:00', '12:00–14:00', '14:00–16:00', 'Zeitlich flexibel'],
    services: ['Allgemeines Erstgespräch', 'Buchhaltung', 'Lohnverrechnung', 'Steuerberatung', 'Jahresabschluss', 'Steuerfragen zur Gründung'],
  },
};

export default home;
