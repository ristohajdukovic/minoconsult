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

export function getPublicTrustFacts(language) {
  const facts = language === 'hr'
    ? [
      { label: 'Sjedište ureda', value: verifiedBusinessFacts.officeAddress },
      { label: 'Trgovački registar', value: verifiedBusinessFacts.commercialRegisterNumber },
      { label: 'Jezici web-stranice', value: 'Deutsch · Hrvatski' },
    ]
    : [
      { label: 'Kanzleistandort', value: verifiedBusinessFacts.officeAddress },
      { label: 'Firmenbuch', value: verifiedBusinessFacts.commercialRegisterNumber },
      { label: 'Website-Sprachen', value: 'Deutsch · Hrvatski' },
    ];

  return facts.filter((fact) => fact.value != null && fact.value !== '');
}
