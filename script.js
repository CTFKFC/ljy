(() => {
  const data = window.YUEJI;
  const archiveGrid = document.getElementById('archive-grid');
  const poemContainer = document.getElementById('poem-container');
  const navToggle = document.querySelector('.nav-toggle');
  const header = document.querySelector('.site-header');
  const cursor = document.querySelector('.cursor');
  const loader = document.querySelector('.loader');
  const loaderCounter = document.querySelector('.loader-counter');
  const expandAllBtn = document.getElementById('expand-all');
  const collapseAllBtn = document.getElementById('collapse-all');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(pointer:fine)').matches;
  const isMobile = window.matchMedia('(max-width: 720px)').matches;
  const shouldUseLiteMode = prefersReducedMotion || isMobile;

  if (!data || !Array.isArray(data.poems) || !archiveGrid || !poemContainer) {
    console.error('YUEJI site data failed to load.');
    loader?.remove();
    const fallback = document.createElement('div');
    fallback.className = 'glass data-error';
    fallback.innerHTML = `
      <p class="overline">CONTENT ERROR</p>
      <h2>内容加载失败</h2>
      <p>请检查 <code>content.js</code> 是否存在、文件名是否正确，以及部署平台是否成功加载了该文件。</p>
    `;
    document.querySelector('#poems')?.appendChild(fallback);
    return;
  }

  const featuredTitles = new Set(['梦故人书', '夜怀知止赋', '天问', '拟天问·千朝烬', '空囊赋']);

  function createPoemMarkup(poem) {
    return poem.content
      .split(/\n\n+/)
      .map(p => `<p>${p.replace(/\n/g, '<br />')}</p>`)
      .join('');
  }

  data.poems.forEach((poem, index) => {
    const id = `poem-${index + 1}`;
    const excerpt = poem.content.replace(/\s+/g, ' ').slice(0, 42);
    const featuredClass = featuredTitles.has(poem.title) ? ' is-featured' : '';

    const slug = `${String(index + 1).padStart(2, '0')}-${poem.title.toLowerCase().replace(/[^\w\-\u4e00-\u9fff]+/g, '-').replace(/^-+|-+$/g, '') || `poem-${index + 1}`}`;
    const item = document.createElement('article');
    item.className = `archive-item glass${featuredClass}`;
    item.innerHTML = `
      <div>
        <span class="poem-index">${String(index + 1).padStart(2, '0')}</span>
        <h3>${poem.title}</h3>
      </div>
      <p>${excerpt}...</p>
      <div class="archive-actions">
        <a class="button button-secondary" href="#${id}">页内展开</a>
        <a class="button" href="poems/${slug}.html">单篇页</a>
      </div>
    `;
    archiveGrid.appendChild(item);

    const article = document.createElement('article');
    article.className = `poem-article glass${featuredClass}`;
    article.id = id;
    article.innerHTML = `
      <div class="poem-head">
        <div>
          <div class="poem-index">${String(index + 1).padStart(2, '0')} / ${data.poems.length}</div>
          <h3 class="poem-title">${poem.title}</h3>
        </div>
        <button class="button button-secondary poem-toggle" type="button" aria-expanded="false" aria-controls="${id}-content">展开正文</button>
      </div>
      <div id="${id}-content" class="poem-content" hidden>${createPoemMarkup(poem)}</div>
    `;
    poemContainer.appendChild(article);
  });

  const poemArticles = Array.from(document.querySelectorAll('.poem-article'));

  function setArticleExpanded(article, expanded) {
    const content = article.querySelector('.poem-content');
    const toggle = article.querySelector('.poem-toggle');
    if (!content || !toggle) return;
    content.hidden = !expanded;
    article.classList.toggle('is-open', expanded);
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.textContent = expanded ? '收起正文' : '展开正文';
  }

  poemArticles.forEach(article => {
    const toggle = article.querySelector('.poem-toggle');
    toggle?.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      setArticleExpanded(article, !expanded);
    });
  });

  expandAllBtn?.addEventListener('click', () => poemArticles.forEach(a => setArticleExpanded(a, true)));
  collapseAllBtn?.addEventListener('click', () => poemArticles.forEach(a => setArticleExpanded(a, false)));

  navToggle?.addEventListener('click', () => {
    const isOpen = header.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  document.querySelectorAll('.site-nav a').forEach(a => {
    a.addEventListener('click', () => {
      header.classList.remove('open');
      navToggle?.setAttribute('aria-expanded', 'false');
    });
  });

  if (!shouldUseLiteMode && window.Lenis) {
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    if (window.ScrollTrigger && window.gsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (time) => {
        lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    }
  }

  if (cursor && isFinePointer && !isMobile) {
    let mx = window.innerWidth / 2, my = window.innerHeight / 2, cx = mx, cy = my;
    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
    }, { passive: true });
    const tick = () => {
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      cursor.style.left = cx + 'px';
      cursor.style.top = cy + 'px';
      requestAnimationFrame(tick);
    };
    tick();

    document.querySelectorAll('a, button, .button').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
    });
  }

  if (isFinePointer && !isMobile) {
    document.querySelectorAll('.magnetic').forEach(el => {
      el.addEventListener('mousemove', e => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.12;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.12;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate(0,0)';
      });
    });
  }

  function initLoader() {
    if (!loader || !loaderCounter || shouldUseLiteMode || !window.gsap) {
      loader?.remove();
      return;
    }
    const progress = { value: 0 };
    const tl = gsap.timeline({ onComplete: () => loader.remove() });
    gsap.to(progress, {
      value: 100,
      duration: 0.9,
      ease: 'power2.out',
      onUpdate: () => {
        loaderCounter.textContent = `${String(Math.round(progress.value)).padStart(2, '0')}%`;
      }
    });
    tl.to(loader, { yPercent: -100, duration: 0.55, ease: 'power3.inOut', delay: 0.95 });
  }

  function initAnimations() {
    const revealNodes = document.querySelectorAll('.reveal, .reveal-up, .reveal-char, [data-reveal="stagger"] > *');
    if (!(window.gsap && window.ScrollTrigger) || shouldUseLiteMode) {
      revealNodes.forEach(el => {
        el.style.opacity = 1;
        el.style.transform = 'none';
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    gsap.fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out', delay: 0.1 });
    gsap.fromTo('.hero-subtitle, .hero-intro, .hero-actions, .overline',
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, delay: 0.2, ease: 'power2.out' }
    );

    gsap.utils.toArray('.reveal, .reveal-up, .timeline-card, .motif, .archive-item, .epilogue-panel, .prologue-panel').forEach(el => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.75,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%' }
      });
    });

    gsap.utils.toArray('[data-reveal="stagger"]').forEach(container => {
      gsap.to(container.children, {
        opacity: 1,
        y: 0,
        duration: 0.65,
        stagger: 0.05,
        ease: 'power3.out',
        scrollTrigger: { trigger: container, start: 'top 88%' }
      });
    });

    gsap.to('.moon-phase', {
      yPercent: -6,
      ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  initLoader();
  initAnimations();
})();
