import {
  OFFICE_ADDRESS,
  OFFICE_CITY,
  SUPPORTED_LANGUAGES,
} from './site.js';

// Only facts supported by the current legal pages and shared site configuration
// belong here. Unknown marketing and operational facts deliberately remain null.
export const verifiedBusinessFacts = Object.freeze({
  companyName: 'MINO Consulting KG',
  legalForm: 'Kommanditgesellschaft',
  commercialRegisterNumber: 'FN 157894y',
  commercialRegisterCourt: 'Handelsgericht Wien',
  registeredOffice: OFFICE_CITY,
  officeAddress: OFFICE_ADDRESS,
  websiteLanguages: SUPPORTED_LANGUAGES,
  professionalTitle: 'Steuerberater',
  professionalBody: 'Kammer der Steuerberater:innen und Wirtschaftsprüfer:innen (KSW)',
  principalNameAsCurrentlyPublished: 'Mag. Tomislav Siketic',
  registeredSince: '1997-06-14',
  acceptsNewClients: null,
  freeInitialConsultation: null,
  consultationLanguages: null,
  consultationFormats: null,
  officeHours: null,
  kswProfileUrl: null,
  googleRating: null,
  googleReviewCount: null,
  testimonials: null,
});

export function getCredentialFacts(language) {
  // TODO(hr): "Mitglied der Kammer der Steuerberater:innen und Wirtschaftsprüfer:innen"
  // is professional-body terminology and is kept in German pending an
  // official, KSW-approved Croatian rendering.
  const facts = language === 'hr'
    ? [
      { label: 'Osnovano', value: 'Od 1997.' },
      { label: 'Trgovački registar', value: `${verifiedBusinessFacts.commercialRegisterNumber} — ${verifiedBusinessFacts.commercialRegisterCourt}` },
      { label: 'Članstvo', value: `Mitglied der ${verifiedBusinessFacts.professionalBody.replace(' (KSW)', '')}` },
      { label: 'Jezici', value: 'Deutsch · Hrvatski' },
    ]
    : [
      { label: 'Gegründet', value: 'Seit 1997' },
      { label: 'Firmenbuch', value: `${verifiedBusinessFacts.commercialRegisterNumber} — ${verifiedBusinessFacts.commercialRegisterCourt}` },
      { label: 'Mitgliedschaft', value: `Mitglied der ${verifiedBusinessFacts.professionalBody.replace(' (KSW)', '')}` },
      { label: 'Sprachen', value: 'Deutsch · Hrvatski' },
    ];

  return facts;
}

export function getPublicTrustFacts(language) {
  const facts = language === 'hr'
    ? [
      { label: 'Lokacija ureda', value: 'Ured u 1170 Beču' },
      { label: 'Strukovni naziv', value: `${verifiedBusinessFacts.principalNameAsCurrentlyPublished} · Porezni savjetnik` },
      verifiedBusinessFacts.consultationLanguages?.length
        ? { label: 'Savjetovanje', value: 'Deutsch · Hrvatski' }
        : null,
    ]
    : [
      { label: 'Standort', value: 'Kanzlei in 1170 Wien' },
      { label: 'Berufsbezeichnung', value: `${verifiedBusinessFacts.principalNameAsCurrentlyPublished} · ${verifiedBusinessFacts.professionalTitle}` },
      verifiedBusinessFacts.consultationLanguages?.length
        ? { label: 'Beratung', value: 'Deutsch · Hrvatski' }
        : null,
    ];

  return facts.filter((fact) => fact?.value != null && fact.value !== '');
}
