const puppeteer = require(process.argv[2]);

const baseUrl = process.argv[3] || 'http://127.0.0.1:8765';
const chromePath = process.argv[4] || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const pages = ['index.html', 'colaboradores.html', 'identidade-corporativa.html'];
const failures = [];

(async () => {
const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: true,
  args: ['--no-sandbox', '--disable-gpu'],
});

try {
  for (const file of pages) {
    const page = await browser.newPage();
    await page.setViewport({ width: 320, height: 800, deviceScaleFactor: 1 });
    await page.goto(`${baseUrl}/${file}`, { waitUntil: 'networkidle0' });
    await page.evaluate(async () => {
      for (let top = 0; top < document.documentElement.scrollHeight; top += 600) {
        window.scrollTo(0, top);
        await new Promise((resolve) => setTimeout(resolve, 30));
      }
      window.scrollTo(0, 0);
    });
    await new Promise((resolve) => setTimeout(resolve, 250));

    const result = await page.evaluate(() => ({
      brokenImages: [...document.images].filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.src),
      currentPages: document.querySelectorAll('nav [aria-current="page"]').length,
      h1Count: document.querySelectorAll('h1').length,
      viewportWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      unnamedNewTabs: [...document.querySelectorAll('a[target="_blank"]')]
        .filter((link) => !`${link.getAttribute('aria-label') || ''} ${link.textContent}`.includes('abre em nova aba')).length,
    }));

    if (result.brokenImages.length) failures.push(`${file}: imagens quebradas: ${result.brokenImages.join(', ')}`);
    if (result.currentPages !== 1) failures.push(`${file}: aria-current encontrado ${result.currentPages} vezes`);
    if (result.h1Count !== 1) failures.push(`${file}: h1 encontrado ${result.h1Count} vezes`);
    if (result.scrollWidth > result.viewportWidth + 1) failures.push(`${file}: overflow horizontal em 320 px (${result.scrollWidth}px)`);
    if (result.unnamedNewTabs) failures.push(`${file}: ${result.unnamedNewTabs} links sem aviso de nova aba`);

    await page.keyboard.press('Tab');
    for (let index = 0; index < 12; index += 1) {
      const focus = await page.evaluate(() => {
        const element = document.activeElement;
        const style = getComputedStyle(element);
        return { tag: element.tagName, outline: Number.parseFloat(style.outlineWidth) || 0 };
      });
      if (focus.tag !== 'BODY' && focus.outline < 2) failures.push(`${file}: foco sem contorno de 2px em ${focus.tag}`);
      await page.keyboard.press('Tab');
    }

    await page.close();
  }

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await page.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle0' });

  await page.click('[data-menu-toggle]');
  const openState = await page.evaluate(() => ({
    expanded: document.querySelector('[data-menu-toggle]').getAttribute('aria-expanded'),
    focusInMenu: document.querySelector('[data-menu]').contains(document.activeElement),
    mainInert: document.querySelector('main').inert,
  }));
  if (openState.expanded !== 'true' || !openState.focusInMenu || !openState.mainInert) {
    failures.push(`menu móvel: estado de abertura inválido ${JSON.stringify(openState)}`);
  }

  for (let index = 0; index < 14; index += 1) {
    await page.keyboard.press('Tab');
    const trapped = await page.evaluate(() => document.querySelector('[data-menu]').contains(document.activeElement));
    if (!trapped) failures.push(`menu móvel: foco escapou na tabulação ${index + 1}`);
  }
  await page.keyboard.press('Escape');
  const closedState = await page.evaluate(() => ({
    expanded: document.querySelector('[data-menu-toggle]').getAttribute('aria-expanded'),
    focusReturned: document.activeElement === document.querySelector('[data-menu-toggle]'),
    mainInert: document.querySelector('main').inert,
  }));
  if (closedState.expanded !== 'false' || !closedState.focusReturned || closedState.mainInert) {
    failures.push(`menu móvel: estado de fechamento inválido ${JSON.stringify(closedState)}`);
  }

  const firstFaq = await page.$('#duvidas details');
  await firstFaq.$('summary').then((summary) => summary.focus());
  const beforeFaq = await firstFaq.evaluate((detail) => detail.open);
  await page.keyboard.press('Enter');
  await new Promise((resolve) => setTimeout(resolve, 500));
  const afterFaq = await firstFaq.evaluate((detail) => detail.open);
  if (beforeFaq === afterFaq) failures.push('accordion: Enter não alternou o primeiro item');

  await page.waitForSelector('[data-reviews-list] .review-card:nth-child(10)');
  const next = await page.$('[data-reviews-next]');
  await next.focus();
  const beforeReview = await page.$eval('[data-reviews-list]', (list) => list.scrollLeft);
  await page.keyboard.press('Enter');
  await new Promise((resolve) => setTimeout(resolve, 600));
  const reviewState = await page.evaluate(() => ({
    scrollLeft: document.querySelector('[data-reviews-list]').scrollLeft,
    focusStayed: document.activeElement === document.querySelector('[data-reviews-next]'),
  }));
  if (reviewState.scrollLeft <= beforeReview || !reviewState.focusStayed) failures.push(`avaliações: navegação inválida ${JSON.stringify(reviewState)}`);

  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  const reducedMotion = await page.$eval('.reveal', (element) => getComputedStyle(element).transitionDuration);
  if (reducedMotion !== '0s') failures.push(`movimento reduzido: transição ainda ativa (${reducedMotion})`);
  await page.close();
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Teste de navegador concluído sem falhas em 320 px, foco, menu, accordion, avaliações e movimento reduzido.');
}
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
