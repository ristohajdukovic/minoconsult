import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FOCUSABLE_SELECTOR, lockBodyScroll } from '../accessibility/dialog.js';
import Icon from './Icon.jsx';
import { CONTACT_EMAIL, OFFICE_PHONE_HREF } from '../config/site.js';

const X = (props) => <Icon name="x" {...props} />;
const Mail = (props) => <Icon name="mail" {...props} />;
const Phone = (props) => <Icon name="phone" {...props} />;
const ArrowRight = (props) => <Icon name="arrow-right" {...props} />;
const Lock = (props) => <Icon name="lock" {...props} />;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

function getRouteHref(path) {
  if (path === '/') return `${basePath}/` || '/';
  return `${basePath}${path}`;
}

export default function BookingModal({ t, language, isOpen, onClose }) {
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const dialogRef = useRef(null);
  const titleRef = useRef(null);
  const errorSummaryRef = useRef(null);
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
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');

  useEffect(() => {
    if (!isOpen) return undefined;

    const unlockBodyScroll = lockBodyScroll();
    setForm(initialForm);
    setErrors({});
    setSubmitted(false);
    setCopyMessage('');
    window.requestAnimationFrame(() => titleRef.current?.focus());

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;
      const focusableElements = Array.from(dialogRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) ?? [])
        .filter((element) => !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true');
      if (focusableElements.length === 0) {
        event.preventDefault();
        titleRef.current?.focus();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements.at(-1);
      if (event.shiftKey && (document.activeElement === first || !dialogRef.current?.contains(document.activeElement))) {
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
  }, [initialForm, isOpen, onClose]);

  if (!isOpen) return null;

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    for (const field of ['service', 'name', 'email']) {
      if (!form[field]?.trim()) nextErrors[field] = t.booking.required;
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = t.booking.invalidEmail;
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      window.requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }

    setSubmitted(true);
  };

  const emailBody = [
    `${t.booking.serviceLabel}: ${form.service}`,
    `${t.booking.modeLabel}: ${form.mode}`,
    `${t.booking.dateLabel}: ${form.date || '-'}`,
    `${t.booking.timeLabel}: ${form.time || '-'}`,
    `${t.booking.nameLabel}: ${form.name}`,
    `${t.booking.companyLabel}: ${form.company || '-'}`,
    `${t.booking.emailLabel}: ${form.email}`,
    `${t.booking.phoneLabel}: ${form.phone || '-'}`,
    `${t.booking.messageLabel}: ${form.message || '-'}`,
    '',
    t.booking.disclaimer,
  ].join('\n');

  const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    language === 'de' ? 'Terminanfrage an MINO Consulting KG' : 'Upit za termin za MINO Consulting KG',
  )}&body=${encodeURIComponent(emailBody)}`;
  const copySummary = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(emailBody);
      } else {
        const fallback = document.createElement('textarea');
        fallback.value = emailBody;
        fallback.setAttribute('readonly', '');
        fallback.style.position = 'fixed';
        fallback.style.opacity = '0';
        document.body.appendChild(fallback);
        fallback.select();
        const copied = document.execCommand('copy');
        fallback.remove();
        if (!copied) throw new Error('Copy command was unavailable.');
      }
      setCopyMessage(t.booking.copySuccess);
    } catch {
      setCopyMessage(t.booking.copyFailure);
    }
  };
  const startNewRequest = () => {
    setForm(initialForm);
    setErrors({});
    setCopyMessage('');
    setSubmitted(false);
  };
  const fieldLabels = {
    service: t.booking.serviceLabel,
    name: t.booking.nameLabel,
    email: t.booking.emailLabel,
  };

  return (
    <div className="booking-overlay">
      <div
        ref={dialogRef}
        className="booking-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        aria-describedby="booking-description"
      >
        <div className="booking-dialog-header flex items-start justify-between gap-4 border-b border-forest/50 p-4 sm:p-5">
          <div>
            <h2 ref={titleRef} id="booking-title" tabIndex="-1">
              {t.booking.title}
            </h2>
            <p id="booking-description" className="mt-3 max-w-2xl text-forest/70">{t.booking.intro}</p>
          </div>
          <button className="hamburger-button shrink-0" type="button" onClick={onClose} aria-label={t.booking.close}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {submitted ? (
          <div className="p-4 sm:p-5">
            <h3>{t.booking.successTitle}</h3>
            <p className="mt-3 text-forest/70">{t.booking.successBody}</p>
            <p className="booking-disclaimer">{t.booking.disclaimer}</p>
            <dl className="mt-6 grid gap-3 rounded-md border border-forest/50 bg-cream p-4 text-sm sm:grid-cols-2">
              {[
                [t.booking.serviceLabel, form.service],
                [t.booking.modeLabel, form.mode],
                [t.booking.dateLabel, form.date || '-'],
                [t.booking.timeLabel, form.time || '-'],
                [t.booking.nameLabel, form.name],
                [t.booking.companyLabel, form.company || '-'],
                [t.booking.emailLabel, form.email],
                [t.booking.phoneLabel, form.phone || '-'],
                [t.booking.messageLabel, form.message || '-'],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-bold uppercase tracking-[0.14em] text-forest/70">{label}</dt>
                  <dd className="mt-1 font-semibold text-forest">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="booking-summary-actions">
              <a className="button-primary" href={mailtoHref}>
                {t.booking.sendEmail}
                <Mail size={16} aria-hidden="true" />
              </a>
              <a className="button-secondary" href={OFFICE_PHONE_HREF}>
                {t.booking.callOffice}
                <Phone size={16} aria-hidden="true" />
              </a>
              <button className="button-secondary" type="button" onClick={copySummary}>
                {t.booking.copySummary}
              </button>
              <button className="button-secondary" type="button" onClick={() => setSubmitted(false)}>
                {t.booking.editRequest}
              </button>
              <button className="button-secondary" type="button" onClick={startNewRequest}>
                {t.booking.newRequest}
              </button>
            </div>
            <p className="booking-email-fallback">
              {t.booking.emailFallback}{' '}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </p>
            <p className="booking-copy-status" role="status" aria-live="polite">{copyMessage}</p>
          </div>
        ) : (
          <form className="booking-form" onSubmit={handleSubmit} noValidate>
            {Object.keys(errors).length > 0 && (
              <div
                ref={errorSummaryRef}
                className="form-error-summary"
                role="alert"
                tabIndex="-1"
                aria-labelledby="booking-error-title"
              >
                <p id="booking-error-title" className="font-bold">{t.booking.errorSummary}</p>
                <ul>
                  {Object.entries(errors).map(([field, message]) => (
                    <li key={field}><a href={`#booking-${field}`}>{fieldLabels[field]}: {message}</a></li>
                  ))}
                </ul>
              </div>
            )}
            <label className="form-field">
              <span>{t.booking.serviceLabel}</span>
              <select
                id="booking-service"
                name="service"
                value={form.service}
                required
                aria-invalid={Boolean(errors.service)}
                aria-describedby={errors.service ? 'booking-service-error' : undefined}
                onChange={(event) => updateField('service', event.target.value)}
              >
                {t.booking.services.map((service) => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
              {errors.service && <span className="form-error" id="booking-service-error">{errors.service}</span>}
            </label>

            <div className="booking-field-pair">
              <label className="form-field">
                <span>{t.booking.nameLabel}</span>
                <input
                  id="booking-name"
                  name="name"
                  autoComplete="name"
                  value={form.name}
                  required
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'booking-name-error' : undefined}
                  onChange={(event) => updateField('name', event.target.value)}
                />
                {errors.name && <span className="form-error" id="booking-name-error">{errors.name}</span>}
              </label>
              <label className="form-field">
                <span>{t.booking.companyLabel}</span>
                <input
                  id="booking-company"
                  name="organization"
                  autoComplete="organization"
                  value={form.company}
                  onChange={(event) => updateField('company', event.target.value)}
                />
              </label>
            </div>

            <div className="booking-field-pair">
              <label className="form-field">
                <span>{t.booking.emailLabel}</span>
                <input
                  id="booking-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={form.email}
                  required
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'booking-email-error' : undefined}
                  onChange={(event) => updateField('email', event.target.value)}
                />
                {errors.email && <span className="form-error" id="booking-email-error">{errors.email}</span>}
              </label>
              <label className="form-field">
                <span>{t.booking.phoneLabel}</span>
                <input
                  id="booking-phone"
                  name="tel"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(event) => updateField('phone', event.target.value)}
                />
              </label>
            </div>

            <fieldset id="booking-mode">
              <legend className="form-label">{t.booking.modeLabel}</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {t.booking.modes.map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={`choice-button ${form.mode === mode ? 'is-active' : ''}`}
                    aria-pressed={form.mode === mode}
                    onClick={() => updateField('mode', mode)}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="booking-preference-group">
              <p>{t.booking.preferenceNote}</p>
              <div className="booking-field-pair">
                <label className="form-field">
                  <span>{t.booking.dateLabel}</span>
                  <input
                    id="booking-date"
                    name="date"
                    type="date"
                    min={today}
                    value={form.date}
                    onChange={(event) => updateField('date', event.target.value)}
                  />
                </label>
                <fieldset id="booking-time">
                  <legend className="form-label">{t.booking.timeLabel}</legend>
                  <div className="grid grid-cols-2 gap-2">
                    {t.booking.periods.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        className={`choice-button ${form.time === slot ? 'is-active' : ''}`}
                        aria-pressed={form.time === slot}
                        onClick={() => updateField('time', slot)}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>
            </div>

            <label className="form-field">
              <span>{t.booking.messageLabel}</span>
              <textarea
                id="booking-message"
                name="message"
                value={form.message}
                placeholder={t.booking.messagePlaceholder}
                onChange={(event) => updateField('message', event.target.value)}
              />
            </label>

            <p className="booking-disclaimer">{t.booking.disclaimer}</p>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button className="button-secondary" type="button" onClick={onClose}>
                {t.booking.close}
              </button>
              <button className="button-primary" type="submit">
                {t.booking.submit}
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="booking-trust-row">
              <a
                className="booking-trust-item"
                href={getRouteHref(language === 'hr' ? '/hr/pravila-privatnosti' : '/datenschutzerklaerung')}
              >
                <Lock size={13} aria-hidden="true" />
                {t.booking.securityText}
              </a>
              <span className="booking-response-pill">{t.booking.responseBadge}</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
