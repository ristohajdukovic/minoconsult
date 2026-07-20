import React, { useEffect, useRef, useState } from 'react';
import { getFocusableElements, lockBodyScroll } from '../accessibility/dialog.js';
import { readPrivacyPreferences, updatePrivacyPreferences } from './preferences.js';

export default function PrivacySettingsDialog({ content, isOpen, onClose }) {
  const dialogRef = useRef(null);
  const titleRef = useRef(null);
  const [googleMapsEnabled, setGoogleMapsEnabled] = useState(() => readPrivacyPreferences().googleMaps);

  useEffect(() => {
    if (!isOpen) return undefined;

    setGoogleMapsEnabled(readPrivacyPreferences().googleMaps);
    const unlockBodyScroll = lockBodyScroll();
    window.requestAnimationFrame(() => titleRef.current?.focus());

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;
      const controls = getFocusableElements(dialogRef.current);
      const first = controls[0];
      const last = controls.at(-1);
      if (!first || !last) {
        event.preventDefault();
        titleRef.current?.focus();
      } else if (event.shiftKey && (document.activeElement === first || !dialogRef.current?.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      unlockBodyScroll();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const savePreferences = () => {
    updatePrivacyPreferences({ googleMaps: googleMapsEnabled });
    onClose();
  };

  return (
    <div className="booking-overlay privacy-settings-overlay">
      <div
        ref={dialogRef}
        className="booking-panel privacy-settings-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-settings-title"
        aria-describedby="privacy-settings-description"
      >
        <div className="booking-dialog-header">
          <h2 ref={titleRef} id="privacy-settings-title" tabIndex="-1">{content.title}</h2>
          <p id="privacy-settings-description">{content.intro}</p>
        </div>
        <div className="privacy-settings-body">
          <label className="privacy-preference-option">
            <input
              type="checkbox"
              checked={googleMapsEnabled}
              onChange={(event) => setGoogleMapsEnabled(event.target.checked)}
            />
            <span>
              <strong>{content.googleMapsLabel}</strong>
              <small>{googleMapsEnabled ? content.enabled : content.disabled}</small>
            </span>
          </label>
          <div className="privacy-settings-actions">
            <button className="button-secondary" type="button" onClick={onClose}>{content.close}</button>
            <button className="button-primary" type="button" onClick={savePreferences}>{content.save}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
