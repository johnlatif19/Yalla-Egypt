let activeModal = null;
let previousFocus = null;

const FOCUSABLE = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function trapFocus(container, event) {
  if (event.key !== 'Tab') return;
  const focusables = container.querySelectorAll(FOCUSABLE);
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function onKeydown(event) {
  if (!activeModal) return;
  if (event.key === 'Escape') {
    closeModal();
    return;
  }
  trapFocus(activeModal, event);
}

export function openModal({ title, content, onClose, footer } = {}) {
  closeModal();

  previousFocus = document.activeElement;

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-labelledby', 'modal-title');

  const modal = document.createElement('div');
  modal.className = 'modal';

  const header = document.createElement('div');
  header.className = 'modal__header';

  const heading = document.createElement('h2');
  heading.className = 'modal__title';
  heading.id = 'modal-title';
  heading.textContent = title || '';

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'icon-btn';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>';
  closeBtn.addEventListener('click', () => closeModal());

  header.appendChild(heading);
  header.appendChild(closeBtn);

  const body = document.createElement('div');
  body.className = 'modal__body';
  if (typeof content === 'string') {
    body.innerHTML = content;
  } else if (content instanceof Node) {
    body.appendChild(content);
  }

  modal.appendChild(header);
  modal.appendChild(body);

  if (footer) {
    const footerEl = document.createElement('div');
    footerEl.className = 'modal__footer';
    if (typeof footer === 'string') {
      footerEl.innerHTML = footer;
    } else if (footer instanceof Node) {
      footerEl.appendChild(footer);
    }
    modal.appendChild(footerEl);
  }

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
  document.body.style.overflow = 'hidden';

  requestAnimationFrame(() => backdrop.classList.add('is-open'));

  activeModal = backdrop;
  activeModal._onClose = onClose;

  document.addEventListener('keydown', onKeydown);

  const firstFocusable = modal.querySelector(FOCUSABLE);
  if (firstFocusable) {
    setTimeout(() => firstFocusable.focus(), 50);
  }

  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) closeModal();
  });

  return backdrop;
}

export function closeModal() {
  if (!activeModal) return;
  const modal = activeModal;
  activeModal = null;

  modal.classList.remove('is-open');
  document.removeEventListener('keydown', onKeydown);

  setTimeout(() => {
    modal.remove();
    document.body.style.overflow = '';
    if (previousFocus && previousFocus.focus) previousFocus.focus();
    if (modal._onClose) modal._onClose();
  }, 250);
}