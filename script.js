document.documentElement.classList.add('js');

document.querySelectorAll('a[target="_blank"]').forEach((link) => {
  const hint = ' (abre em nova aba)';
  const explicitName = link.getAttribute('aria-label');
  if (explicitName) {
    const visibleText = link.textContent.trim().replace(/\s+/g, ' ');
    const labelWithVisibleText = visibleText && !explicitName.includes(visibleText)
      ? `${visibleText}. ${explicitName}`
      : explicitName;
    if (!labelWithVisibleText.includes('abre em nova aba')) link.setAttribute('aria-label', `${labelWithVisibleText}${hint}`);
    return;
  }
  const accessibleHint = document.createElement('span');
  accessibleHint.className = 'sr-only new-window-hint';
  accessibleHint.textContent = hint;
  link.append(accessibleHint);
});

const header = document.querySelector('[data-header]');
const menu = document.querySelector('[data-menu]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const menuClose = document.querySelector('[data-menu-close]');
const scrollTopFab = document.querySelector('[data-scroll-top]');
const menuFocusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
const menuInertTargets = [...document.body.children].filter((element) =>
  !element.matches('header, script')
);
const authoredInertState = new Map(menuInertTargets.map((element) => [element, element.hasAttribute('inert')]));
let menuReturnFocus = null;

const setScrollState = () => {
  header?.classList.toggle('scrolled', window.scrollY > 16);
  scrollTopFab?.classList.toggle('visible', window.scrollY > 420);
};
setScrollState();
window.addEventListener('scroll', setScrollState, { passive: true });

const setMenu = (open, { restoreFocus = true } = {}) => {
  if (!menu || !menuToggle) return;

  if (open) menuReturnFocus = document.activeElement;
  menu.classList.toggle('open', open);
  header?.classList.toggle('menu-active', open);
  document.body.classList.toggle('menu-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.querySelector('.sr-only')?.replaceChildren(open ? 'Fechar menu' : 'Abrir menu');

  menuInertTargets.forEach((element) => {
    if (open) element.setAttribute('inert', '');
    else if (!authoredInertState.get(element)) element.removeAttribute('inert');
  });

  if (open) {
    window.requestAnimationFrame(() => menu.querySelector(menuFocusableSelector)?.focus());
  } else if (restoreFocus && menuReturnFocus instanceof HTMLElement) {
    menuReturnFocus.focus();
    menuReturnFocus = null;
  }
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
  if (!menu?.classList.contains('open')) return;

  if (event.key === 'Escape') {
    setMenu(false);
    return;
  }

  if (event.key === 'Tab') {
    const focusable = [...menu.querySelectorAll(menuFocusableSelector)].filter((element) =>
      !element.hasAttribute('disabled') && element.getClientRects().length
    );
    if (!focusable.length) {
      event.preventDefault();
      menu.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && (document.activeElement === first || !menu.contains(document.activeElement))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !menu.contains(document.activeElement))) {
      event.preventDefault();
      first.focus();
    }
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 1020 && menu?.classList.contains('open')) setMenu(false, { restoreFocus: false });
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
  detail.classList.toggle('is-open', open);

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
  detail.classList.toggle('is-open', detail.open);

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

const year = document.querySelector('[data-year]');
if (year) year.textContent = new Date().getFullYear();

const reviewsList = document.querySelector('[data-reviews-list]');
const reviewsStatus = document.querySelector('[data-reviews-status]');
const reviewsSummary = document.querySelector('[data-reviews-summary]');
const reviewsRating = document.querySelector('[data-reviews-rating]');
const reviewsFooter = document.querySelector('[data-reviews-footer]');
const reviewsSource = document.querySelector('[data-reviews-source]');
const reviewsCount = document.querySelector('[data-reviews-count]');
const reviewsPrev = document.querySelector('[data-reviews-prev]');
const reviewsNext = document.querySelector('[data-reviews-next]');
const reviewsLocalFallback = document.querySelector('#reviews-local-fallback');
let reviewAnimationTimer;
let announceReviewCount = false;

const createUserIcon = () => {
  const wrapper = document.createElement('span');
  wrapper.className = 'review-user-icon';
  wrapper.setAttribute('aria-hidden', 'true');
  wrapper.innerHTML = '<svg viewBox="0 0 24 24" focusable="false"><path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-5 0-8 2.5-8 5.5V21h16v-1.5C20 16.5 17 14 12 14Z" /></svg>';
  return wrapper;
};

const createReviewCard = (review) => {
  const card = document.createElement('article');
  card.className = 'review-card';

  const author = document.createElement('div');
  author.className = 'review-author';
  author.append(createUserIcon());

  const authorCopy = document.createElement('div');
  const name = document.createElement('strong');
  name.textContent = review.author;
  const stars = document.createElement('span');
  stars.className = 'review-stars';
  stars.setAttribute('role', 'img');
  stars.setAttribute('aria-label', `${review.rating} de 5 estrelas`);
  stars.textContent = '★'.repeat(review.rating);
  authorCopy.append(name, stars);
  author.append(authorCopy);

  const quote = document.createElement('blockquote');
  const text = document.createElement('p');
  text.textContent = review.text || 'Avaliação de 5 estrelas, sem comentário.';
  if (!review.text) text.className = 'review-no-comment';
  quote.append(text);

  const source = document.createElement('p');
  source.className = 'review-source-label';
  source.textContent = 'Avaliação publicada no Google';
  card.append(author, quote, source);
  return card;
};

const getReviewCardWidth = () => {
  const card = reviewsList?.querySelector('.review-card');
  if (!card) return 0;
  const gap = Number.parseFloat(getComputedStyle(reviewsList).columnGap) || 0;
  return card.getBoundingClientRect().width + gap;
};

const updateReviewControls = () => {
  if (!reviewsList || !reviewsCount) return;
  const cards = reviewsList.querySelectorAll('.review-card');
  const cardWidth = getReviewCardWidth();
  const index = cardWidth ? Math.round(reviewsList.scrollLeft / cardWidth) : 0;
  const visibleCards = cardWidth ? Math.max(1, Math.round(reviewsList.clientWidth / cardWidth)) : 1;
  const firstVisible = Math.min(index + 1, cards.length);
  const lastVisible = Math.min(index + visibleCards, cards.length);
  const nextCount = firstVisible === lastVisible
    ? `${firstVisible} de ${cards.length}`
    : `${firstVisible}–${lastVisible} de ${cards.length}`;
  reviewsCount.setAttribute('aria-live', announceReviewCount ? 'polite' : 'off');
  if (reviewsCount.textContent !== nextCount) reviewsCount.textContent = nextCount;
  reviewsPrev.disabled = reviewsList.scrollLeft < 4;
  reviewsNext.disabled = reviewsList.scrollLeft + reviewsList.clientWidth >= reviewsList.scrollWidth - 4;
};

const animateVisibleReviewCards = () => {
  if (!reviewsList || prefersReducedMotion.matches) return;
  const cards = [...reviewsList.querySelectorAll('.review-card')];
  const cardWidth = getReviewCardWidth();
  const index = cardWidth ? Math.round(reviewsList.scrollLeft / cardWidth) : 0;
  const visibleCards = cardWidth ? Math.max(1, Math.round(reviewsList.clientWidth / cardWidth)) : 1;

  cards.forEach((card) => card.classList.remove('is-entering'));
  cards.slice(index, index + visibleCards).forEach((card) => {
    void card.offsetWidth;
    card.classList.add('is-entering');
  });
};

const scrollReviews = (direction) => {
  const cardWidth = getReviewCardWidth();
  const visibleCards = cardWidth ? Math.max(1, Math.round(reviewsList.clientWidth / cardWidth)) : 1;
  const amount = cardWidth * visibleCards;
  reviewsList?.scrollBy({ left: direction * amount, behavior: prefersReducedMotion.matches ? 'auto' : 'smooth' });
  window.clearTimeout(reviewAnimationTimer);
  reviewAnimationTimer = window.setTimeout(() => {
    announceReviewCount = true;
    updateReviewControls();
    animateVisibleReviewCards();
    window.setTimeout(() => {
      announceReviewCount = false;
      reviewsCount?.setAttribute('aria-live', 'off');
    }, 1000);
  }, prefersReducedMotion.matches ? 0 : 420);
};

reviewsPrev?.addEventListener('click', () => scrollReviews(-1));
reviewsNext?.addEventListener('click', () => scrollReviews(1));
reviewsList?.addEventListener('scroll', updateReviewControls, { passive: true });
window.addEventListener('resize', updateReviewControls);

const loadReviews = async () => {
  if (!reviewsList) return;
  reviewsStatus.hidden = false;

  try {
    let data;

    if (window.location.protocol === 'file:') {
      data = JSON.parse(reviewsLocalFallback?.textContent || '{}');
    } else {
      const response = await fetch('reviews.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      data = await response.json();
    }

    const reviews = Array.isArray(data.reviews) ? data.reviews.slice(0, 10) : [];
    if (!reviews.length) throw new Error('Nenhuma avaliação disponível');

    reviewsList.replaceChildren(...reviews.map(createReviewCard));
    reviewsStatus.hidden = true;
    reviewsFooter.hidden = false;

    const rating = Number(data.summary?.rating || 5).toLocaleString('pt-BR', { minimumFractionDigits: 1 });
    reviewsRating.textContent = rating;
    reviewsSummary?.querySelector('.review-stars')?.setAttribute('aria-label', `${rating} de 5 estrelas`);
    if (data.summary?.sourceUrl) reviewsSource.href = data.summary.sourceUrl;
    updateReviewControls();
  } catch (error) {
    reviewsStatus.textContent = 'Não foi possível carregar as avaliações agora.';
    console.error('Erro ao carregar avaliações:', error);
  }
};

loadReviews();
