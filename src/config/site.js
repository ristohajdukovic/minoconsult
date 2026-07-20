export const SITE_NAME = 'MINO Consulting KG';
export const DEFAULT_LANGUAGE = 'de';
export const DEVELOPMENT_SITE_URL = 'http://localhost:5173';
export const CONTACT_EMAIL = 'office@mino-consulting.at';
export const OFFICE_PHONE = '+43 1 90 680 200';
export const OFFICE_PHONE_HREF = 'tel:+43190680200';
export const MOBILE_PHONE = '+43 660 21 99 444';
export const MOBILE_PHONE_HREF = 'tel:+436602199444';
export const OFFICE_ADDRESS = 'Geblergasse 95/8, 1170 Wien';
export const OFFICE_STREET = 'Geblergasse 95/8';
export const OFFICE_POSTAL_CODE = '1170';
export const OFFICE_CITY = 'Wien';
export const OFFICE_COUNTRY = 'AT';
export const SUPPORTED_LANGUAGES = Object.freeze(['de', 'hr']);
export const MAP_EXTERNAL_URL = 'https://www.google.com/maps/search/?api=1&query=Geblergasse%2095%2F8%2C%201170%20Wien';
export const MAP_EMBED_URL = 'https://www.google.com/maps?q=Geblergasse%2095%2F8%2C%201170%20Wien&output=embed';
export const SOCIAL_IMAGE_PATH = null;

export function resolveSiteUrl(env = {}, { production = Boolean(env.PROD) } = {}) {
  const configuredUrl = env.VITE_SITE_URL?.trim();

  if (!configuredUrl && production) {
    throw new Error(
      'Missing VITE_SITE_URL. Set it to the public production origin before building (for example https://www.mino.co.at).',
    );
  }

  return (configuredUrl || DEVELOPMENT_SITE_URL).replace(/\/+$/, '');
}

export function absoluteUrl(siteUrl, path) {
  return `${siteUrl}${path === '/' ? '/' : path}`;
}

export const SITE_URL = resolveSiteUrl(import.meta.env);
