export const PRIVACY_PREFERENCES_STORAGE_KEY = 'mino_privacy_preferences_v1';
export const PRIVACY_PREFERENCES_EVENT = 'mino:privacy-preferences-changed';

export const DEFAULT_PRIVACY_PREFERENCES = Object.freeze({
  googleMaps: false,
});

function getStorage() {
  if (typeof window === 'undefined') return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readPrivacyPreferences() {
  const storage = getStorage();
  if (!storage) return { ...DEFAULT_PRIVACY_PREFERENCES };

  try {
    const storedValue = storage.getItem(PRIVACY_PREFERENCES_STORAGE_KEY);
    if (!storedValue) return { ...DEFAULT_PRIVACY_PREFERENCES };

    const parsedValue = JSON.parse(storedValue);
    return {
      googleMaps: parsedValue?.googleMaps === true,
    };
  } catch {
    return { ...DEFAULT_PRIVACY_PREFERENCES };
  }
}

function publishPrivacyPreferences(preferences) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(PRIVACY_PREFERENCES_EVENT, { detail: preferences }));
}

export function updatePrivacyPreferences(nextPreferences) {
  const preferences = {
    googleMaps: nextPreferences?.googleMaps === true,
  };
  const storage = getStorage();

  if (storage) {
    try {
      if (preferences.googleMaps) {
        storage.setItem(PRIVACY_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
      } else {
        storage.removeItem(PRIVACY_PREFERENCES_STORAGE_KEY);
      }
    } catch {
      // The in-page preference still applies when storage is unavailable.
    }
  }

  publishPrivacyPreferences(preferences);
  return preferences;
}

export function resetPrivacyPreferences() {
  return updatePrivacyPreferences(DEFAULT_PRIVACY_PREFERENCES);
}

export function subscribeToPrivacyPreferences(callback) {
  if (typeof window === 'undefined') return () => {};

  const handleChange = (event) => callback(event.detail ?? readPrivacyPreferences());
  window.addEventListener(PRIVACY_PREFERENCES_EVENT, handleChange);
  return () => window.removeEventListener(PRIVACY_PREFERENCES_EVENT, handleChange);
}
