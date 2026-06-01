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

  data.poems.forEach((poem, index) => {
    const id = `poem-${index + 1}`;
    const excerpt = poem.content.replace(/\s+/g, ' ').slice(0, 42);
    const featuredClass = featuredTitles.has(poem.title) ? ' is-featured' : '';

    const item = document.createElement('a');
    item.href = `#${id}`;
    item.className = `archive-item glass${featuredClass}`;
    item.innerHTML = `
      <div>
        <span class="poem-index">${String(index + 1).padStart(2, '0')}</span>
        <h3>${poem.title}</h3>
      </div>
      <p>${excerpt}...</p>
    `;
    archiveGrid.appendChild(item);

    const article = document.createElement('article');
    article.className = `poem-article glass reveal-up${featuredClass}`;
    article.id = id;
    const paragraphs = poem.content
      .split(/\n\n+/)
      .map(p => `<p>${p.replace(/\n/g, '<br />')}</p>`)
      .join('');
    article.innerHTML = `
      <div class="poem-head">
        <div>
          <div class="poem-index">${String(index + 1).padStart(2, '0')} / ${data.poems.length}</div>
          <h3 class="poem-title">${poem.title}</h3>
        </div>
        <a class="button magnetic" href="#archive">返回目录</a>
      </div>
      <div class="poem-content">${paragraphs}</div>
    `;
    poemContainer.appendChild(article);
  });

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

  if (!prefersReducedMotion && window.Lenis) {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });

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

  if (cursor && window.matchMedia('(pointer:fine)').matches) {
    let mx = window.innerWidth / 2, my = window.innerHeight / 2, cx = mx, cy = my;
    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
    });
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

  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      if (!window.matchMedia('(pointer:fine)').matches) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.18;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.18;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0,0)';
    });
  });

  function initLoader() {
    if (!loader || !loaderCounter || prefersReducedMotion || !window.gsap) {
      loader?.remove();
      return;
    }
    const progress = { value: 0 };
    const tl = gsap.timeline({
      onComplete: () => loader.remove()
    });
    gsap.to(progress, {
      value: 100,
      duration: 1.7,
      ease: 'power2.inOut',
      onUpdate: () => {
        loaderCounter.textContent = `${String(Math.round(progress.value)).padStart(2, '0')}%`;
      }
    });
    tl.to(loader, {
      yPercent: -100,
      duration: 0.8,
      ease: 'power3.inOut',
      delay: 1.9
    });
  }

  function initAnimations() {
    if (!(window.gsap && window.ScrollTrigger) || prefersReducedMotion) {
      document.querySelectorAll('.reveal, .reveal-up, .reveal-char, [data-reveal="stagger"] > *').forEach(el => {
        el.style.opacity = 1;
        el.style.transform = 'none';
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    gsap.fromTo('.hero-title', { opacity: 0, y: 55 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: 0.15 });
    gsap.fromTo('.hero-subtitle, .hero-intro, .hero-actions, .overline',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, stagger: 0.12, delay: 0.35, ease: 'power2.out' }
    );

    gsap.utils.toArray('.reveal, .reveal-up, .timeline-card, .motif, .archive-item, .poem-article, .epilogue-panel, .prologue-panel').forEach(el => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%'
        }
      });
    });

    gsap.utils.toArray('[data-reveal="stagger"]').forEach(container => {
      gsap.to(container.children, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 84%'
        }
      });
    });

    gsap.to('.moon-phase', {
      yPercent: -10,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

    gsap.to('.ambient-a', {
      x: 80,
      y: 60,
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1
      }
    });
    gsap.to('.ambient-b', {
      x: -70,
      y: -90,
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1
      }
    });
    gsap.to('.ambient-c', {
      x: 20,
      y: -40,
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5
      }
    });

    gsap.to('.ember-1', { y: -28, x: 12, repeat: -1, yoyo: true, duration: 3.2, ease: 'sine.inOut' });
    gsap.to('.ember-2', { y: -22, x: -10, repeat: -1, yoyo: true, duration: 4.2, ease: 'sine.inOut' });
    gsap.to('.ember-3', { y: -18, x: 8, repeat: -1, yoyo: true, duration: 3.6, ease: 'sine.inOut' });
  }

  initLoader();
  initAnimations();
})();