(() => {
  const data = window.YUEJI;
  const archiveGrid = document.getElementById('archive-grid');
  const poemContainer = document.getElementById('poem-container');
  const navToggle = document.querySelector('.nav-toggle');
  const header = document.querySelector('.site-header');
  const cursor = document.querySelector('.cursor');
  const loader = document.querySelector('.loader');
  const loaderCounter = document.querySelector('.loader-counter');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(pointer:fine)').matches;
  const isMobile = window.matchMedia('(max-width: 720px)').matches;
  const shouldUseLiteMode = prefersReducedMotion || isMobile;

  if (!data || !Array.isArray(data.poems) || !archiveGrid || !poemContainer) {
    loader?.remove();
    const fallback = document.createElement('div');
    fallback.className = 'glass data-error';
    fallback.innerHTML = '<p class="overline">CONTENT ERROR</p><h2>内容加载失败</h2><p>请检查 <code>content.js</code> 是否存在。</p>';
    document.querySelector('#poems')?.appendChild(fallback);
    return;
  }

  const featuredTitles = new Set(data.featured_titles || []);
  const selectedPoems = data.poems.filter(poem => featuredTitles.has(poem.title));

  data.poems.forEach((poem, index) => {
    const featuredClass = featuredTitles.has(poem.title) ? ' is-featured' : '';
    const item = document.createElement('article');
    item.className = `archive-item glass${featuredClass}`;
    item.innerHTML = `
      <div>
        <span class="poem-index">${String(index + 1).padStart(2, '0')}</span>
        <h3>${poem.title}</h3>
      </div>
      <p>${poem.excerpt || ''}</p>
      <div class="archive-actions"><a class="button" href="poems/${poem.slug}.html">进入单篇页</a></div>`;
    archiveGrid.appendChild(item);
  });

  selectedPoems.forEach((poem, localIndex) => {
    const article = document.createElement('article');
    article.className = 'poem-article glass is-featured';
    article.innerHTML = `
      <div class="poem-head">
        <div>
          <div class="poem-index">摘读 ${String(localIndex + 1).padStart(2, '0')}</div>
          <h3 class="poem-title">${poem.title}</h3>
        </div>
        <div class="archive-actions">
          <a class="button button-secondary" href="poems/${poem.slug}.html">阅读全文</a>
        </div>
      </div>
      <div class="poem-content">
        <p>${poem.excerpt || '请进入单篇页阅读正文。'}</p>
      </div>`;
    poemContainer.appendChild(article);
  });

  navToggle?.addEventListener('click', () => {
    const o = header.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(o));
  });
  document.querySelectorAll('.site-nav a').forEach(a => a.addEventListener('click', () => {
    header.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
  }));

  function initLoader() {
    if (!loader || shouldUseLiteMode) { loader?.remove(); return; }
    let progress = 0, duration = 900, start = performance.now();
    function tick(now) {
      progress = Math.min(100, Math.round(((now - start) / duration) * 100));
      if (loaderCounter) loaderCounter.textContent = `${String(progress).padStart(2, '0')}%`;
      if (progress < 100) { requestAnimationFrame(tick); return; }
      loader.style.transition = 'transform 0.55s cubic-bezier(0.77,0,0.175,1)';
      loader.style.transform = 'translateY(-100%)';
      loader.addEventListener('transitionend', () => loader.remove(), { once: true });
      setTimeout(() => { if (loader.parentNode) loader.remove(); }, 1000);
    }
    requestAnimationFrame(tick);
  }

  function initAnimations() {
    if (window.gsap && window.ScrollTrigger && !shouldUseLiteMode) {
      document.documentElement.classList.add('gsap-ready');
      gsap.registerPlugin(ScrollTrigger);
      gsap.fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out', delay: 0.1 });
      gsap.fromTo('.hero-subtitle, .hero-intro, .hero-actions, .overline', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, delay: 0.2, ease: 'power2.out' });
      gsap.utils.toArray('.reveal, .reveal-up, .timeline-card, .motif, .archive-item, .epilogue-panel, .prologue-panel, .poem-article').forEach(el => {
        gsap.to(el, { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
      });
      gsap.utils.toArray('[data-reveal="stagger"]').forEach(container => {
        gsap.to(container.children, { opacity: 1, y: 0, duration: 0.65, stagger: 0.05, ease: 'power3.out', scrollTrigger: { trigger: container, start: 'top 88%' } });
      });
      gsap.to('.moon-phase', { yPercent: -6, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
    }
  }

  if (!shouldUseLiteMode && window.Lenis) {
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    if (window.ScrollTrigger && window.gsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(time => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
    }
  }

  if (cursor && isFinePointer && !isMobile) {
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
    (function tick() {
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      cursor.style.left = cx + 'px';
      cursor.style.top = cy + 'px';
      requestAnimationFrame(tick);
    })();
    document.querySelectorAll('a, button, .button').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
    });
  }

  if (isFinePointer && !isMobile) {
    document.querySelectorAll('.magnetic').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.12}px, ${(e.clientY - r.top - r.height / 2) * 0.12}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = 'translate(0,0)'; });
    });
  }

  initLoader();
  initAnimations();
})();
