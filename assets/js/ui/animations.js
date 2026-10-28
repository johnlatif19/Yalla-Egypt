const REVEAL_CLASS = 'reveal';
const VISIBLE_CLASS = 'is-visible';

let observer = null;

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function ensureObserver() {
  if (observer) return observer;
  if (prefersReducedMotion()) return null;

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(VISIBLE_CLASS);
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.08
    }
  );

  return observer;
}

export function initReveals(root = document) {
  const elements = root.querySelectorAll(`.${REVEAL_CLASS}`);

  if (prefersReducedMotion()) {
    elements.forEach((el) => el.classList.add(VISIBLE_CLASS));
    return;
  }

  const obs = ensureObserver();
  if (!obs) {
    elements.forEach((el) => el.classList.add(VISIBLE_CLASS));
    return;
  }

  elements.forEach((el) => {
    if (el.classList.contains(VISIBLE_CLASS)) return;
    obs.observe(el);
  });
}

export function refreshReveals() {
  initReveals();
}

export function animateElement(el, keyframes, options) {
  if (prefersReducedMotion() || typeof el.animate !== 'function') {
    return null;
  }
  return el.animate(keyframes, {
    duration: 500,
    easing: 'ease-out',
    fill: 'both',
    ...options
  });
}