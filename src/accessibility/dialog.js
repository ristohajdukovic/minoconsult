export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function getFocusableElements(container) {
  return Array.from(container?.querySelectorAll(FOCUSABLE_SELECTOR) ?? [])
    .filter((element) => !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true');
}

export function lockBodyScroll() {
  const previousOverflow = document.body.style.overflow;
  const previousPaddingInlineEnd = document.body.style.paddingInlineEnd;
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

  document.body.style.overflow = 'hidden';
  if (scrollbarWidth > 0) document.body.style.paddingInlineEnd = `${scrollbarWidth}px`;

  return () => {
    document.body.style.overflow = previousOverflow;
    document.body.style.paddingInlineEnd = previousPaddingInlineEnd;
  };
}
