import { CONTACT_EMAIL, MOBILE_PHONE, OFFICE_ADDRESS, OFFICE_PHONE } from '../../config/site.js';

const home = {
  language: 'hr',
  pageTitle: 'MINO Consulting KG | Knjigovodstvo i porezno savjetovanje u Beču',
  metaDescription: 'Knjigovodstvo, obračun plaća i porezno savjetovanje u Beču. Informirajte se o uslugama i zatražite prvi razgovor s MINO Consulting KG.',
  meta: {
    languageLabel: 'Jezik', menuLabel: 'Otvori navigaciju',
    appointmentAria: 'Zatražite prvi razgovor s MINO Consulting KG',
    skipLink: 'Preskoči na glavni sadržaj',
    primaryNavigationLabel: 'Glavna navigacija',
    stickyNavigationLabel: 'Fiksna glavna navigacija',
    mobileNavigationLabel: 'Mobilna navigacija',
    newWindow: 'otvara se u novoj kartici',
  },
  nav: [
    { label: 'Usluge', href: '#services' },
    { label: 'O nama', href: '#about' },
    { label: 'Kontakt', href: '#contact' },
  ],
  cta: {
    contact: 'Kontakt', book: 'Zatražite prvi razgovor', call: 'Nazovite nas',
    consultation: 'Zatražite prvi razgovor', scroll: 'Dalje', learnMore: 'Saznajte više',
    callAria: 'Nazovite MINO Consulting',
  },
  hero: {
    label: 'Knjigovodstvo i porezno savjetovanje · Beč',
    title: [{ text: 'Knjigovodstvo i ' }, { text: 'porezno savjetovanje', em: true }, { text: ' za poduzeća u Beču' }],
    body: 'MINO Consulting KG pruža podršku pri tekućem knjigovodstvu, obračunu plaća, poreznim pitanjima, godišnjem obračunu te poreznom i knjigovodstvenom početku poslovanja. Na prvom razgovoru utvrđujemo koja usluga i dokumentacija odgovaraju vašoj situaciji.',
    imageAlt: '',
  },
  value: {
    statement: 'Kada nedostaju dokumenti, približavaju se rokovi ili aktualni podaci nisu dostupni, redovita obveza brzo postaje poslovni problem. S MINO-m utvrđujete što postoji, što nedostaje i koja je usluga potrebna.',
    features: [
      { icon: 'briefcase', text: 'Tekući poslovni događaji, bankovne transakcije i dokumenti pripremaju se i obrađuju u okviru dogovorenog knjigovodstva.' },
      { icon: 'shield', text: 'Kod poreznih pitanja zajedno se razmatraju konkretna situacija, raspoloživa dokumentacija i mjerodavni rokovi.' },
      { icon: 'file', text: 'Za obračun plaća i godišnji obračun važni su potpuni podaci dostavljeni u dogovorenom roku.' },
      { icon: 'check', text: 'Kod osnivanja razjašnjavamo porezna i knjigovodstvena pitanja; pravne i javnobilježničke usluge odvojene su od toga.' },
    ],
  },
  servicesIntro: {
    title: [{ text: 'Usluge za ' }, { text: 'redovite obveze i konkretna pitanja', em: true }],
    body: 'Pregledi pokazuju gdje MINO može pružiti podršku. Stvarni opseg dogovara se prema vašoj dokumentaciji i poslovnoj situaciji.',
  },
  services: [
    { id: 'bookkeeping-payroll', title: [{ text: 'Knjigovodstvo' }], subtitle: 'Tekući poslovni događaji', body: 'Knjiženje tekućih poslovnih događaja, organizacija dokumentacije i usklađivanje otvorenih pitanja. Obračun plaća objašnjen je kao zasebna usluga.', path: '/hr/knjigovodstvo-bec' },
    { id: 'tax-advice', title: [{ text: 'Porezno savjetovanje i zastupanje' }], subtitle: 'Finanzamt i prijave', body: 'Razmatranje poreznih pitanja, priprema prijava i komunikacija s austrijskom poreznom upravom (Finanzamt) u dogovorenom opsegu.', path: '/hr/porezni-savjetnik-bec' },
    { id: 'payroll', title: [{ text: 'Obračun plaća' }], subtitle: 'Podaci o zaposlenicima i obračun', body: 'Priprema redovitih obračuna plaća na temelju pravodobno dostavljenih matičnih podataka i mjesečnih promjena.', path: '/hr/obracun-placa-bec' },
    { id: 'annual-accounts', title: [{ text: 'Godišnji obračun i izvještavanje' }], subtitle: 'Završni račun i rezultat', body: 'Usklađivanje dokumentacije, razjašnjenje otvorenih knjigovodstvenih pitanja te razgovor o rezultatima i sljedećim obvezama.', path: '/hr/godisnji-obracun-bec' },
    { id: 'company-formation', title: [{ text: 'Osnivanje tvrtke' }], subtitle: 'Početak u Austriji', body: 'Porezno razmatranje i uspostava knjigovodstvenih postupaka prije ili nakon početka. Pravne i javnobilježničke usluge nisu dio ovog opisa.', path: '/hr/osnivanje-tvrtke-bec' },
  ],
  process: {
    label: 'Od upita do razgovora',
    title: 'Kako funkcionira upit za termin',
    body: 'Web-stranica priprema podatke za vaš program e-pošte i ne rezervira termin.',
    steps: [
      { title: 'Pripremite upit', body: 'Navodite temu, oblik i termin te otvarate pripremljenu e-poruku. Možete i nazvati.' },
      { title: 'Pričekajte potvrdu', body: 'Termin je obvezujući tek nakon zasebne potvrde društva MINO Consulting KG.' },
      { title: 'Razjasnite potrebe', body: 'U razgovoru se utvrđuju početna situacija, potrebna dokumentacija i mogući opseg usluge.' },
    ],
  },
  clientFit: {
    title: 'Kada prvi razgovor može biti koristan', body: 'Ove situacije odgovaraju uslugama opisanima na web-stranici. Može li MINO preuzeti konkretan angažman, utvrđuje se tek nakon pregleda upita.',
    cards: [
      { title: 'Organizacija tekuće dokumentacije', body: 'Dokumente, bankovne transakcije ili otvorena knjigovodstvena pitanja treba uključiti u dogovoreni postupak.' },
      { title: 'Obračun zaposlenika', body: 'Za redovit obračun plaća potrebno je potpuno i pravodobno objediniti matične podatke i mjesečne promjene.' },
      { title: 'Priprema osnivanja ili promjene savjetnika', body: 'Porezna pitanja i buduće knjigovodstvo treba razjasniti prije početka ili moguće primopredaje.' },
    ],
  },
  localServices: { title: 'Detalji usluga', body: 'Svaka stranica objašnjava svrhu, potrebnu dokumentaciju, postupak i granice pojedine usluge.', label: 'Pregled usluga' },
  about: {
    badge: 'O MINO', founderImageAlt: '', principalName: 'Mag. Tomislav Siketic',
    principalRole: 'Porezni savjetnik', principalRegistration: 'Strukovni podaci u impresumu',
    title: [{ text: 'MINO Consulting KG u ' }, { text: '1170 Beču', em: true }],
    paragraphs: [
      'MINO Consulting KG upisan je pod brojem FN 157894y pri Trgovačkom sudu u Beču. Ured se nalazi na adresi Geblergasse 95/8, 1170 Beč.',
      'Na ovoj web-stranici opisane su usluge knjigovodstva, obračuna plaća, poreznog savjetovanja, godišnjeg obračuna te porezna i knjigovodstvena pitanja pri osnivanju.',
      'Odgovornost, opseg usluge i potrebna dokumentacija utvrđuju se zasebno za svaki upit.',
    ],
    legalLinkLabel: 'Strukovni podaci i podaci o društvu u impresumu',
  },
  faq: {
    title: [{ text: 'Česta ' }, { text: 'pitanja', em: true }],
    body: 'Odgovori o dokumentaciji, upitu za termin i opsegu usluga.',
    items: [
      { question: 'Koju dokumentaciju MINO Consulting KG treba za tekuće knjigovodstvo?', answer: 'Najčešće su potrebni izlazni i ulazni računi, bankovni izvodi, blagajnički podaci i relevantni ugovori. Na prvom razgovoru dogovaramo konkretan opseg.' },
      { question: 'Je li upit za termin ujedno i rezervacija?', answer: 'Nije. Datum, razdoblje i oblik razgovora samo su vaše želje. Termin je obvezujući tek nakon zasebne potvrde društva MINO Consulting KG.' },
      { question: 'Mogu li poslati upit za promjenu dosadašnjeg poreznog savjetnika?', answer: 'Možete navesti planiranu primopredaju kao temu. Može li i kada MINO preuzeti angažman te koja je dokumentacija potrebna, utvrđuje se zasebno.' },
      { question: 'Održava li se razgovor putem interneta, telefonom ili u Beču?', answer: 'U obrascu možete odabrati željeni oblik. Stvarni oblik razgovora potvrđuje se zajedno s terminom.' },
      { question: 'Kako se određuje cijena usluge?', answer: 'Opseg rada ovisi, među ostalim, o vrsti usluge, dokumentaciji i redovitom potrebnom radu. Web-stranica trenutačno ne navodi obvezujuće cijene ni pakete.' },
      { question: 'Prima li ured trenutačno nove klijente?', answer: 'Upit za termin još nije prihvat angažmana. MINO Consulting KG pregledava upit i odgovara zasebno.' },
    ],
  },
  contact: {
    title: [{ text: 'Razgovarajmo o ' }, { text: 'podršci koja vam je potrebna', em: true }],
    body: 'Navedite temu, oblik razgovora i termin. Web-stranica priprema e-poruku; možete i izravno nazvati.',
    reassurance: 'Vaš se upit osobno pregledava. Termin vrijedi tek nakon zasebne potvrde.', button: 'Pripremite upit za termin',
    cards: [
      { icon: 'mail', label: 'E-pošta', value: CONTACT_EMAIL },
      { icon: 'phone', label: 'Ured', value: OFFICE_PHONE },
      { icon: 'smartphone', label: 'Mobilni telefon', value: MOBILE_PHONE },
      { icon: 'map', label: 'Adresa', value: OFFICE_ADDRESS },
    ],
    mapTitle: 'Lokacija u Beču', mapAddress: OFFICE_ADDRESS, backTop: 'Na vrh', mapLink: 'Otvori adresu u Google Mapsu',
    legalLinks: { imprint: 'Impresum', privacy: 'Pravila privatnosti' },
  },
  mapConsent: {
    title: 'Lokacija u Beču',
    explanation: 'Učitavanjem karte uspostavlja se veza s Googleom. Pritom se Googleu mogu prenijeti podaci kao što je vaša IP adresa.',
    load: 'Učitaj Google Maps',
    enabled: 'Google Maps je omogućen.',
    disable: 'Onemogući Google Maps',
    loading: 'Google Maps se učitava …',
    error: 'Kartu nije bilo moguće učitati. Pokušajte ponovno ili otvorite adresu putem vanjske poveznice Google Mapsa.',
    retry: 'Ponovno učitaj kartu',
  },
  privacySettings: {
    button: 'Postavke privatnosti', title: 'Postavke privatnosti',
    intro: 'Vi odlučujete smije li se na ovoj stranici učitati neobavezna karta Google Mapsa.',
    googleMapsLabel: 'Google Maps', enabled: 'Omogućeno', disabled: 'Onemogućeno', save: 'Spremi odabir', close: 'Zatvori bez promjene',
  },
  booking: {
    title: 'Zatražite prvi razgovor', intro: 'Odaberite temu, željeni oblik razgovora, datum i razdoblje te unesite ime i adresu e-pošte. Web-stranica iz tih podataka priprema poruku za vaš program e-pošte; obrazac sama ne sprema niti šalje.',
    serviceLabel: 'Tema savjetovanja', modeLabel: 'Oblik', dateLabel: 'Željeni datum', timeLabel: 'Željeno vrijeme', nameLabel: 'Ime i prezime', companyLabel: 'Tvrtka (neobavezno)', emailLabel: 'E-pošta', phoneLabel: 'Telefon (neobavezno)', messageLabel: 'Poruka (neobavezno)',
    messagePlaceholder: 'Ukratko opišite gdje vam je potrebna podrška.', submit: 'Pregledajte upit', sendEmail: 'Otvori upit u e-pošti', callOffice: 'Nazovite sada', copySummary: 'Kopiraj sažetak', editRequest: 'Uredi podatke', newRequest: 'Novi upit', close: 'Zatvori',
    copySuccess: 'Sažetak je kopiran.', copyFailure: 'Sažetak se nije mogao automatski kopirati. Označite i kopirajte gore navedene podatke ili upotrijebite adresu e-pošte.',
    emailFallback: 'Ako se program za e-poštu ne otvori, sažetak ostaje vidljiv ovdje. Možete ga kopirati ili poslati izravno na sljedeću adresu:',
    disclaimer: 'Željeni termin postaje obvezujući tek nakon potvrde društva MINO Consulting KG.',
    securityText: 'Informacije o privatnosti za upit za termin', responseBadge: 'Potrebna je zasebna potvrda termina',
    required: 'Ovo je polje obvezno.', invalidEmail: 'Unesite valjanu adresu e-pošte.',
    errorSummary: 'Provjerite označena polja.', successTitle: 'Vaš upit za termin je pripremljen.',
    successBody: 'Provjerite svoje podatke i zatim otvorite pripremljenu e-poruku. Termin je potvrđen tek nakon odgovora društva MINO Consulting KG.',
    modes: ['Online', 'U uredu', 'Telefonski'],
    periods: ['08:00–10:00', '10:00–12:00', '12:00–14:00', '14:00–16:00', 'Vrijeme je fleksibilno'],
    services: ['Opći prvi razgovor', 'Knjigovodstvo', 'Obračun plaća', 'Porezno savjetovanje', 'Godišnji obračun', 'Porezna pitanja pri osnivanju'],
  },
};

export default home;
