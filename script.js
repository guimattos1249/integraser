const header = document.querySelector('[data-header]');
const menu = document.querySelector('[data-menu]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const toast = document.querySelector('[data-toast]');

const setHeader = () => header?.classList.toggle('scrolled', window.scrollY > 16);
setHeader();
window.addEventListener('scroll', setHeader, { passive: true });

menuToggle?.addEventListener('click', () => {
  const open = !menu.classList.contains('open');
  menu.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
});

menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menu.classList.remove('open');
  document.body.classList.remove('menu-open');
  menuToggle?.setAttribute('aria-expanded', 'false');
}));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

document.querySelectorAll('[data-accordion] details').forEach((detail) => {
  detail.addEventListener('toggle', () => {
    if (!detail.open) return;
    document.querySelectorAll('[data-accordion] details').forEach((other) => {
      if (other !== detail) other.open = false;
    });
  });
});

document.querySelector('[data-contact-placeholder]')?.addEventListener('click', () => {
  toast.classList.add('visible');
  window.setTimeout(() => toast.classList.remove('visible'), 4200);
});

document.querySelector('[data-year]').textContent = new Date().getFullYear();
