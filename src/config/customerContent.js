// Customer-controlled values belong here only after written approval.
// Keep unknown values null: incomplete bilingual copy and incomplete image
// records are deliberately ignored by the public rendering helpers below.

const emptyLocalizedValue = () => Object.freeze({ de: null, hr: null });

export const customerContent = Object.freeze({
  // Keep null while the GitHub Pages origin in .env.production remains canonical.
  productionDomain: null,
  media: Object.freeze({
    heroImage: Object.freeze({
      path: null,
      width: 1400,
      height: 933,
      alt: emptyLocalizedValue(),
    }),
    adviserPortrait: Object.freeze({
      path: null,
      width: 1280,
      height: 1600,
      alt: emptyLocalizedValue(),
    }),
    socialImage: Object.freeze({
      path: null,
      width: 1200,
      height: 630,
    }),
  }),
  adviserBiography: emptyLocalizedValue(),
  targetClientCopy: emptyLocalizedValue(),
  professionalRegistration: Object.freeze({
    url: null,
    label: emptyLocalizedValue(),
  }),
  newMandates: Object.freeze({
    status: null,
    publicCopy: emptyLocalizedValue(),
  }),
  // Null preserves the current local email-preparation mechanism and makes no
  // external request. A later provider decision still requires implementation.
  formBookingDecision: null,
});

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasCompleteLocalizedValue(value) {
  return value && hasText(value.de) && hasText(value.hr);
}

function isApprovedHttpsUrl(value) {
  if (!hasText(value)) return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

export function getApprovedImage(kind, language) {
  const image = customerContent.media[kind];
  if (!image || !hasText(image.path) || !hasCompleteLocalizedValue(image.alt)) return null;

  return {
    path: image.path,
    width: image.width,
    height: image.height,
    alt: image.alt[language],
  };
}

export function getApprovedAdviserBiography(language) {
  return hasCompleteLocalizedValue(customerContent.adviserBiography)
    ? customerContent.adviserBiography[language]
    : null;
}

function isCompleteTargetClientCopy(value) {
  return value
    && hasText(value.title)
    && hasText(value.body)
    && Array.isArray(value.cards)
    && value.cards.length > 0
    && value.cards.every((card) => hasText(card?.title) && hasText(card?.body));
}

export function getApprovedTargetClientCopy(language) {
  const copy = customerContent.targetClientCopy;
  return isCompleteTargetClientCopy(copy.de) && isCompleteTargetClientCopy(copy.hr)
    ? copy[language]
    : null;
}

export function getApprovedProfessionalRegistration(language) {
  const registration = customerContent.professionalRegistration;
  if (!isApprovedHttpsUrl(registration.url) || !hasCompleteLocalizedValue(registration.label)) return null;
  return { url: registration.url, label: registration.label[language] };
}
