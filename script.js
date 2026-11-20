const header = document.querySelector('[data-header]');
const menu = document.querySelector('[data-menu]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const menuClose = document.querySelector('[data-menu-close]');
const scrollTopFab = document.querySelector('[data-scroll-top]');

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

document.querySelector('[data-year]').textContent = new Date().getFullYear();

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
  reviewsCount.textContent = firstVisible === lastVisible
    ? `${firstVisible} de ${cards.length}`
    : `${firstVisible}–${lastVisible} de ${cards.length}`;
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
    updateReviewControls();
    animateVisibleReviewCards();
  }, prefersReducedMotion.matches ? 0 : 420);
};

reviewsPrev?.addEventListener('click', () => scrollReviews(-1));
reviewsNext?.addEventListener('click', () => scrollReviews(1));
reviewsList?.addEventListener('scroll', updateReviewControls, { passive: true });
window.addEventListener('resize', updateReviewControls);

const loadReviews = async () => {
  if (!reviewsList) return;

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
