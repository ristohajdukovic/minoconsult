import React, { useEffect, useRef, useState } from 'react';
import { MAP_EMBED_URL } from '../config/site.js';
import { readPrivacyPreferences, subscribeToPrivacyPreferences, updatePrivacyPreferences } from './preferences.js';

export default function ConsentControlledMap({ content }) {
  const [googleMapsEnabled, setGoogleMapsEnabled] = useState(() => readPrivacyPreferences().googleMaps);
  const [mapStatus, setMapStatus] = useState('loading');
  const [mapAttempt, setMapAttempt] = useState(0);
  const iframeRef = useRef(null);

  useEffect(() => subscribeToPrivacyPreferences((preferences) => {
    setGoogleMapsEnabled(preferences.googleMaps);
    if (preferences.googleMaps) setMapStatus('loading');
  }), []);

  useEffect(() => {
    if (!googleMapsEnabled || mapStatus !== 'loading') return undefined;
    const timeoutId = window.setTimeout(() => setMapStatus('error'), 10000);
    return () => window.clearTimeout(timeoutId);
  }, [googleMapsEnabled, mapAttempt, mapStatus]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!googleMapsEnabled || !iframe) return undefined;
    const handleError = () => setMapStatus('error');
    iframe.addEventListener('error', handleError);
    return () => iframe.removeEventListener('error', handleError);
  }, [googleMapsEnabled, mapAttempt]);

  const setEnabled = (enabled) => {
    const preferences = updatePrivacyPreferences({ googleMaps: enabled });
    setGoogleMapsEnabled(preferences.googleMaps);
    setMapStatus('loading');
  };

  if (googleMapsEnabled) {
    return (
      <div className="map-consent-state">
        <div className="map-enabled-bar" role="status">
          <span>{content.enabled}</span>
          <button className="map-text-button" type="button" onClick={() => setEnabled(false)}>
            {content.disable}
          </button>
        </div>
        {mapStatus === 'error' ? (
          <div className="map-frame map-error-state" role="alert">
            <p>{content.error}</p>
            <button
              className="footer-cta-button"
              type="button"
              onClick={() => {
                setMapStatus('loading');
                setMapAttempt((attempt) => attempt + 1);
              }}
            >
              {content.retry}
            </button>
          </div>
        ) : (
          <div className="map-frame" aria-busy={mapStatus === 'loading'}>
            <iframe
              ref={iframeRef}
              key={mapAttempt}
              title={content.title}
              src={MAP_EMBED_URL}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              onLoad={() => setMapStatus('ready')}
              onError={() => setMapStatus('error')}
            />
            {mapStatus === 'loading' && <span className="map-loading-status" role="status">{content.loading}</span>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="map-consent-placeholder">
      <div className="map-placeholder-copy">
        <h3>{content.title}</h3>
        <p>{content.explanation}</p>
        <button className="footer-cta-button" type="button" onClick={() => setEnabled(true)}>
          {content.load}
        </button>
      </div>
    </div>
  );
}
