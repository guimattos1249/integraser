const header = document.querySelector('[data-header]');
const menu = document.querySelector('[data-menu]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const menuClose = document.querySelector('[data-menu-close]');
const scrollTopFab = document.querySelector('[data-scroll-top]');
const toast = document.querySelector('[data-toast]');

const setScrollState = () => {
  header?.classList.toggle('scrolled', window.scrollY > 16);
  scrollTopFab?.classList.toggle('visible', window.scrollY > 420);
};
setScrollState();
window.addEventListener('scroll', setScrollState, { passive: true });

const setMenu = (open) => {
  menu.classList.toggle('open', open);
  header?.classList.toggle('menu-active', open);
  document.body.classList.toggle('menu-open', open);
  menuToggle?.setAttribute('aria-expanded', String(open));
  menuToggle?.querySelector('.sr-only').replaceChildren(open ? 'Fechar menu' : 'Abrir menu');
};

menuToggle?.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
menuClose?.addEventListener('click', () => setMenu(false));

menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', (event) => {
  const targetId = link.getAttribute('href');
  const target = targetId?.startsWith('#') ? document.querySelector(targetId) : null;

  setMenu(false);
  if (!target) return;

  event.preventDefault();
  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  window.requestAnimationFrame(() => target.scrollIntoView({ behavior, block: 'start' }));
}));

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu?.classList.contains('open')) {
    setMenu(false);
    menuToggle?.focus();
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 1020 && menu?.classList.contains('open')) setMenu(false);
});

scrollTopFab?.addEventListener('click', () => {
  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  window.scrollTo({ top: 0, behavior });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const accordionItems = [...document.querySelectorAll('[data-accordion] details')];
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const accordionAnimations = new WeakMap();

const animateAccordion = (detail, open) => {
  const summary = detail.querySelector('summary');
  if (!summary) return Promise.resolve();

  accordionAnimations.get(detail)?.cancel();

  const startHeight = `${detail.offsetHeight}px`;
  if (open) detail.open = true;
  const endHeight = `${open ? detail.offsetHeight : summary.offsetHeight}px`;

  if (!open) detail.classList.add('is-closing');

  const animation = detail.animate(
    { height: [startHeight, endHeight] },
    { duration: prefersReducedMotion.matches ? 180 : 420, easing: 'cubic-bezier(.22, 1, .36, 1)' }
  );
  accordionAnimations.set(detail, animation);

  return animation.finished
    .catch(() => undefined)
    .then(() => {
      if (accordionAnimations.get(detail) !== animation) return;
      detail.open = open;
      detail.style.height = '';
      detail.classList.remove('is-closing');
      accordionAnimations.delete(detail);
    });
};

accordionItems.forEach((detail) => {
  detail.querySelector('summary')?.addEventListener('click', (event) => {
    event.preventDefault();
    const shouldOpen = !detail.open;

    if (shouldOpen) {
      accordionItems.forEach((other) => {
        if (other !== detail && other.open) animateAccordion(other, false);
      });
    }

    animateAccordion(detail, shouldOpen);
  });
});

document.querySelector('[data-contact-placeholder]')?.addEventListener('click', () => {
  toast.classList.add('visible');
  window.setTimeout(() => toast.classList.remove('visible'), 4200);
});

document.querySelector('[data-year]').textContent = new Date().getFullYear();
